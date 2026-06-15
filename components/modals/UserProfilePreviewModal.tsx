import React from 'react';
import { User, UserRole } from '../../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function profileCompletion(u: User): number {
  const nameParts = (u.name || '').trim().split(/\s+/);
  return [
    nameParts.length >= 2 && nameParts[0] && nameParts[1] ? 15 : (nameParts[0] ? 8 : 0),
    u.email ? 20 : 0,
    u.phoneNumber ? 25 : 0,
    (u.profilePhoto && u.profilePhoto.length > 4) ? 30 : 0,
    u.city ? 10 : 0,
  ].reduce((a, b) => a + b, 0);
}

function fmtDate(d?: string) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return d; }
}

const Badge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span
    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
    style={{ background: color + '22', color, border: `1px solid ${color}44` }}
  >
    {label}
  </span>
);

const Row: React.FC<{ icon: string; label: string; value?: string | null; mono?: boolean }> = ({
  icon, label, value, mono,
}) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-base flex-shrink-0 w-5 text-center">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-0.5">{label}</p>
        <p className={`text-sm text-gray-200 break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  );
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onApprove?: (userId: number) => void;
  onReject?: (userId: number) => void;
  onEdit?: (user: User) => void;
  onBlock?: (user: User) => void;
  onViewProfile?: (user: User) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const UserProfilePreviewModal: React.FC<UserProfilePreviewModalProps> = ({
  isOpen, onClose, user, onApprove, onReject, onEdit, onBlock, onViewProfile,
}) => {
  if (!isOpen || !user) return null;

  const pct     = profileCompletion(user);
  const barColor = pct >= 80 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#E040FB';

  const approvalColor =
    user.approvalStatus === 'approved' ? '#22C55E' :
    user.approvalStatus === 'rejected' ? '#EF4444' : '#F59E0B';

  const subColor =
    user.subscriptionStatus === 'active' ? '#22C55E' :
    user.subscriptionStatus === 'past_due' ? '#EF4444' :
    user.subscriptionStatus === 'suspended' ? '#EF4444' : '#6B7280';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
        style={{
          background: '#0E0E0E',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.8)',
          maxHeight: 'min(92dvh, 92vh)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="relative flex-shrink-0">
          {/* Purple gradient banner */}
          <div
            className="h-20 w-full"
            style={{ background: 'linear-gradient(135deg, #7B61FF22, #E040FB33, #00D4FF22)' }}
          />
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            ✕
          </button>
          {/* Avatar */}
          <div className="absolute -bottom-10 left-5">
            <div
              className="w-20 h-20 rounded-full overflow-hidden"
              style={{ border: '3px solid #0E0E0E', boxShadow: '0 0 0 2px rgba(224,64,251,0.4)' }}
            >
              <img
                src={user.profilePhoto || `https://i.pravatar.cc/150?u=${user.id}`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* ── Identity ── */}
        <div className="px-5 pt-12 pb-3 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-white leading-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {user.name || '—'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-1 justify-end pt-0.5">
              <Badge label={user.role} color="#7B61FF" />
              {user.approvalStatus && (
                <Badge label={user.approvalStatus} color={approvalColor} />
              )}
              {user.status === 'blocked' && <Badge label="Blocked" color="#EF4444" />}
            </div>
          </div>

          {/* Profile completion bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">Profile Strength</span>
              <span className="text-[11px] font-bold" style={{ color: barColor }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: barColor }}
              />
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">

          {/* Subscription badge row */}
          <div className="flex flex-wrap gap-2 py-3 border-b border-white/5">
            <span className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold self-center mr-1">Subscription:</span>
            <Badge
              label={user.subscriptionStatus?.replace('_', ' ') ?? 'free tier'}
              color={subColor}
            />
            <Badge label={user.accessLevel} color="#7B61FF" />
          </div>

          {/* Detail rows */}
          <div className="mt-1">
            <Row icon="📱" label="Phone"     value={user.phoneNumber} mono />
            <Row icon="🏙️"  label="City"      value={user.city} />
            <Row icon="📅"  label="Joined"    value={fmtDate(user.joinDate)} />
            <Row icon="🎂"  label="Birthday"  value={user.dob ? fmtDate(user.dob) : null} />
            <Row icon="📸"  label="Instagram" value={user.instagramHandle ? `@${user.instagramHandle.replace(/^@/, '')}` : null} />
            <Row icon="🎵"  label="TikTok"    value={user.tiktokHandle ? `@${user.tiktokHandle.replace(/^@/, '')}` : null} />
            <Row icon="🆔"  label="User ID"   value={`#${user.id}`} mono />
            {user.bio && (
              <div className="py-2.5 border-b border-white/5 last:border-0">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1">Bio</p>
                <p className="text-sm text-gray-300 leading-relaxed">{user.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Action buttons ── */}
        {(onApprove || onReject || onEdit || onBlock || onViewProfile) && (
          <div
            className="flex-shrink-0 px-5 py-4 flex flex-wrap gap-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0E0E0E' }}
          >
            {onApprove && user.approvalStatus !== 'approved' && (
              <button
                onClick={() => { onApprove(user.id); onClose(); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)', minWidth: 90 }}
              >
                ✓ Approve
              </button>
            )}
            {onReject && user.approvalStatus !== 'rejected' && (
              <button
                onClick={() => { onReject(user.id); onClose(); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', minWidth: 90 }}
              >
                ✗ Reject
              </button>
            )}
            {onViewProfile && (
              <button
                onClick={() => { onViewProfile(user); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 text-white"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', minWidth: 90 }}
              >
                👤 View Profile
              </button>
            )}
            {onEdit && user.role !== UserRole.ADMIN && (
              <button
                onClick={() => { onEdit(user); onClose(); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{ background: 'rgba(123,97,255,0.15)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.3)', minWidth: 90 }}
              >
                ✎ Edit
              </button>
            )}
            {onBlock && user.role !== UserRole.ADMIN && (
              <button
                onClick={() => { onBlock(user); onClose(); }}
                className="py-2.5 px-4 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {user.status === 'blocked' ? '🔓 Unblock' : '🚫 Block'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
