import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from "@google/genai";
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { Spinner } from './icons/Spinner';

// --- Audio Encoding/Decoding Helpers ---
function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}
// --- End Helpers ---


interface TranscriptItem {
    id: number;
    sender: 'user' | 'gaby';
    text: string;
    isFinal: boolean;
}

export const LiveChatPage: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioResourcesRef = useRef<{
        inputAudioContext: AudioContext;
        outputAudioContext: AudioContext;
        scriptProcessor: ScriptProcessorNode;
        mediaStreamSource: MediaStreamAudioSourceNode;
        outputSources: Set<AudioBufferSourceNode>;
        nextStartTime: number;
    } | null>(null);
    const transcriptRefs = useRef<{
        currentInput: string;
        currentOutput: string;
    }>({ currentInput: '', currentOutput: '' });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const stopConversation = useCallback(() => {
        setStatus('idle');
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (audioResourcesRef.current) {
            audioResourcesRef.current.scriptProcessor.disconnect();
            audioResourcesRef.current.mediaStreamSource.disconnect();
            audioResourcesRef.current.inputAudioContext.close();
            audioResourcesRef.current.outputAudioContext.close();
            audioResourcesRef.current = null;
        }
    }, []);
    
    useEffect(() => {
        return () => {
            stopConversation();
        };
    }, [stopConversation]);

    const startConversation = async () => {
        setStatus('connecting');
        transcriptRefs.current = { currentInput: '', currentOutput: '' };
        setTranscript([]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const onMessage = async (message: LiveServerMessage) => {
                // --- Handle Transcription ---
                let inputTextChanged = false;
                let outputTextChanged = false;

                if (message.serverContent?.inputTranscription) {
                    const text = message.serverContent.inputTranscription.text;
                    transcriptRefs.current.currentInput += text;
                    inputTextChanged = true;
                }
                if (message.serverContent?.outputTranscription) {
                    const text = message.serverContent.outputTranscription.text;
                    transcriptRefs.current.currentOutput += text;
                    outputTextChanged = true;
                }

                setTranscript(prev => {
                    const newTranscript = [...prev];
                    if (inputTextChanged) {
                        const lastUser = newTranscript.filter(t => t.sender === 'user').pop();
                        if (lastUser && !lastUser.isFinal) {
                            lastUser.text = transcriptRefs.current.currentInput;
                        } else {
                            newTranscript.push({ id: Date.now(), sender: 'user', text: transcriptRefs.current.currentInput, isFinal: false });
                        }
                    }
                    if (outputTextChanged) {
                         const lastGaby = newTranscript.filter(t => t.sender === 'gaby').pop();
                        if (lastGaby && !lastGaby.isFinal) {
                            lastGaby.text = transcriptRefs.current.currentOutput;
                        } else {
                            newTranscript.push({ id: Date.now()+1, sender: 'gaby', text: transcriptRefs.current.currentOutput, isFinal: false });
                        }
                    }
                    return newTranscript;
                });

                if (message.serverContent?.turnComplete) {
                    const finalInput = transcriptRefs.current.currentInput;
                    const finalOutput = transcriptRefs.current.currentOutput;

                    setTranscript(prev => prev.map(t =>
                        (t.sender === 'user' && t.text === finalInput) ? { ...t, isFinal: true } :
                        (t.sender === 'gaby' && t.text === finalOutput) ? { ...t, isFinal: true } :
                        t
                    ));
                    
                    transcriptRefs.current = { currentInput: '', currentOutput: '' };
                }
                
                // --- Handle Audio Output ---
                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio && audioResourcesRef.current) {
                    const { outputAudioContext, outputSources, nextStartTime } = audioResourcesRef.current;
                    const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                    const source = outputAudioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputAudioContext.destination);
                    source.addEventListener('ended', () => outputSources.delete(source));
                    
                    const startTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                    source.start(startTime);
                    audioResourcesRef.current.nextStartTime = startTime + audioBuffer.duration;
                    outputSources.add(source);
                }
            };

            const onOpen = () => {
                const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                const mediaStreamSource = inputAudioContext.createMediaStreamSource(stream);
                const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                
                audioResourcesRef.current = {
                    inputAudioContext, outputAudioContext, scriptProcessor, mediaStreamSource,
                    outputSources: new Set(),
                    nextStartTime: 0,
                };
                
                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob = createBlob(inputData);
                    sessionPromiseRef.current?.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                mediaStreamSource.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContext.destination);
                setStatus('active');
            };

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: onOpen,
                    onmessage: onMessage,
                    onerror: (e) => { console.error(e); setStatus('error'); },
                    onclose: () => { console.log('closed'); stopConversation(); },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: 'You are Gaby, a personal AI nightlife concierge for a luxury app. Be friendly, chic, and helpful.',
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });

        } catch (error) {
            console.error("Error starting conversation:", error);
            setStatus('error');
        }
    };


    return (
        <div className="flex flex-col h-full bg-black animate-fade-in">
            <div className="p-4 border-b border-gray-800 text-center">
                <h1 className="text-xl font-bold text-white">Ask Gaby (Voice)</h1>
            </div>
            <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="space-y-6">
                    {transcript.map(item => (
                        <div key={item.id} className={`flex items-start gap-3 ${item.sender === 'user' ? 'justify-end' : ''}`}>
                            {item.sender === 'gaby' && (
                                <div className="w-8 h-8 flex-shrink-0 bg-amber-400 rounded-full flex items-center justify-center text-black">
                                    <SparkleIcon className="w-5 h-5" />
                                </div>
                            )}
                            <div className={`rounded-xl p-3 max-w-xs md:max-w-md ${item.sender === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-800 rounded-bl-none'} ${!item.isFinal ? 'opacity-70' : ''}`}>
                                <p className="text-white whitespace-pre-wrap text-sm">{item.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-6 bg-black border-t border-gray-800 flex flex-col items-center">
                {status === 'idle' && (
                    <button onClick={startConversation} className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
                        <MicrophoneIcon className="w-10 h-10"/>
                    </button>
                )}
                {status === 'connecting' && (
                    <div className="flex flex-col items-center gap-4 text-gray-400">
                        <Spinner className="w-10 h-10" />
                        <span>Connecting...</span>
                    </div>
                )}
                {status === 'active' && (
                     <button onClick={stopConversation} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                        <div className="w-8 h-8 bg-white rounded-md"></div>
                    </button>
                )}
                 {status === 'error' && (
                    <div className="text-center">
                        <p className="text-red-500">An error occurred. Please try again.</p>
                        <button onClick={startConversation} className="mt-4 bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Retry</button>
                    </div>
                )}
            </div>
        </div>
    );
};