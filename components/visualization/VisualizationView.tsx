import React, { useState } from 'react';
import { AnalysisState } from '../types';
import { NetworkGraph } from './NetworkGraph';
import { CodeFrequencyCharts } from './CodeFrequencyCharts';
import { KanbanBoard } from './KanbanBoard';
import { QualityMetricsDashboard } from '../analysis/QualityMetricsDashboard';
import { Project } from '../../services/projectService';
import {
  BarChart3,
  Network,
  Layout,
  Download,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Activity
} from 'lucide-react';

interface VisualizationViewProps {
  state: AnalysisState;
  setState: React.Dispatch<React.SetStateAction<AnalysisState>>;
}

export const VisualizationView: React.FC<VisualizationViewProps> = ({ state, setState }) => {
  const [activeTab, setActiveTab] = useState<'network' | 'charts' | 'kanban' | 'quality'>('network');
  const [showUnassignedCodes, setShowUnassignedCodes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handler for updating categories in Kanban board
  const handleCategoryUpdate = (updatedCategories: Project['categories']) => {
    setState(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };

  // Handler for adding a new category
  const handleAddCategory = (newCategory: Omit<Project['categories'][0], 'id'>) => {
    const categoryWithId: Project['categories'][0] = {
      ...newCategory,
      id: `cat-${Date.now()}`,
      tags: []
    };
    
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, categoryWithId]
    }));
  };

  // Handler for deleting a category
  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category? Codes will be moved to unassigned.")) {
      setState(prev => ({
        ...prev,
        categories: prev.categories.filter(cat => cat.id !== categoryId)
      }));
    }
  };

  // Handler for updating codes
  const handleCodeUpdate = (updatedCodes: Project['codes']) => {
    setState(prev => ({
      ...prev,
      codes: updatedCodes
    }));
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-[9999] bg-white' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-slate-100 border-b border-slate-200">
        <div className="flex items-center gap-1">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Visualization Dashboard
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Controls */}
          <button
            onClick={() => setShowUnassignedCodes(!showUnassignedCodes)}
            className={`p-2 rounded ${showUnassignedCodes ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'}`}
            title={showUnassignedCodes ? "Hide unassigned codes" : "Show unassigned codes"}
          >
            {showUnassignedCodes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          {/* Export Button */}
          <button
            onClick={() => {
              alert('Export functionality would be implemented here');
              // In a real implementation, this would use the visualizationExportService
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
          >
            <Download className="w-4 h-4" />
            Export View
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
            activeTab === 'network'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-slate-600 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('network')}
        >
          <Network className="w-4 h-4" />
          Network Graph
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
            activeTab === 'charts'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-slate-600 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('charts')}
        >
          <BarChart3 className="w-4 h-4" />
          Frequency Charts
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
            activeTab === 'kanban'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-slate-600 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('kanban')}
        >
          <Layout className="w-4 h-4" />
          Kanban Board
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
            activeTab === 'quality'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-slate-600 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('quality')}
        >
          <Activity className="w-4 h-4" />
          Quality Metrics
        </button>
      </div>

      {/* Visualization Content */}
      <div className="flex-1 overflow-auto p-4 bg-white">
        {activeTab === 'network' && (
          <div className="h-full">
            <div id="network-graph-container" className="w-full h-full min-h-[500px]">
              <NetworkGraph 
                codes={state.codes} 
                categories={state.categories} 
                width={isFullscreen ? window.innerWidth - 100 : 800}
                height={isFullscreen ? window.innerHeight - 200 : 600}
                onSelectNode={(type, id) => {
                  console.log(`Selected ${type} with id ${id}`);
                  // In a real implementation, this would navigate to the selected item
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'charts' && (
          <div id="frequency-charts-container" className="w-full">
            <CodeFrequencyCharts 
              codes={state.codes} 
              width={isFullscreen ? window.innerWidth - 100 : 600}
              height={isFullscreen ? window.innerHeight - 200 : 400}
            />
          </div>
        )}

        {activeTab === 'kanban' && (
          <div id="kanban-board-container" className="h-full">
            <KanbanBoard
              codes={state.codes}
              categories={state.categories}
              onCategoryUpdate={handleCategoryUpdate}
              onCodeUpdate={handleCodeUpdate}
              onCategoryAdd={handleAddCategory}
              onCategoryDelete={handleDeleteCategory}
            />
          </div>
        )}

        {activeTab === 'quality' && (
          <div id="quality-metrics-container" className="h-full">
            <QualityMetricsDashboard state={state} />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="p-2 text-xs text-slate-500 bg-slate-100 border-t border-slate-200 flex justify-between">
        <span>
          {activeTab === 'network' && 'Interactive network graph showing relationships between codes and categories'}
          {activeTab === 'charts' && `Showing frequency of ${state.codes.length} codes`}
          {activeTab === 'kanban' && `${state.categories.length} categories with ${state.codes.length} codes total`}
          {activeTab === 'quality' && 'Quality metrics analysis of coding consistency and saturation'}
        </span>
        <span>{state.codes.length} codes, {state.categories.length} categories</span>
      </div>
    </div>
  );
};