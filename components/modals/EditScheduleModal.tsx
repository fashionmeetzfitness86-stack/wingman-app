
import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Venue, Event } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { SparkleIcon } from '../icons/SparkleIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSchedule: { day: string; venueId?: number; eventId?: number | string }[];
  venues: Venue[];
  events: Event[];
  onSave: (newSchedule: { day: string; venueId?: number; eventId?: number | string }[]) => void;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type ScheduleItem = {
    type: 'venue' | 'event';
    id: number | string;
    name: string;
    image: string;
    location?: string;
};

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({ isOpen, onClose, currentSchedule, venues, events, onSave }) => {
  const [scheduleMap, setScheduleMap] = useState<Map<string, ScheduleItem[]>>(new Map());
  const [selectingDay, setSelectingDay] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'venues' | 'events'>('venues');

  useEffect(() => {
    if (isOpen) {
        const newMap = new Map<string, ScheduleItem[]>();
        WEEKDAYS.forEach(day => newMap.set(day, []));

        currentSchedule.forEach(item => {
            const dayItems = newMap.get(item.day) || [];
            if (item.venueId) {
                const venue = venues.find(v => v.id === item.venueId);
                if (venue) {
                    dayItems.push({ type: 'venue', id: venue.id, name: venue.name, image: venue.coverImage });
                }
            } else if (item.eventId) {
                const event = events.find(e => e.id === item.eventId);
                if (event) {
                    dayItems.push({ type: 'event', id: event.id, name: event.title, image: event.image });
                }
            }
            newMap.set(item.day, dayItems);
        });
        setScheduleMap(newMap);
        setSelectingDay(null);
        setSearchTerm('');
    }
  }, [isOpen, currentSchedule, venues, events]);

  const handleSave = () => {
    const newSchedule: { day: string; venueId?: number; eventId?: number | string }[] = [];
    scheduleMap.forEach((items, day) => {
        items.forEach(item => {
            if (item.type === 'venue') {
                newSchedule.push({ day, venueId: item.id as number });
            } else {
                newSchedule.push({ day, eventId: item.id });
            }
        });
    });
    onSave(newSchedule);
    onClose();
  };

  const handleRemoveItem = (day: string, indexToRemove: number) => {
      // Explicitly typing newMap or using Array.from can help if TS infers 'unknown'
      const newMap = new Map<string, ScheduleItem[]>(scheduleMap);
      const dayItems = [...(newMap.get(day) || [])];
      dayItems.splice(indexToRemove, 1);
      newMap.set(day, dayItems);
      setScheduleMap(newMap);
  };

  const handleAddItem = (item: ScheduleItem) => {
      if (!selectingDay) return;
      const newMap = new Map<string, ScheduleItem[]>(scheduleMap);
      const dayItems = [...(newMap.get(selectingDay) || [])];
      
      if (dayItems.length >= 5) {
          alert("You can only add up to 5 items per day.");
          return;
      }
      
      if (!dayItems.some(existing => existing.id === item.id && existing.type === item.type)) {
          dayItems.push(item);
          newMap.set(selectingDay, dayItems);
          setScheduleMap(newMap);
      }
      
      setSelectingDay(null); // Close selection view
      setSearchTerm('');
  };

  const filteredOptions = useMemo(() => {
      const lowerTerm = searchTerm.toLowerCase();
      if (activeTab === 'venues') {
          return venues
            .filter(v => v.name.toLowerCase().includes(lowerTerm))
            .map(v => ({ type: 'venue' as const, id: v.id, name: v.name, image: v.coverImage, location: v.location }));
      } else {
          return events
            .filter(e => e.title.toLowerCase().includes(lowerTerm))
            .map(e => ({ type: 'event' as const, id: e.id, name: e.title, image: e.image, location: e.date }));
      }
  }, [activeTab, searchTerm, venues, events]);

  if (!isOpen) return null;

  // Selection View
  if (selectingDay) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] backdrop-blur-sm animate-fade-in">
            <div className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]">
                <div className="flex items-center gap-3 p-4 border-b border-gray-800">
                    <button onClick={() => setSelectingDay(null)} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold text-white">Add to {selectingDay}</h2>
                </div>
                
                <div className="p-4 border-b border-gray-800 space-y-4">
                    <div className="flex bg-gray-800 rounded-lg p-1">
                        <button 
                            onClick={() => setActiveTab('venues')} 
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'venues' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Venues
                        </button>
                        <button 
                            onClick={() => setActiveTab('events')} 
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'events' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Events
                        </button>
                    </div>
                    <input 
                        type="search" 
                        placeholder={`Search ${activeTab}...`} 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400"
                        autoFocus
                    />
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-2">
                    {filteredOptions.map(option => (
                        <button 
                            key={`${option.type}-${option.id}`}
                            onClick={() => handleAddItem(option)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors text-left group"
                        >
                            <img src={option.image} alt={option.name} className="w-12 h-12 rounded-md object-cover" />
                            <div className="flex-grow">
                                <p className="font-bold text-white group-hover:text-amber-400 transition-colors">{option.name}</p>
                                <p className="text-xs text-gray-400">{option.location}</p>
                            </div>
                            <div className="p-2 bg-gray-700 rounded-full group-hover:bg-amber-400 group-hover:text-black transition-colors">
                                <PlusIcon className="w-4 h-4" />
                            </div>
                        </button>
                    ))}
                    {filteredOptions.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No results found.</p>
                    )}
                </div>
            </div>
        </div>
      );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Weekly Schedule" className="max-w-2xl">
      <div className="space-y-6">
        {WEEKDAYS.map(day => {
            const items = scheduleMap.get(day) || [];
            return (
                <div key={day} className="border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-300">{day}</h3>
                        {items.length < 5 && (
                            <button 
                                onClick={() => setSelectingDay(day)}
                                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                            >
                                <PlusIcon className="w-3 h-3" /> Add
                            </button>
                        )}
                    </div>
                    
                    {items.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {items.map((item, idx) => (
                                <div key={`${day}-${idx}`} className="flex items-center gap-2 bg-gray-800 pl-2 pr-2 py-1.5 rounded-lg border border-gray-700 group hover:border-gray-600 transition-colors">
                                    {item.type === 'venue' ? <LocationMarkerIcon className="w-3 h-3 text-amber-400"/> : <SparkleIcon className="w-3 h-3 text-purple-400"/>}
                                    <span className="text-sm font-medium text-white">{item.name}</span>
                                    <button 
                                        onClick={() => handleRemoveItem(day, idx)}
                                        className="ml-1 p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-600 italic">No schedule for this day.</p>
                    )}
                </div>
            );
        })}
      </div>
      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-800">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </Modal>
  );
};
