
import React from 'react';

export const WingmanLogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="wingman-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#0c224e" />
        <stop offset="100%" stopColor="#192f60" />
      </linearGradient>
    </defs>
    <path
      fill="url(#wingman-gradient)"
      d="M66.4,20.4c-6.2-6.5-14.8-10.4-24.3-10.4c-1,0-2,0.1-3,0.2c-0.2,0-0.4,0-0.6,0.1 C18.9,12.2,4.3,28.6,4.3,49.1c0,10.6,4,20.2,10.7,27.4c0.2,0.2,0.4,0.4,0.6,0.6c0,0,0,0,0,0c0.6,0.5,1.2,1,1.8,1.5 c3.3,2.4,7.1,4.2,11.2,5.2c1.1,0.3,2.2,0.5,3.3,0.6h0c1.7,0.2,3.3,0.3,5,0.3c15.8,0,29.8-9.4,36.5-23.2 C81.9,46,76.7,31.2,66.4,20.4z M50.2,64.2c-8.3,0-15-6.7-15-15s6.7-15,15-15s15,6.7,15,15S58.5,64.2,50.2,64.2z"
    />
  </svg>
);