
import React, { useState } from 'react';
import { DataExportRequest, Page } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { useTheme } from '../contexts/ThemeContext';

const EXPORT_ACCENT = '#7B61FF'; // violet

interface DataExportPageProps {
  requests: DataExportRequest[];
  onNewRequest: () => void;
  onNavigate: (page: Page) => void;
}

const getStatusInfo = (status: DataExportRequest['status']): { icon: React.ReactNode; text: string; color: string; bg: string } => {
  switch (status) {
    case 'pending':
      return { icon: <ClockIcon className="w-4 h-4" />, text: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' };
    case 'completed':
      return { icon: <CheckCircleIcon className="w-4 h-4" />, text: 'Completed', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' };
    case 'failed':
      return { icon: <ExclamationCircleIcon className="w-4 h-4" />, text: 'Failed', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
    case 'expired':
      return { icon: <ExclamationCircleIcon className="w-4 h-4" />, text: 'Expired', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };
    default:
      return { icon: <ClockIcon className="w-4 h-4" />, text: 'Unknown', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };
  }
};

export const DataExportPage: React.FC<DataExportPageProps> = ({ requests, onNewRequest, onNavigate }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleRequest = () => {
    setIsRequesting(true);
    setTimeout(() => {
      onNewRequest();
      setIsRequesting(false);
    }, 1500);
  };

  const isRequestPending = requests.some(r => r.status === 'pending');

  return (
    <div className="min-h-screen pb-32 animate-fade-in" style={{ background: 'transparent' }}>
      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 px-4 pt-5 pb-4"
        style={{
          background: isDark ? 'rgba(8,8,10,0.92)' : 'rgba(250,248,245,0.92)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={() => onNavigate('settings')}
          className="inline-flex items-center gap-2 transition-colors mb-4 text-sm font-semibold"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Back to Settings"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Settings
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-black"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--color-text)' }}
            >
              Data Export
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-sub)' }}>
              Download a copy of your personal data
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `${EXPORT_ACCENT}18`,
              border: `1px solid ${EXPORT_ACCENT}30`,
              color: EXPORT_ACCENT,
            }}
          >
            <DownloadIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6">
        {/* Export card */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--settings-row-bg)', border: '1px solid var(--settings-row-border)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${EXPORT_ACCENT}18`, border: `1px solid ${EXPORT_ACCENT}30`, color: EXPORT_ACCENT }}
            >
              <DownloadIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black" style={{ color: 'var(--color-text)' }}>Export Your Data</h2>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Request a copy of your personal data including profile information, booking history, and preferences.
                This process may take up to 24 hours.
              </p>
            </div>
          </div>

          <button
            onClick={handleRequest}
            disabled={isRequesting || isRequestPending}
            aria-label="Request Data Export"
            className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98]"
            style={
              isRequesting || isRequestPending
                ? { background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-sub)', border: '1px solid var(--color-border)', cursor: 'not-allowed' }
                : { background: EXPORT_ACCENT, color: '#fff', border: 'none', boxShadow: `0 4px 20px ${EXPORT_ACCENT}40` }
            }
          >
            {isRequesting
              ? '⏳ Requesting…'
              : isRequestPending
                ? '⏳ Request Already Pending'
                : '⬇ Request Data Export'}
          </button>
        </div>

        {/* Info pills */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Profile Info', icon: '👤' },
            { label: 'Booking History', icon: '📅' },
            { label: 'Preferences', icon: '⚙️' },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-xl p-3 flex flex-col items-center gap-1.5 text-center"
              style={{ background: 'var(--settings-row-bg)', border: '1px solid var(--settings-row-border)' }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-bold" style={{ color: 'var(--color-text-sub)' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Export History */}
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest px-1 pb-2"
            style={{ color: 'var(--color-text-sub)', letterSpacing: '0.12em' }}
          >
            Export History
          </p>

          {requests.length > 0 ? (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid var(--color-border)', background: 'var(--settings-row-bg)' }}
            >
              {requests.map((req, i) => {
                const statusInfo = getStatusInfo(req.status);
                return (
                  <div
                    key={req.id}
                    className="flex items-center gap-4 px-4 py-4"
                    style={{ borderBottom: i < requests.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: statusInfo.bg, color: statusInfo.color }}
                    >
                      {statusInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Data Export Request</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {new Date(req.requestDate).toLocaleString()}
                      </p>
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full"
                        style={{ background: statusInfo.bg, color: statusInfo.color }}
                      >
                        {statusInfo.icon}
                        {statusInfo.text}
                      </span>
                    </div>
                    {req.status === 'completed' && req.downloadUrl && (
                      <a
                        href={req.downloadUrl}
                        download
                        className="flex items-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl transition-colors"
                        style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}
                        aria-label="Download export"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        Download
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="rounded-2xl p-8 flex flex-col items-center gap-3"
              style={{ background: 'var(--settings-row-bg)', border: '1px solid var(--settings-row-border)' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: `${EXPORT_ACCENT}10`, color: EXPORT_ACCENT }}
              >
                <DownloadIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>No export requests yet</p>
              <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                Your export history will appear here once you make a request.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
