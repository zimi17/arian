import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Tag, Folder, FileText, ArrowRight, Database } from 'lucide-react';
import { AnalysisState, AnalysisStep } from '../types';
import { SearchResult, searchInAnalysisState } from '../../services/searchService';

interface SearchModalProps {
  state: AnalysisState;
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ state, isOpen, onClose, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  // Perform search when query changes
  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchInAnalysisState(state, query);
      setResults(searchResults);
      setSelectedIndex(0); // Reset selection when results change
    } else {
      setResults([]);
      setSelectedIndex(0);
    }
  }, [query, state]);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      onSelectResult(results[selectedIndex]);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };
  
  // Get icon based on result type
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'code': return <Tag className="w-4 h-4 text-blue-500" />;
      case 'category': return <Folder className="w-4 h-4 text-purple-500" />;
      case 'segment': return <FileText className="w-4 h-4 text-green-500" />;
      default: return <Database className="w-4 h-4 text-gray-500" />;
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-gray-800">Search Across Project</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Search codes, categories, or segments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        
        {/* Search Results */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {query ? 'No results found' : 'Enter a search term to get started'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                    index === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => {
                    onSelectResult(result);
                    onClose();
                  }}
                >
                  <div className="mt-0.5">
                    {getResultIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{result.content}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className={`px-1.5 py-0.5 rounded-full ${
                        result.type === 'code' ? 'bg-blue-100 text-blue-800' :
                        result.type === 'category' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                      </span>
                      <span>{result.parent}</span>
                      <span className="ml-auto">Relevance: {Math.round(result.relevance)}%</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="p-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
          <div>Use ↑↓ to navigate, Enter to select</div>
          <div>Found {results.length} results</div>
        </div>
      </div>
    </div>
  );
};