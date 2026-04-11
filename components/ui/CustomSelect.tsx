import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface Option {
  value: string;
  label: string;
  imageUrl?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder = 'Select an option' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 text-left flex items-center justify-between focus:ring-[#EC4899] focus:border-[#EC4899]">
        <div className="flex items-center gap-3 truncate">
            {selectedOption?.imageUrl && <img src={selectedOption.imageUrl} alt={selectedOption.label} className="w-6 h-6 rounded-md object-cover flex-shrink-0" />}
            <span className="truncate">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <div key={option.value} onClick={() => handleSelect(option.value)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 cursor-pointer">
                {option.imageUrl ? 
                    <img src={option.imageUrl} alt={option.label} className="w-6 h-6 rounded-md object-cover flex-shrink-0" />
                    : <div className="w-6 h-6 flex-shrink-0" />
                }
                <span className="truncate">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
