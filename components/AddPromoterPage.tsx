import React, { useState } from 'react';
import { PromoterApplication } from '../types';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';

interface PromoterApplicationPageProps {
  onApply: (application: Omit<PromoterApplication, 'id' | 'status' | 'submissionDate' | 'userId'>) => void;
  onCancel: () => void;
}

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-t border-gray-800 pt-8 mt-8">
        <h2 className="text-xl font-bold text-amber-400 mb-6">{title}</h2>
        <div className="space-y-6">{children}</div>
    </div>
);

const Input: React.FC<{ label: string; id: string; name: string; type: string; value: any; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; placeholder?: string; prefix?: string; readOnly?: boolean; }> = ({ label, id, prefix, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">{label} {props.required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            {prefix && <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">{prefix}</span>}
            <input
                id={id}
                name={id}
                className={`w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400 ${prefix ? 'pl-7' : ''}`}
                {...props}
            />
        </div>
    </div>
);

const Textarea: React.FC<{ label: string; id: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; required?: boolean; placeholder?: string; }> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">{label} {props.required && <span className="text-red-500">*</span>}</label>
        <textarea
            id={id}
            name={id}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400 resize-none"
            {...props}
        />
    </div>
);

const RadioGroup: React.FC<{ label: string; name: string; options: string[]; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; }> = ({ label, name, options, value, onChange, required }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
        <div className="space-y-2">
            {options.map(option => (
                <label key={option} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name={name} value={option} checked={value === option} onChange={onChange} className="h-4 w-4 bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500" />
                    <span className="text-white">{option}</span>
                </label>
            ))}
        </div>
    </div>
);

const CheckboxGroup: React.FC<{ label: string; groupKey: 'categories' | 'days_available'; options: string[]; values: string[]; onChange: (groupKey: 'categories' | 'days_available', value: string) => void; required?: boolean; }> = ({ label, groupKey, options, values, onChange, required }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
        <div className="grid grid-cols-2 gap-2">
            {options.map(option => (
                <label key={option} className="flex items-center gap-3 cursor-pointer bg-gray-800 p-2 rounded-md hover:bg-gray-700">
                    <input type="checkbox" checked={values.includes(option)} onChange={() => onChange(groupKey, option)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500" />
                    <span className="text-white text-sm">{option}</span>
                </label>
            ))}
        </div>
    </div>
);


export const PromoterApplicationPage: React.FC<PromoterApplicationPageProps> = ({ onApply, onCancel }) => {
    const [formData, setFormData] = useState({
        full_name: '', stage_name: '', email: '', phone: '', instagram: '', city: 'Miami', dob: '',
        experience_years: '', categories: [] as string[], venues_list: '', avg_weekly_guests: '',
        other_groups: '', other_groups_names: '', target_clientele: '', instagram_followers: '',
        tiktok_handle: '', posts_events: '', media_links: [''], days_available: [] as string[],
        preferred_categories_text: '', promote_access: '', app_tools_ok: '', signature: '',
        date_signed: new Date().toISOString().split('T')[0],
    });
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (groupKey: 'categories' | 'days_available', value: string) => {
        setFormData(prev => {
            const currentGroup = prev[groupKey];
            const newGroup = currentGroup.includes(value)
                ? currentGroup.filter(item => item !== value)
                : [...currentGroup, value];
            return { ...prev, [groupKey]: newGroup };
        });
    };
    
    const handleMediaLinksChange = (index: number, value: string) => {
        const newLinks = [...formData.media_links];
        newLinks[index] = value;
        setFormData(prev => ({...prev, media_links: newLinks}));
    };
    
    const addMediaLink = () => {
        if(formData.media_links.length < 2) {
            setFormData(prev => ({...prev, media_links: [...prev.media_links, '']}));
        }
    };

    const removeMediaLink = (index: number) => {
        setFormData(prev => ({...prev, media_links: prev.media_links.filter((_, i) => i !== index)}));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const applicationData: Omit<PromoterApplication, 'id' | 'status' | 'submissionDate' | 'userId'> = {
            fullName: formData.full_name,
            stageName: formData.stage_name,
            email: formData.email,
            phone: formData.phone,
            instagram: formData.instagram,
            city: formData.city,
            dob: formData.dob,
            profilePhotoUrl: "https://picsum.photos/seed/new-applicant/400/400", // The form doesn't handle file uploads, using a placeholder for now
            experienceYears: formData.experience_years,
            categories: formData.categories,
            venuesList: formData.venues_list,
            avgWeeklyGuests: formData.avg_weekly_guests,
            worksWithOtherGroups: formData.other_groups,
            otherGroupsNames: formData.other_groups_names,
            targetClientele: formData.target_clientele,
            instagramFollowers: formData.instagram_followers,
            otherSocials: formData.tiktok_handle,
            postsEvents: formData.posts_events,
            mediaLinks: formData.media_links.filter(link => link.trim() !== ''),
            daysAvailable: formData.days_available,
            preferredVenuesText: formData.preferred_categories_text,
            wantsToPromoteAccess: formData.promote_access,
            agreesToTools: formData.app_tools_ok,
            signature: formData.signature,
            dateSigned: formData.date_signed,
        };
        onApply(applicationData);
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in text-white">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Become a Promoter</h1>
                <p className="text-gray-400 mt-2 max-w-lg mx-auto">Join our elite team of promoters. Fill out the application below.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                
                <FormSection title="Personal Information">
                    <Input label="Full Name" id="full_name" name="full_name" type="text" value={formData.full_name} onChange={handleInputChange} required placeholder="First Last" />
                    <Input label="Promoter / Host Name" id="stage_name" name="stage_name" type="text" value={formData.stage_name} onChange={handleInputChange} placeholder="Alias or promoter name (if applicable)" />
                    <Input label="Email Address" id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="you@example.com" />
                    <Input label="Phone Number" id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required placeholder="+1 (305) 555-0123" />
                    <Input label="Instagram Handle" id="instagram" name="instagram" type="text" value={formData.instagram} onChange={handleInputChange} required prefix="@" placeholder="yourhandle" />
                    <Input label="City of Operation" id="city" name="city" type="text" value={formData.city} onChange={handleInputChange} required />
                    <Input label="Date of Birth" id="dob" name="dob" type="date" value={formData.dob} onChange={handleInputChange} required />
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Profile Photo Upload <span className="text-red-500">*</span></label>
                        <label htmlFor="profile_photo" className="cursor-pointer bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-amber-400">
                           <CloudArrowUpIcon className="w-10 h-10 text-gray-400 mb-2" />
                           <span className="text-amber-400 font-semibold">Click to upload</span>
                           <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB (professional or nightlife-appropriate)</span>
                           {profilePhoto && <span className="text-green-400 text-sm mt-2">{profilePhoto.name}</span>}
                        </label>
                        <input id="profile_photo" name="profile_photo" type="file" className="sr-only" onChange={e => setProfilePhoto(e.target.files ? e.target.files[0] : null)} accept="image/jpeg, image/png" required />
                    </div>
                </FormSection>

                <FormSection title="Experience & Network">
                    <RadioGroup label="How long have you been promoting or hosting guests?" name="experience_years" options={['Less than 1 year', '1–3 years', '3–5 years', '5+ years']} value={formData.experience_years} onChange={handleInputChange} required />
                    <CheckboxGroup label="Which types of venues or categories do you currently work with?" groupKey="categories" options={['Nightclubs', 'Restaurants', 'Pool Parties', 'Yachts / Private Events', 'Hotel Rooms / Apartments', 'Private Jets']} values={formData.categories} onChange={handleCheckboxChange} required />
                    <Textarea label="List 2–3 venues or properties you’ve collaborated with" id="venues_list" name="venues_list" value={formData.venues_list} onChange={handleInputChange} required placeholder="e.g., LIV, Papi Steak, Hyde Beach, etc." />
                    <RadioGroup label="Average number of guests you bring per week" name="avg_weekly_guests" options={['1–10', '10–30', '30–60', '60+']} value={formData.avg_weekly_guests} onChange={handleInputChange} required />
                    <RadioGroup label="Do you currently work with any other promoter groups, agencies, or concierges?" name="other_groups" options={['Yes', 'No']} value={formData.other_groups} onChange={handleInputChange} required />
                    {formData.other_groups === 'Yes' && (
                        <Input label="If yes, please name them" id="other_groups_names" name="other_groups_names" type="text" value={formData.other_groups_names} onChange={handleInputChange} />
                    )}
                    <Textarea label="Describe your target clientele" id="target_clientele" name="target_clientele" value={formData.target_clientele} onChange={handleInputChange} required placeholder="e.g., travelers, influencers, high spenders, models, etc." />
                </FormSection>
                
                <FormSection title="Social Media & Marketing">
                    <Input label="Instagram Follower Count" id="instagram_followers" name="instagram_followers" type="number" value={formData.instagram_followers} onChange={handleInputChange} required placeholder="e.g., 12000" />
                    <Input label="TikTok / Other Platforms (optional)" id="tiktok_handle" name="tiktok_handle" type="text" value={formData.tiktok_handle} onChange={handleInputChange} />
                    <RadioGroup label="Do you actively post your events or host experiences on social media?" name="posts_events" options={['Yes', 'No']} value={formData.posts_events} onChange={handleInputChange} required />
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Attach or link 1–2 recent posts, stories, or reels</label>
                        <div className="space-y-2">
                        {formData.media_links.map((link, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="url" value={link} onChange={(e) => handleMediaLinksChange(index, e.target.value)} placeholder="https://instagram.com/p/..." className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3"/>
                                {formData.media_links.length > 1 && (
                                    <button type="button" onClick={() => removeMediaLink(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full" aria-label="Remove link">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {formData.media_links.length < 2 && <button type="button" onClick={addMediaLink} className="text-sm text-amber-400 font-semibold flex items-center gap-1"><PlusIcon className="w-4 h-4" /> Add Link</button>}
                        </div>
                    </div>
                </FormSection>

                <FormSection title="Availability & Focus">
                    <CheckboxGroup label="Preferred Days to Promote / Host" groupKey="days_available" options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']} values={formData.days_available} onChange={handleCheckboxChange} required />
                    <Textarea label="Preferred Venues / Categories to Work With" id="preferred_categories_text" name="preferred_categories_text" value={formData.preferred_categories_text} onChange={handleInputChange} placeholder="e.g., luxury nightclubs, fine dining, pool lounges, yachts, etc." />
                    <RadioGroup label="Are you open to promoting TheMainKeys Access experiences (invite-only events, private bookings, etc.)?" name="promote_access" options={['Yes', 'No']} value={formData.promote_access} onChange={handleInputChange} required />
                    <RadioGroup label="Are you comfortable using TheMainKeys App for guest tracking, QR check-ins, and commission payouts?" name="app_tools_ok" options={['Yes', 'No']} value={formData.app_tools_ok} onChange={handleInputChange} required />
                </FormSection>

                <FormSection title="Agreement & Expectations">
                    <div className="text-sm text-gray-400 space-y-2">
                        <p>By submitting this application, you agree to uphold the core values of TheMainKeys:</p>
                        <ul className="list-disc list-inside pl-4 space-y-1">
                            <li>Represent the brand with professionalism, elegance, and discretion.</li>
                            <li>Respect and manage client relationships within TheMainKeys platform.</li>
                            <li>Use the official app for all bookings, guestlists, and reports.</li>
                            <li>Understand that earnings and rewards are based on verified bookings and activity.</li>
                            <li>Maintain integrity in all collaborations with venues, clients, and partners.</li>
                        </ul>
                    </div>
                    <Input label="Signature" id="signature" name="signature" type="text" value={formData.signature} onChange={handleInputChange} required placeholder="Type your full name to sign" />
                    <Input label="Date Signed" id="date_signed" name="date_signed" type="date" value={formData.date_signed} onChange={() => {}} readOnly />
                </FormSection>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onCancel} className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                    <button type="submit" className="w-full bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-300 transition-transform hover:scale-105">Submit Application</button>
                </div>
            </form>
        </div>
    );
}