import React from 'react';
import { DEFAULT_SHORTCUTS, formatKeyCombination } from '../../services/keyboardShortcutsService';

// Component to display available shortcuts
export const ShortcutsHelp: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        Keyboard Shortcuts
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {DEFAULT_SHORTCUTS.map(shortcut => (
          <div key={shortcut.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
            <div>
              <div className="font-medium text-gray-800">{shortcut.name}</div>
              <div className="text-sm text-gray-600">{shortcut.description}</div>
            </div>
            <div className="flex gap-2">
              {shortcut.keys.map((key, idx) => (
                <kbd key={idx} className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm font-mono">
                  {formatKeyCombination(key)}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};