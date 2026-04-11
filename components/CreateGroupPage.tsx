import React, { useState } from 'react';
import { AccessGroup } from '../types';

interface CreateGroupPageProps {
  onSave: (groupData: Pick<AccessGroup, 'name' | 'description' | 'coverImage'>) => void;
  onCancel: () => void;
}

export const CreateGroupPage: React.FC<CreateGroupPageProps> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description || !coverImage) {
            alert('Please fill out all fields.');
            return;
        }
        onSave({ name, description, coverImage });
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in text-white">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Create a New Group</h1>
                <p className="text-gray-400 mt-2 max-w-lg mx-auto">Create a community around a venue, vibe, or interest.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Group Name</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]" required />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]" required />
                </div>
                <div>
                    <label htmlFor="coverImage" className="block text-sm font-medium text-gray-300 mb-2">Cover Image URL</label>
                    <input type="url" id="coverImage" value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://picsum.photos/seed/..." className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]" required />
                </div>
                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onCancel} className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                    <button type="submit" className="w-full bg-[#EC4899] text-white font-bold py-3 rounded-lg hover:bg-[#f472b6] transition-transform hover:scale-105">Create Group</button>
                </div>
            </form>
        </div>
    );
};