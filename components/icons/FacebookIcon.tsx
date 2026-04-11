
import React from 'react';

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className}>
    <path fill="#1565C0" d="M24,4C12.954,4,4,12.954,4,24c0,11.046,8.954,20,20,20c11.046,0,20-8.954,20-20C44,12.954,35.046,4,24,4z" />
    <path fill="#FFF" d="M26.707,29.301h5.176l0.813-5.258h-5.989v-2.874c0-1.543,0.507-2.606,2.775-2.606l2.946-0.002V13.88c-0.513-0.068-2.269-0.219-4.316-0.219c-4.27,0-7.189,2.528-7.189,7.189v3.91h-4.832v5.258h4.832v12.835c1.86,0.301,3.774,0.301,5.634,0V29.301z" />
  </svg>
);
