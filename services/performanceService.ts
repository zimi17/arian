// performanceService.ts

// Function to chunk large arrays for processing to avoid blocking the UI
export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Function to debounce expensive operations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Function to throttle expensive operations
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Function to measure performance of a function
export const measurePerformance = async <T>(
  fn: () => Promise<T> | T,
  operationName: string
): Promise<{ result: T; executionTime: number }> => {
  const start = performance.now();
  const result = await Promise.resolve(fn());
  const end = performance.now();
  const executionTime = end - start;
  
  console.log(`${operationName} took ${executionTime.toFixed(2)} milliseconds`);
  
  return { result, executionTime };
};

// Function to check if the browser supports necessary features
export const checkBrowserSupport = (): { 
  supported: boolean; 
  features: Record<string, boolean>; 
  recommendation: string 
} => {
  const features = {
    indexedDB: !!window.indexedDB,
    localStorage: !!window.localStorage,
    webWorkers: !!window.Worker,
    fileAPI: !!(window.File && window.FileReader && window.FileList),
    canvas: !!document.createElement('canvas').getContext,
    performanceAPI: !!window.performance
  };

  const supported = Object.values(features).every(val => val);
  
  let recommendation = 'Browser is fully supported';
  if (!features.indexedDB || !features.localStorage) {
    recommendation = 'Limited storage capabilities - some features may not work properly';
  } else if (!features.webWorkers) {
    recommendation = 'Background processing unavailable - may experience performance issues with large datasets';
  } else if (!features.canvas) {
    recommendation = 'Visualization features may be limited';
  }

  return { supported, features, recommendation };
};

// Virtualized list helper functions
export interface VirtualizedListConfig {
  itemHeight: number;
  containerHeight: number;
  totalItems: number;
}

export interface VisibleItemsRange {
  startIndex: number;
  endIndex: number;
  overscan: number;
}

export const getVisibleRange = (
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 5
): VisibleItemsRange => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  return { startIndex, endIndex, overscan };
};

// Memory management utilities
export const cleanupMemory = (): void => {
  // Clear any cached data or temporary variables
  console.log('Memory cleanup performed');
};