// userPreferencesService.ts
// Interface for user preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  autoSave: boolean;
  defaultView: 'list' | 'cloud' | 'visualization';
  enableAnimations: boolean;
  showTooltips: boolean;
  language: string;
  dateFormat: string;
  exportFormat: 'json' | 'csv' | 'pdf';
  sidebarCollapsed: boolean;
  recentProjectsLimit: number;
}

// Default preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  fontSize: 'medium',
  autoSave: true,
  defaultView: 'list',
  enableAnimations: true,
  showTooltips: true,
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  exportFormat: 'json',
  sidebarCollapsed: false,
  recentProjectsLimit: 5
};

// Local storage key
const PREFERENCES_KEY = 'pdia_user_preferences';

// Get user preferences from local storage
export const getUserPreferences = (): UserPreferences => {
  try {
    const savedPreferences = localStorage.getItem(PREFERENCES_KEY);
    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences);
      // Ensure all properties exist by merging with defaults
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Error loading user preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

// Save user preferences to local storage
export const setUserPreferences = (preferences: Partial<UserPreferences>): UserPreferences => {
  try {
    const currentPreferences = getUserPreferences();
    const updatedPreferences = { ...currentPreferences, ...preferences };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updatedPreferences));
    return updatedPreferences;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

// Reset user preferences to defaults
export const resetUserPreferences = (): UserPreferences => {
  try {
    localStorage.removeItem(PREFERENCES_KEY);
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Error resetting user preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

// Apply theme preference to the document
export const applyTheme = (theme: UserPreferences['theme'] = getUserPreferences().theme): void => {
  const html = document.documentElement;
  
  if (theme === 'dark') {
    html.classList.add('dark');
  } else if (theme === 'light') {
    html.classList.remove('dark');
  } else {
    // System - check OS preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
};

// Apply font size preference to the document
export const applyFontSize = (fontSize: UserPreferences['fontSize'] = getUserPreferences().fontSize): void => {
  const html = document.documentElement;
  
  // Remove existing font size classes
  html.classList.remove('text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl');
  
  // Apply new font size class
  switch(fontSize) {
    case 'small':
      html.classList.add('text-sm'); // Using sm (14px) as small
      break;
    case 'large':
      html.classList.add('text-lg'); // Using lg (18px) as large
      break;
    case 'medium':
    default:
      html.classList.add('text-base'); // Using base (16px) as medium
      break;
  }
};

// Initialize preferences on app load
export const initializePreferences = (): void => {
  const preferences = getUserPreferences();
  applyTheme(preferences.theme);
  applyFontSize(preferences.fontSize);
};