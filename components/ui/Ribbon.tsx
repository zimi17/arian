import React from 'react';
import { LucideIcon } from 'lucide-react';

interface RibbonProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export const Ribbon: React.FC<RibbonProps> = ({ activeTab, onTabChange, children }) => {
  return (
    <div className="bg-white border-b border-slate-200 shadow-sm flex flex-col sticky top-0 z-40 select-none">
      <div className="flex px-2 border-b border-slate-100 bg-slate-50/50">
        {['Home', 'View', 'Analyze', 'Export'].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-1.5 text-xs font-medium transition-colors relative outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              activeTab === tab 
                ? 'text-blue-700 bg-white border-t-2 border-t-blue-600 border-x border-slate-200 -mb-px rounded-t-sm z-10' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="h-24 px-4 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar bg-slate-50/80 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
};

export const RibbonGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="flex flex-col h-full px-2 border-r border-slate-200 last:border-0 min-w-max animate-in fade-in zoom-in-95 duration-200">
    <div className="flex-1 flex items-center gap-1 justify-center">
      {children}
    </div>
    <div className="text-[10px] text-slate-400 text-center font-medium mt-1 uppercase tracking-wider select-none">
      {title}
    </div>
  </div>
);

export const RibbonButton: React.FC<{ 
  icon: LucideIcon; 
  label: string; 
  onClick?: () => void; 
  active?: boolean;
  disabled?: boolean;
  variant?: 'large' | 'small';
}> = ({ icon: Icon, label, onClick, active, disabled, variant = 'large' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-col items-center justify-center rounded-md transition-all duration-150 outline-none
        ${variant === 'large' ? 'h-[60px] min-w-[60px] p-1' : 'h-[28px] px-2 flex-row gap-2 w-full justify-start'}
        ${active ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300 shadow-inner' : 'hover:bg-white hover:shadow-md hover:ring-1 hover:ring-slate-200 text-slate-600 hover:text-slate-900'}
        ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'active:scale-95 active:bg-slate-100 active:shadow-inner'}
      `}
    >
      <Icon className={`
        ${variant === 'large' ? 'w-6 h-6 mb-1' : 'w-4 h-4'}
        transition-transform duration-200 group-hover:scale-110 group-active:scale-90
      `} />
      <span className={`text-[10px] font-medium leading-tight text-center ${variant === 'large' ? 'line-clamp-2' : ''}`}>
        {label}
      </span>
    </button>
  );
};