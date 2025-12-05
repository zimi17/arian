// keyboardShortcutsService.ts
import React from 'react';

// Define available shortcuts
export interface Shortcut {
  id: string;
  name: string;
  description: string;
  keys: string[]; // Array of possible key combinations
  action: () => void;
  enabled: boolean;
}

// Default shortcuts configuration
export const DEFAULT_SHORTCUTS: Shortcut[] = [
  {
    id: 'global-search',
    name: 'Global Search',
    description: 'Search across all codes, categories, and segments',
    keys: ['Control+K', 'Meta+K'],
    action: () => {
      // This will be implemented by the app
    },
    enabled: true
  },
  {
    id: 'new-project',
    name: 'New Project',
    description: 'Create a new analysis project',
    keys: ['Control+Shift+N', 'Meta+Shift+N'],
    action: () => {
      // This will be implemented by the app
    },
    enabled: true
  },
  {
    id: 'save-project',
    name: 'Save Project',
    description: 'Save the current project',
    keys: ['Control+S', 'Meta+S'],
    action: () => {
      // This will be implemented by the app
    },
    enabled: true
  },
  {
    id: 'export-project',
    name: 'Export Project',
    description: 'Export the current project',
    keys: ['Control+E', 'Meta+E'],
    action: () => {
      // This will be implemented by the app
    },
    enabled: true
  },
  {
    id: 'toggle-sidebar',
    name: 'Toggle Sidebar',
    description: 'Show/hide the sidebar',
    keys: ['Control+/', 'Meta+/'],
    action: () => {
      // This will be implemented by the app
    },
    enabled: true
  },
  {
    id: 'next-step',
    name: 'Next Analysis Step',
    description: 'Move to the next analysis phase',
    keys: ['Control+ArrowRight', 'Meta+ArrowRight'],
    action: () => {
      // This will be implemented by the app
    },
    enabled: true
  },
  {
    id: 'prev-step',
    name: 'Previous Analysis Step',
    description: 'Move to the previous analysis phase',
    keys: ['Control+ArrowLeft', 'Meta+ArrowLeft'],
    action: () => {
      // This will be implemented by the app
    },
    enabled: true
  },
  {
    id: 'add-code',
    name: 'Add New Code',
    description: 'Open dialog to add a new code',
    keys: ['Control+Shift+C', 'Meta+Shift+C'],
    action: () => {
      // This will be implemented by the app
    },
    enabled: true
  },
  {
    id: 'visualization-view',
    name: 'Visualization View',
    description: 'Switch to visualization view',
    keys: ['Control+Shift+V', 'Meta+Shift+V'],
    action: () => {
      // This will be implemented by the app
    },
    enabled: true
  }
];

// Hook to handle keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts: Shortcut[] = DEFAULT_SHORTCUTS) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Create a string representation of the pressed keys
      const keyCombination = [
        event.ctrlKey ? 'Control' : '',
        event.metaKey ? 'Meta' : '',
        event.shiftKey ? 'Shift' : '',
        event.altKey ? 'Alt' : '',
        event.key.length === 1 ? event.key.toUpperCase() : event.key
      ]
        .filter(Boolean)
        .join('+');

      // Find matching shortcuts and execute their actions
      shortcuts.forEach(shortcut => {
        if (shortcut.enabled && shortcut.keys.includes(keyCombination)) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);

  // Return function to update shortcuts
  const updateShortcut = (id: string, updates: Partial<Omit<Shortcut, 'id'>>) => {
    // In a real implementation, we would update the shortcuts array
    // For now, we'll just log this for demonstration
    console.log(`Updating shortcut ${id}:`, updates);
  };

  // Return function to toggle shortcut enabled state
  const toggleShortcut = (id: string) => {
    // In a real implementation, we would toggle the enabled state in the preferences
    console.log(`Toggling shortcut ${id}`);
  };

  return { updateShortcut, toggleShortcut };
};

// Function to format key combination for display
export const formatKeyCombination = (key: string): string => {
  return key
    .replace('Control', 'Ctrl')
    .replace('Meta', 'Cmd')
    .replace('ArrowRight', '→')
    .replace('ArrowLeft', '←')
    .replace('ArrowUp', '↑')
    .replace('ArrowDown', '↓');
};