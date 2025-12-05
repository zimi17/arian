import React from 'react';
import { CheckCircle, Database, Activity, Clock } from 'lucide-react';
import { AnalysisState } from '../../types';

export const StatusBar: React.FC<{ state: AnalysisState }> = ({ state }) => {
  return (
    <div className="h-8 bg-blue-900 text-white flex items-center justify-between px-4 text-[10px] select-none sticky bottom-0 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 opacity-80">
          <Activity className="w-3 h-3" />
          <span>Status: {state.isProcessing ? 'Processing...' : 'Ready'}</span>
        </div>
        <div className="w-px h-3 bg-white/20"></div>
        <div className="flex items-center gap-1.5 opacity-80">
          <Database className="w-3 h-3" />
          <span>Segments: {state.segments.length}</span>
        </div>
        <div className="w-px h-3 bg-white/20"></div>
        <div className="flex items-center gap-1.5 opacity-80">
          <Clock className="w-3 h-3" />
          <span>Last Action: {state.lastAction || 'System Idle'}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-green-300">
          <CheckCircle className="w-3 h-3" />
          <span>Auto-Save: On</span>
        </div>
        <div className="w-px h-3 bg-white/20"></div>
        <div className="opacity-60">
          Memory: Low
        </div>
      </div>
    </div>
  );
};
