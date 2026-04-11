
import React, { useState } from 'react';
import { DataExportRequest, Page } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { Button } from './ui/Button';

interface DataExportPageProps {
  requests: DataExportRequest[];
  onNewRequest: () => void;
  onNavigate: (page: Page) => void;
}

const getStatusInfo = (status: DataExportRequest['status']): { icon: React.ReactNode, text: string, color: string } => {
    switch (status) {
        case 'pending':
            return { icon: <ClockIcon className="w-5 h-5" />, text: 'Pending', color: 'text-amber-400' };
        case 'completed':
            return { icon: <CheckCircleIcon className="w-5 h-5" />, text: 'Completed', color: 'text-green-400' };
        case 'failed':
            return { icon: <ExclamationCircleIcon className="w-5 h-5" />, text: 'Failed', color: 'text-red-500' };
        case 'expired':
            return { icon: <ExclamationCircleIcon className="w-5 h-5" />, text: 'Expired', color: 'text-gray-500' };
        default:
            return { icon: <ClockIcon className="w-5 h-5" />, text: 'Unknown', color: 'text-gray-500' };
    }
};

export const DataExportPage: React.FC<DataExportPageProps> = ({ requests, onNewRequest, onNavigate }) => {
    const [isRequesting, setIsRequesting] = useState(false);

    const handleRequest = () => {
        setIsRequesting(true);
        // Simulate API call
        setTimeout(() => {
            onNewRequest();
            setIsRequesting(false);
        }, 1500);
    };

    const isRequestPending = requests.some(r => r.status === 'pending');

    return (
        <div className="p-4 md:p-8 animate-fade-in text-white pb-24">
            <button 
                onClick={() => onNavigate('settings')} 
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 text-sm font-semibold"
            >
                <ChevronLeftIcon className="w-5 h-5"/>
                Back to Settings
            </button>

            <h1 className="text-3xl font-bold text-white mb-6">Data Export</h1>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-2 text-white">Export Your Data</h2>
                <p className="text-gray-400 mb-6">
                    Request a copy of your personal data in a machine-readable format. This includes your profile information, booking history, and preferences. The process may take up to 24 hours. You will receive a notification when your export is ready.
                </p>
                <Button
                    onClick={handleRequest}
                    disabled={isRequesting || isRequestPending}
                    className="w-full bg-[#EC4899] text-white font-bold hover:bg-[#d8428a] disabled:bg-gray-700 disabled:text-gray-400"
                >
                    {isRequesting ? 'Requesting...' : isRequestPending ? 'Request Already Pending' : 'Request Data Export'}
                </Button>
            </div>
            
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 text-white">Export History</h3>
                <div className="space-y-3">
                    {requests.length > 0 ? requests.map(req => {
                        const statusInfo = getStatusInfo(req.status);
                        return (
                            <div key={req.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-white">Data Export Request</p>
                                    <p className="text-sm text-gray-400">Requested: {new Date(req.requestDate).toLocaleString()}</p>
                                    <div className={`flex items-center gap-2 mt-1 text-sm font-semibold ${statusInfo.color}`}>
                                        {statusInfo.icon}
                                        <span>{statusInfo.text}</span>
                                    </div>
                                </div>
                                {req.status === 'completed' && req.downloadUrl && (
                                    <a href={req.downloadUrl} download className="flex items-center gap-2 bg-green-500/20 text-green-400 font-bold py-2 px-4 rounded-lg text-sm hover:bg-green-500/40 transition-colors">
                                        <DownloadIcon className="w-5 h-5" />
                                        Download
                                    </a>
                                )}
                            </div>
                        )
                    }) : (
                        <p className="text-center text-gray-500 py-8">You have no previous data export requests.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
