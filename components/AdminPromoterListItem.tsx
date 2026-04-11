import React from 'react';
import { Promoter, User } from '../types';
import { StarIcon } from './icons/StarIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/FeatureIcons';
import { UserMinusIcon } from './icons/UserMinusIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface AdminPromoterListItemProps {
    promoter: Promoter;
    user: User;
    onEdit: (promoter: Promoter, user: User) => void;
    onDelete: (promoter: Promoter) => void;
    onPreview: (promoter: Promoter) => void;
    onSuspend: (user: User) => void;
    onViewStats?: (promoter: Promoter) => void;
}

export const AdminPromoterListItem: React.FC<AdminPromoterListItemProps> = ({ promoter, user, onEdit, onDelete, onPreview, onSuspend, onViewStats }) => {
    
    const status = user.status;

    return (
        <div className={`relative rounded-lg overflow-hidden bg-gray-900 ${status !== 'active' ? 'opacity-60' : ''}`}>
            <div className="relative z-10 w-full border border-gray-800 rounded-lg p-4 flex items-center gap-4">
                <div onClick={() => onPreview(promoter)} className="flex-grow flex items-center gap-4 text-left cursor-pointer">
                    <img className="w-14 h-14 rounded-full object-cover flex-shrink-0" src={promoter.profilePhoto} alt={promoter.name} />
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div>
                            <p className="font-bold text-white truncate">{promoter.name}</p>
                            <p className="text-sm text-gray-400">{promoter.handle}</p>
                        </div>
                        <div>
                             <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                                status === 'active' ? 'bg-green-900/50 text-green-300' :
                                status === 'suspended' ? 'bg-yellow-900/50 text-yellow-300' :
                                'bg-red-900/50 text-red-300'
                            }`}>
                                {status}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4 text-amber-400" />
                            <span className="text-white font-semibold text-sm">{promoter.rating.toFixed(1)}</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-300">{promoter.assignedVenueIds.length} Venues</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {onViewStats && (
                        <button onClick={() => onViewStats(promoter)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-md transition-colors" aria-label={`View stats for ${promoter.name}`} title="View Stats">
                            <ChartBarIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button onClick={() => onPreview(promoter)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors" aria-label={`Preview promoter ${promoter.name}`} title="Preview Profile">
                        <EyeIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onSuspend(user)} className="p-2 text-gray-400 hover:bg-gray-800 rounded-md transition-colors" aria-label={status === 'suspended' ? `Unsuspend promoter ${promoter.name}` : `Suspend promoter ${promoter.name}`} title={status === 'suspended' ? 'Unsuspend' : 'Suspend'}>
                        {status === 'suspended' ? <UserPlusIcon className="w-5 h-5 text-green-400" /> : <UserMinusIcon className="w-5 h-5 text-yellow-400" />}
                    </button>
                    <button onClick={() => onEdit(promoter, user)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors" aria-label={`Edit promoter ${promoter.name}`} title="Edit">
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(promoter)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-800 rounded-md transition-colors" aria-label={`Delete promoter ${promoter.name}`} title="Delete">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};