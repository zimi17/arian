import React, { useState } from 'react';
import { 
  User, 
  Sun, 
  Moon, 
  Monitor, 
  Save, 
  X, 
  Type, 
  Database, 
  FileText, 
  Settings, 
  RotateCcw,
  Eye,
  EyeOff,
  Palette,
  MoonStar
} from 'lucide-react';
import {
  UserPreferences,
  DEFAULT_PREFERENCES,
  setUserPreferences,
  getUserPreferences,
  resetUserPreferences,
  applyTheme,
  applyFontSize
} from '../../services/userPreferencesService';

interface UserPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserPreferencesModal: React.FC<UserPreferencesModalProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(getUserPreferences());
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      setUserPreferences(preferences);
      applyTheme(preferences.theme);
      applyFontSize(preferences.fontSize);
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const resetPrefs = resetUserPreferences();
    setPreferences(resetPrefs);
    applyTheme(resetPrefs.theme);
    applyFontSize(resetPrefs.fontSize);
  };

  const handleChange = (field: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-gray-800">User Preferences</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Theme Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-500" />
              <h4 className="font-medium text-gray-800">Theme</h4>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleChange('theme', 'light')}
                className={`p-3 rounded-lg border flex flex-col items-center ${
                  preferences.theme === 'light' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Sun className="w-5 h-5 mb-1" />
                <span className="text-xs">Light</span>
              </button>
              <button
                onClick={() => handleChange('theme', 'dark')}
                className={`p-3 rounded-lg border flex flex-col items-center ${
                  preferences.theme === 'dark' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Moon className="w-5 h-5 mb-1" />
                <span className="text-xs">Dark</span>
              </button>
              <button
                onClick={() => handleChange('theme', 'system')}
                className={`p-3 rounded-lg border flex flex-col items-center ${
                  preferences.theme === 'system' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Monitor className="w-5 h-5 mb-1" />
                <span className="text-xs">System</span>
              </button>
            </div>
          </div>

          {/* Font Size Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-gray-500" />
              <h4 className="font-medium text-gray-800">Font Size</h4>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['small', 'medium', 'large'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => handleChange('fontSize', size)}
                  className={`p-3 rounded-lg border ${
                    preferences.fontSize === size 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className={size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg'}>
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Default View Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-500" />
              <h4 className="font-medium text-gray-800">Default View</h4>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['list', 'cloud', 'visualization'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => handleChange('defaultView', view)}
                  className={`p-3 rounded-lg border ${
                    preferences.defaultView === view 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="capitalize text-sm">{view}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Export Format Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <h4 className="font-medium text-gray-800">Default Export Format</h4>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['json', 'csv', 'pdf'] as const).map(format => (
                <button
                  key={format}
                  onClick={() => handleChange('exportFormat', format)}
                  className={`p-3 rounded-lg border ${
                    preferences.exportFormat === format 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="uppercase text-sm">{format}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Other Settings
            </h4>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  checked={preferences.autoSave}
                  onChange={(e) => handleChange('autoSave', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-800">Auto Save</div>
                  <div className="text-sm text-gray-600">Automatically save project changes</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  checked={preferences.enableAnimations}
                  onChange={(e) => handleChange('enableAnimations', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-800">Enable Animations</div>
                  <div className="text-sm text-gray-600">Show transition animations</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  checked={preferences.showTooltips}
                  onChange={(e) => handleChange('showTooltips', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-800">Show Tooltips</div>
                  <div className="text-sm text-gray-600">Display help tooltips</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};