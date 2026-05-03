import React, { useState } from 'react';
import { WingmanLogo } from '../icons/WingmanLogo';

interface AgeVerificationModalProps {
  onVerified: () => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ onVerified }) => {
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');

  const handleVerify = () => {
    if (!dob) {
      setError('Please enter your date of birth.');
      return;
    }

    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime()) || birthDate.getFullYear() > new Date().getFullYear()) {
      setError('Please enter a valid date.');
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age >= 21) {
      setError('');
      onVerified();
    } else {
      setError('You must be at least 21 years old to access this platform.');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#50B6FF] z-[100] flex flex-col p-8 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="age-verification-title">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(100%) brightness(200%);
            cursor: pointer;
        }
      `}</style>
      <header className="flex items-center justify-center pt-8">
        <div className="flex items-center gap-3">
            <WingmanLogo className="w-12 h-12" />
            <h1 className="font-poppins font-black text-5xl tracking-tighter text-white" style={{letterSpacing: '-0.05em'}}>
                WINGMAN
            </h1>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col justify-center text-center">
        <h2 id="age-verification-title" className="text-4xl font-bold text-white font-poppins">Verify Your Age</h2>
        <p className="text-white/90 mt-4 max-w-sm mx-auto">
          To access the WINGMAN platform, please confirm you are of legal age.
        </p>

        <div className="mt-10 max-w-xs mx-auto w-full">
            <label htmlFor="dob" className="sr-only">Date of Birth</label>
            <div className="relative">
                <input
                    type="date"
                    id="dob"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-white/20 border-2 border-white/30 text-white text-center text-lg rounded-lg p-4 focus:ring-white focus:border-white placeholder-blue-200"
                    aria-label="Enter your date of birth"
                    max={new Date().toISOString().split("T")[0]}
                />
            </div>
            {error && <p className="text-red-100 bg-red-500/50 rounded-md p-2 text-sm mt-3 animate-fade-in">{error}</p>}
        </div>
      </main>

      <footer className="text-center pb-4">
        <p className="text-blue-100 text-sm mb-6">
            For security, you may be required to verify with a government ID later.
        </p>
        <button 
          onClick={handleVerify} 
          className="w-full max-w-xs mx-auto bg-white text-blue-600 font-bold py-4 px-4 rounded-xl transition-transform duration-200 hover:scale-105 shadow-lg shadow-blue-900/30"
        >
            Enter Platform
        </button>
        <p className="text-blue-200 text-xs mt-6">
            By proceeding, you agree to our <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a>.
        </p>
      </footer>
    </div>
  );
};