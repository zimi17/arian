import React from 'react';

export const PanelHeader: React.FC<{ title: string; icon?: React.ReactNode; actions?: React.ReactNode }> = ({ title, icon, actions }) => (
  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center shrink-0 min-h-[40px]">
    <h3 className="font-bold text-slate-700 flex items-center gap-2 text-xs uppercase tracking-wide">
      {icon} {title}
    </h3>
    <div className="flex items-center gap-1">
      {actions}
    </div>
  </div>
);

export const SidebarPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden h-full ${className}`}>
    {children}
  </div>
);

export const WorkspacePanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden h-full relative ${className}`}>
    {children}
  </div>
);
