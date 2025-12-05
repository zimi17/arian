import React, { useState, useRef, useMemo } from 'react';
import { StepProps, Segment } from '../types';
import { Upload, FileText, AlertCircle, BarChart2, Check, RefreshCw, Type, Plus, Trash2, Database, Layers } from 'lucide-react';
import { Ribbon, RibbonGroup, RibbonButton } from './ui/Ribbon';
import { PanelHeader, SidebarPanel, WorkspacePanel } from './ui/Panels';

export const InputStep: React.FC<StepProps> = ({ state, setState, onNext }) => {
  const [activeTab, setActiveTab] = useState('Home');
  const [inputText, setInputText] = useState("");
  const [datasetName, setDatasetName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- DERIVED STATE ---
  // Group segments by dataset for the sidebar list
  const datasetStats = useMemo(() => {
    const stats: Record<string, number> = {};
    state.segments.forEach(seg => {
      const name = seg.dataset || "Untitled";
      stats[name] = (stats[name] || 0) + 1;
    });
    return Object.entries(stats).map(([name, count]) => ({ name, count }));
  }, [state.segments]);

  // --- ACTIONS ---

  const handleAddDataset = () => {
    if (!inputText.trim()) return;
    
    const finalName = datasetName.trim() || `Dataset ${datasetStats.length + 1}`;
    const rawLines = inputText.split(/\n+/).filter(t => t.trim());
    
    if (rawLines.length === 0) return;

    const newSegments: Segment[] = rawLines.map((text, i) => ({
      id: `${finalName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}-${i}`,
      text: text.trim(),
      dataset: finalName,
      platform: 'Manual Input',
      timestamp: new Date().toISOString()
    }));

    setState(prev => ({
      ...prev,
      segments: [...prev.segments, ...newSegments],
      lastAction: `Added dataset: ${finalName}`
    }));

    // Reset input fields
    setInputText("");
    setDatasetName("");
  };

  const processFile = async (file: File) => {
    setState(prev => ({ ...prev, isProcessing: true, lastAction: 'Reading File...' }));
    try {
      const text = await file.text();
      let newSegments: Segment[] = [];
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

      if (file.name.endsWith('.json')) {
        const json = JSON.parse(text);

        // Check if it's a complete project export
        if (json.metadata && json.data) {
          // If user confirms, replace entire state (not just add segments)
          if (confirm("This appears to be a project file. Do you want to load it as a complete project, replacing your current work?")) {
            const projectState = await import('../services/importService').then(({ importProjectFromJSON }) =>
              importProjectFromJSON(text)
            );
            if (projectState) {
              setState(prev => ({
                ...projectState,
                isProcessing: false,
                lastAction: `Loaded project from ${file.name}`
              }));
              return;
            }
          }
        }

        // Robust parsing for various JSON structures
        const rawData = json.raw_data || json.segments || (Array.isArray(json) ? json : []);

        newSegments = rawData.map((t: any, i: number) => ({
          id: t.id || `json-${Date.now()}-${i}`,
          text: typeof t === 'string' ? t : t.text || JSON.stringify(t),
          dataset: t.dataset || json.metadata?.title || fileName, // Prioritize internal dataset name
          platform: t.platform || 'Imported JSON',
          timestamp: t.timestamp
        }));
      } else if (file.name.endsWith('.csv')) {
        // Parse CSV format
        const lines = text.split('\n');
        if (lines.length > 0) {
          // If first line looks like headers, skip it
          const hasHeaders = lines[0].toLowerCase().includes('text') ||
                            lines[0].toLowerCase().includes('segment') ||
                            lines[0].toLowerCase().includes('content');
          const startIndex = hasHeaders ? 1 : 0;

          newSegments = lines.slice(startIndex)
            .map((line, i) => {
              // Basic CSV parsing (for simple cases)
              const parts = line.split(',').map(part => part.trim().replace(/^"|"$/g, ''));
              const textContent = parts[0] || line; // Use first column or entire line

              return {
                id: `csv-${Date.now()}-${i}`,
                text: textContent,
                dataset: fileName,
                platform: 'CSV Import'
              };
            })
            .filter(segment => segment.text.trim());
        }
      } else {
        // Plain text processing
        newSegments = text.split(/\n\s*\n/).map((t, i) => ({
          id: `txt-${Date.now()}-${i}`,
          text: t.trim(),
          dataset: fileName,
          platform: 'File Import'
        })).filter(s => s.text);
      }

      if (newSegments.length === 0) throw new Error("No valid segments found.");

      setState(prev => ({
        ...prev,
        segments: [...prev.segments, ...newSegments],
        isProcessing: false,
        lastAction: `Imported ${newSegments.length} segments from ${file.name}`
      }));
    } catch (e: any) {
      setState(prev => ({ ...prev, error: `File Error: ${e.message}`, isProcessing: false }));
    }
  };

  const handleDeleteDataset = (name: string) => {
    if (confirm(`Delete dataset "${name}" and all its segments?`)) {
      setState(prev => ({
        ...prev,
        segments: prev.segments.filter(s => s.dataset !== name),
        lastAction: `Deleted dataset: ${name}`
      }));
    }
  };

  const handleResetAll = () => {
    if (confirm("Clear ALL datasets and start over?")) {
      setState(prev => ({ ...prev, segments: [], lastAction: 'Project Reset' }));
    }
  };

  const handleProceed = () => {
    if (state.segments.length === 0) {
      alert("Please add at least one dataset before processing.");
      return;
    }
    onNext(); // Proceed to Open Coding
  };

  // --- CALCULATIONS ---
  const currentWordCount = inputText.trim().split(/\s+/).length || 0;
  const totalProjectSegments = state.segments.length;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Ribbon activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'Home' && (
          <RibbonGroup title="Input Operations">
            <RibbonButton icon={Plus} label="Add Entry" onClick={handleAddDataset} disabled={!inputText.trim()} />
            <RibbonButton icon={Upload} label="Import File" onClick={() => fileInputRef.current?.click()} />
            <RibbonButton icon={RefreshCw} label="Reset Project" onClick={handleResetAll} disabled={totalProjectSegments === 0} />
          </RibbonGroup>
        )}
        
        {activeTab === 'Analyze' && (
          <RibbonGroup title="Process">
            <RibbonButton icon={Check} label="Analyze All Datasets" variant="large" onClick={handleProceed} disabled={totalProjectSegments === 0} />
          </RibbonGroup>
        )}

        {activeTab === 'View' && (
           <RibbonGroup title="Display">
             <span className="text-xs text-slate-400 italic px-2">Dataset Overview Active</span>
           </RibbonGroup>
        )}
      </Ribbon>

      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* SIDEBAR: DATASET MANAGEMENT */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <SidebarPanel className="flex-1">
            <PanelHeader title="Project Datasets" icon={<Database className="w-3 h-3 text-blue-600" />} />
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50 custom-scrollbar">
              {datasetStats.length === 0 ? (
                <div className="text-center p-6 text-slate-400 text-xs italic">
                  No datasets added yet.<br/>Use the form or upload a file.
                </div>
              ) : (
                datasetStats.map((ds) => (
                  <div key={ds.name} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded shadow-sm group hover:border-blue-300 transition-all">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-700 truncate" title={ds.name}>
                        <Layers className="w-3 h-3 inline mr-1 text-slate-400"/>
                        {ds.name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {ds.count} Segments
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteDataset(ds.name)}
                      className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Dataset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-100">
               <div className="flex justify-between items-center text-xs">
                 <span className="font-bold text-slate-600">Total Segments</span>
                 <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">{totalProjectSegments}</span>
               </div>
            </div>
          </SidebarPanel>
        </div>

        {/* MAIN WORKSPACE: INPUT FORM */}
        <WorkspacePanel className="lg:col-span-3">
          <PanelHeader title="Add New Data" icon={<FileText className="w-3 h-3 text-blue-600" />} />
          
          <div className="flex-1 flex flex-col min-h-0 p-4 gap-4">
            {/* Metadata Input */}
            <div className="flex gap-4 items-end bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
               <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dataset Name / Source Label</label>
                  <input 
                    type="text" 
                    className="w-full text-sm p-2 border border-slate-300 rounded focus:border-blue-500 outline-none"
                    placeholder="e.g., Interview Participant 1, Observation Day 2..."
                    value={datasetName}
                    onChange={e => setDatasetName(e.target.value)}
                  />
               </div>
               <div className="w-32">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Word Count</label>
                  <div className="text-sm p-2 bg-slate-50 border border-slate-200 rounded text-slate-600 font-mono">
                     {currentWordCount}
                  </div>
               </div>
            </div>

            {/* Editor & Dropzone */}
            <div className="flex-1 relative flex flex-col min-h-0 rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 transition-shadow">
              <textarea
                className="flex-1 w-full p-6 text-sm font-mono bg-white resize-none outline-none text-slate-600 leading-relaxed"
                placeholder="Paste transcript or notes here..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />
              
              {!inputText && (
                <div 
                  className={`absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm transition-all cursor-pointer
                    ${dragActive ? 'bg-blue-50 border-2 border-blue-400 border-dashed' : ''}
                  `}
                  onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                   <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600 shadow-sm">
                      <Upload className="w-8 h-8" />
                   </div>
                   <h3 className="text-sm font-bold text-slate-700">Drag & Drop File or Click to Upload</h3>
                   <p className="text-xs text-slate-400 mt-1">Supported: JSON, TXT, CSV</p>
                   <p className="text-[10px] text-slate-400 mt-4 italic">Or start typing directly in the box above</p>
                   <input type="file" ref={fileInputRef} className="hidden" accept=".json,.txt,.csv" onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} />
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="flex justify-end gap-2">
               <button 
                 onClick={() => { setInputText(""); setDatasetName(""); }} 
                 className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                 disabled={!inputText}
               >
                 Clear Input
               </button>
               <button 
                 onClick={handleAddDataset}
                 disabled={!inputText.trim()}
                 className={`px-6 py-2 text-xs font-bold text-white rounded shadow-sm flex items-center gap-2 transition-all
                   ${!inputText.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'}
                 `}
               >
                 <Plus className="w-4 h-4" />
                 Add to Project
               </button>
            </div>
          </div>
        </WorkspacePanel>
      </div>
    </div>
  );
};