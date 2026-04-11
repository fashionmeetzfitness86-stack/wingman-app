
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CartItem, GuestlistJoinRequest, User, Promoter } from '../../types';
import { DownloadIcon } from '../icons/DownloadIcon';
import { ToggleSwitch } from '../ui/ToggleSwitch';

interface PromoterDataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoter: Promoter;
  bookedItems: CartItem[];
  guestlistRequests: GuestlistJoinRequest[];
  referredUsers: User[];
  venues: { id: number; name: string }[];
}

export const PromoterDataExportModal: React.FC<PromoterDataExportModalProps> = ({
  isOpen,
  onClose,
  promoter,
  bookedItems,
  guestlistRequests,
  referredUsers,
  venues,
}) => {
  // Default to first day of current month and today
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(today);
  const [includeBookings, setIncludeBookings] = useState(true);
  const [includeGuestlists, setIncludeGuestlists] = useState(true);
  const [includeReferrals, setIncludeReferrals] = useState(true);

  const getVenueName = (id: number) => venues.find(v => v.id === id)?.name || 'Unknown Venue';

  const generateCSV = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    const rows: string[] = [];
    const headers = ['Type', 'Date', 'Name', 'Venue', 'Status', 'Amount/Value', 'Details'];
    rows.push(headers.join(','));

    // Process Bookings
    if (includeBookings) {
      bookedItems.forEach(item => {
        const itemDateStr = item.sortableDate || item.date; // Use event date
        if (!itemDateStr) return;
        
        const itemDate = new Date(itemDateStr);
        if (itemDate >= start && itemDate <= end) {
            // Ensure it belongs to this promoter
            if (item.tableDetails?.promoter?.id === promoter.id) {
                const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
                const guestName = item.tableDetails?.guestDetails?.name || 'Guest';
                const venueName = item.tableDetails?.venue.name || 'N/A';
                
                rows.push([
                    'Booking',
                    itemDateStr,
                    `"${guestName}"`,
                    `"${venueName}"`,
                    'Confirmed',
                    price || 0,
                    `"${item.name} - ${item.tableDetails?.tableOption?.name || 'Table'}"`
                ].join(','));
            }
        }
      });
    }

    // Process Guestlists
    if (includeGuestlists) {
      guestlistRequests.forEach(req => {
        const reqDate = new Date(req.date);
        // Fix timezone offset for comparison by treating req.date as local YYYY-MM-DD
        const reqDateLocal = new Date(req.date + 'T00:00:00');

        if (reqDateLocal >= start && reqDateLocal <= end) {
             if (req.promoterId === promoter.id || promoter.assignedVenueIds.includes(req.venueId)) {
                 // Find user details if possible, otherwise use placeholder
                 // Note: Ideally we'd pass the full user object list to map IDs to names, 
                 // but relying on ID if user object isn't directly linked in request type here.
                 // For this component, we might need to pass 'users' prop or just use ID.
                 // Let's assume the passed `guestlistRequests` might need user mapping or we just list the ID/Status.
                 const venueName = getVenueName(req.venueId);
                 
                 rows.push([
                    'Guestlist',
                    req.date,
                    `"User ID: ${req.userId}"`, // Simplified for export
                    `"${venueName}"`,
                    req.attendanceStatus,
                    0,
                    `"Status: ${req.status}"`
                 ].join(','));
             }
        }
      });
    }

    // Process Referrals
    if (includeReferrals) {
        referredUsers.forEach(user => {
            if (user.joinDate) {
                const joinDate = new Date(user.joinDate);
                if (joinDate >= start && joinDate <= end) {
                    rows.push([
                        'Referral',
                        user.joinDate,
                        `"${user.name}"`,
                        'N/A',
                        user.status,
                        '500 pts', // Example reward
                        `"${user.email}"`
                    ].join(','));
                }
            }
        });
    }

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `promoter_report_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Performance Data">
      <div className="space-y-6">
        <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Date Range</h3>
            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Start Date" 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)} 
                />
                <Input 
                    label="End Date" 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)} 
                />
            </div>
        </div>

        <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Include Data</h3>
            <div className="space-y-3 bg-gray-900 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Table Bookings</span>
                    <ToggleSwitch checked={includeBookings} onChange={() => setIncludeBookings(!includeBookings)} label="Bookings" />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Guestlist Entries</span>
                    <ToggleSwitch checked={includeGuestlists} onChange={() => setIncludeGuestlists(!includeGuestlists)} label="Guestlists" />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-white font-medium">New Referrals</span>
                    <ToggleSwitch checked={includeReferrals} onChange={() => setIncludeReferrals(!includeReferrals)} label="Referrals" />
                </div>
            </div>
        </div>

        <div className="pt-4 flex gap-3">
            <Button variant="secondary" onClick={onClose} className="w-full">Cancel</Button>
            <Button onClick={generateCSV} className="w-full flex items-center justify-center gap-2">
                <DownloadIcon className="w-5 h-5" />
                Download CSV
            </Button>
        </div>
      </div>
    </Modal>
  );
};
