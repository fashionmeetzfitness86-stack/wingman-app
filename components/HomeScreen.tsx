
import React from 'react';
import { Page, User, UserRole } from '../types';
import { WingmanLogo } from './icons/WingmanLogo';
import { PromotersIcon } from './icons/PromotersIcon';
import { BookIcon } from './icons/BookIcon';
import { ClockIcon } from './icons/ClockIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { MenuIcon } from './icons/MenuIcon';

interface HomeScreenProps {
  onNavigate: (page: Page) => void;
  currentUser: User;
  onOpenMenu?: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; onClick?: () => void; }> = ({ icon, title, subtitle, onClick }) => (
  <button onClick={onClick} className="bg-[var(--color-card)] p-5 rounded-3xl text-left w-full h-full flex flex-col justify-between shadow-lg hover:border-white/80 transition-colors" aria-label={`${title}: ${subtitle}`}>
    <div>
        <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="font-bold text-[var(--color-card-foreground)] text-xl font-poppins">{title}</h3>
    </div>
    <p className="text-[var(--color-text-muted)] text-base">{subtitle}</p>
  </button>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, currentUser, onOpenMenu }) => {
    const handleWingmanLinkClick = () => {
        if (currentUser.role === UserRole.ADMIN) {
            onNavigate('adminDashboard');
        } else {
            onNavigate('promoterApplication');
        }
    };

    return (
        <div className="p-6 pt-8 animate-fade-in min-h-screen flex flex-col bg-transparent">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <WingmanLogo className="w-10 h-10" />
                    <h1 className="font-poppins font-black text-4xl tracking-tighter text-[var(--color-foreground)]" style={{letterSpacing: '-0.05em'}}>
                        WINGMAN
                    </h1>
                </div>
                {onOpenMenu && (
                    <button onClick={onOpenMenu} className="p-2 rounded-full text-white hover:bg-white/10 transition-colors" aria-label="Open menu">
                        <MenuIcon className="w-8 h-8" />
                    </button>
                )}
            </header>
            
            <div className="flex-grow flex flex-col md:justify-center">
                <div className="text-left mb-8">
                    <p className="font-poppins text-2xl font-medium text-[var(--color-foreground)]/80">
                        Let's plan your next luxury experience.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FeatureCard 
                        icon={<PromotersIcon className="w-7 h-7 text-[var(--color-primary)]" />} 
                        title="Promoters" 
                        subtitle="Connect with our team"
                        onClick={() => onNavigate('directory')}
                    />
                    <FeatureCard 
                        icon={<BookIcon className="w-7 h-7 text-[var(--color-primary)]" />} 
                        title="Book a Table" 
                        subtitle="Reserve your spot at top venues."
                        onClick={() => onNavigate('bookATable')}
                    />
                    <FeatureCard 
                        icon={<ClockIcon className="w-7 h-7 text-[var(--color-primary)]" />} 
                        title="Event Timeline" 
                        subtitle="Discover upcoming events."
                        onClick={() => onNavigate('eventTimeline')}
                    />
                    <FeatureCard 
                        icon={<SparkleIcon className="w-7 h-7 text-[var(--color-primary)]" />} 
                        title="Exclusive Experiences" 
                        subtitle="Access elite event packages."
                        onClick={() => onNavigate('exclusiveExperiences')}
                    />
                </div>
            </div>

            <footer className="text-center mt-auto pt-8">
            </footer>
        </div>
    );
};
