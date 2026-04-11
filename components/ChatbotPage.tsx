import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Content } from "@google/genai";
import { SendIcon } from './icons/SendIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';

interface GroundingChunk {
  web?: { uri: string; title: string; };
  maps?: { uri: string; title: string; };
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'gaby';
    groundingChunks?: GroundingChunk[];
}

interface ChatbotPageProps {
    initialPrompt?: string;
}

const GabyMessage: React.FC<{ message: Message }> = ({ message }) => (
    <div className="flex items-start gap-3">
        <div className="w-8 h-8 flex-shrink-0 bg-amber-400 rounded-full flex items-center justify-center text-black">
            <SparkleIcon className="w-5 h-5" />
        </div>
        <div className="bg-gray-800 rounded-xl rounded-bl-none p-4 max-w-xs md:max-w-md">
            <p className="text-white whitespace-pre-wrap">{message.text}</p>
            {message.groundingChunks && message.groundingChunks.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-gray-700 pt-3">
                    <p className="text-xs font-semibold text-gray-400">Sources:</p>
                    {message.groundingChunks.map((chunk, index) => {
                        const source = chunk.maps || chunk.web;
                        if (!source) return null;
                        return (
                            <a
                                key={index}
                                href={source.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-amber-300 hover:underline"
                            >
                                <LocationMarkerIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{source.title}</span>
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
);

const UserMessage: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex justify-end">
        <div className="bg-blue-600 rounded-xl rounded-br-none p-4 max-w-xs md:max-w-md">
            <p className="text-white whitespace-pre-wrap">{text}</p>
        </div>
    </div>
);

const TypingIndicator: React.FC = () => (
    <div className="flex items-start gap-3">
        <div className="w-8 h-8 flex-shrink-0 bg-amber-400 rounded-full flex items-center justify-center text-black">
            <SparkleIcon className="w-5 h-5" />
        </div>
        <div className="bg-gray-800 rounded-xl rounded-bl-none p-4">
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    </div>
);

const initialHistory: Content[] = [
    {
      role: 'user',
      parts: [{ text: "Hello!" }]
    },
    {
      role: 'model',
      parts: [{ text: "Hello! I'm Gaby, your personal AI nightlife concierge. How can I help you plan the perfect night out in Miami?" }]
    }
];

export const ChatbotPage: React.FC<ChatbotPageProps> = ({ initialPrompt }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello! I'm Gaby, your personal AI nightlife concierge. How can I help you plan the perfect night out in Miami?", sender: 'gaby' }
    ]);
    const [history, setHistory] = useState<Content[]>(initialHistory);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const ai = useRef<GoogleGenAI | null>(null);

    useEffect(() => {
        try {
            ai.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        } catch (error) {
            console.error("Failed to initialize AI:", error);
            setMessages(prev => [...prev, {id: 2, text: "I'm having trouble connecting right now. Please check your configuration.", sender: 'gaby'}]);
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.warn("Could not get user location:", error.message);
            }
        );

    }, []);

    useEffect(() => {
        if (initialPrompt) {
            setInputValue(initialPrompt);
        }
    }, [initialPrompt]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading || !ai.current) return;

        const userText = inputValue;
        const userMessage: Message = { id: Date.now(), text: userText, sender: 'user' };
        
        const newHistory: Content[] = [...history, { role: 'user', parts: [{ text: userText }] }];

        setMessages(prev => [...prev, userMessage]);
        setHistory(newHistory);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await ai.current.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: newHistory,
                config: {
                  tools: [{ googleMaps: {} }],
                },
                toolConfig: location ? {
                    retrievalConfig: {
                      latLng: location
                    }
                } : undefined,
            });
            
            const gabyResponseText = response.text;
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            
            const gabyMessage: Message = {
                id: Date.now() + 1,
                text: gabyResponseText,
                sender: 'gaby',
                groundingChunks,
            };
            
            setMessages(prev => [...prev, gabyMessage]);
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: gabyResponseText }] }]);

        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            const errorResponse: Message = { id: Date.now() + 1, text: "I'm having a little trouble connecting right now. Please try again in a moment.", sender: 'gaby' };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="space-y-6">
                    {messages.map(msg =>
                        msg.sender === 'gaby' ? (
                            <GabyMessage key={msg.id} message={msg} />
                        ) : (
                            <UserMessage key={msg.id} text={msg.text} />
                        )
                    )}
                    {isLoading && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 md:p-6 bg-black border-t border-gray-800">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask Gaby anything..."
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400"
                        aria-label="Chat input"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading}
                        className="w-12 h-12 flex-shrink-0 bg-amber-400 rounded-full flex items-center justify-center text-black disabled:bg-gray-600 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};