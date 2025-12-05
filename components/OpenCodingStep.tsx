import React, { useState, useEffect } from 'react';
import { StepProps, Code } from '../types';
import { Tag, Quote, Search, Filter, Play, Trash2, Cloud, List, Plus, Edit2, Merge, Split, CheckSquare, Square, X, Save, Layers, BarChart3 } from 'lucide-react';
import { Ribbon, RibbonGroup, RibbonButton } from './ui/Ribbon';
import { PanelHeader, SidebarPanel, WorkspacePanel } from './ui/Panels';
import { WordCloudDisplay } from './WordCloudDisplay';
import { VisualizationView } from './visualization/VisualizationView';

export const OpenCodingStep: React.FC<StepProps> = ({ state, setState, onNext }) => {
  const [activeTab, setActiveTab] = useState('Home');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterText, setFilterText] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'cloud' | 'visualization'>('list');

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Initialize selected code from state when component mounts or selectedCodeId changes
  useEffect(() => {
    if (state.selectedCodeId) {
      setSelectedIds(new Set([state.selectedCodeId]));
      // Clear the selection after setting it to avoid persistent selection
      setState(prev => ({ ...prev, selectedCodeId: undefined }));
    }
  }, [state.selectedCodeId, setState]);

  // --- DERIVED STATE ---
  const filteredCodes = state.codes.filter(c => c.name.toLowerCase().includes(filterText.toLowerCase()));
  
  const primarySelectedId = Array.from(selectedIds).pop();
  const primaryCode = state.codes.find(c => c.id === primarySelectedId);
  
  const auditSegments = primaryCode 
    ? primaryCode.segmentIds.map(id => state.segments.find(s => s.id === id)).filter(Boolean)
    : [];

  // --- SELECTION HELPERS ---
  const toggleSelection = (id: string, multi: boolean) => {
    const newSet = new Set(multi ? selectedIds : []);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
    if (editingId && editingId !== id) cancelEdit();
  };

  const selectAll = () => {
    if (selectedIds.size === filteredCodes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCodes.map(c => c.id)));
    }
  };

  // --- MANIPULATION ACTIONS ---

  // 1. ADD
  const handleAdd = () => {
    const name = prompt("Enter new code name:");
    if (name && name.trim()) {
      const newCode: Code = {
        id: `manual-${Date.now()}`,
        name: name.trim(),
        frequency: 0,
        segmentIds: [],
        description: "Manually added code"
      };
      setState(prev => ({
        ...prev,
        codes: [newCode, ...prev.codes],
        lastAction: "Added Manual Code"
      }));
      setSelectedIds(new Set([newCode.id]));
      setEditingId(newCode.id);
      setEditName(newCode.name);
    }
  };

  // 2. EDIT / RENAME
  const startEdit = () => {
    if (primarySelectedId) {
      setEditingId(primarySelectedId);
      setEditName(primaryCode?.name || "");
    }
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      setState(prev => ({
        ...prev,
        codes: prev.codes.map(c => c.id === editingId ? { ...c, name: editName.trim() } : c),
        lastAction: `Renamed code to ${editName}`
      }));
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  // 3. DELETE
  const handleDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Delete ${selectedIds.size} selected codes?`)) {
      setState(prev => ({
        ...prev,
        codes: prev.codes.filter(c => !selectedIds.has(c.id)),
        lastAction: `Deleted ${selectedIds.size} codes`
      }));
      setSelectedIds(new Set());
    }
  };

  // 4. MERGE
  const handleMerge = () => {
    if (selectedIds.size < 2) return;
    const codesToMerge = state.codes.filter(c => selectedIds.has(c.id));
    const defaultName = codesToMerge[0].name;
    const newName = prompt(`Merge ${codesToMerge.length} codes into:`, defaultName);
    
    if (newName) {
      const allSegments = new Set<string>();
      codesToMerge.forEach(c => {
        c.segmentIds.forEach(id => allSegments.add(id));
      });
      const totalFreq = codesToMerge.reduce((acc, c) => acc + c.frequency, 0);
      
      const newCode: Code = {
        id: `merged-${Date.now()}`,
        name: newName,
        frequency: totalFreq,
        segmentIds: Array.from(allSegments),
        description: `Merged from: ${codesToMerge.map(c => c.name).join(', ')}`
      };

      setState(prev => ({
        ...prev,
        codes: [newCode, ...prev.codes.filter(c => !selectedIds.has(c.id))],
        lastAction: "Merged Codes"
      }));
      setSelectedIds(new Set([newCode.id]));
    }
  };

  // 5. SPLIT (DUPLICATE)
  const handleSplit = () => {
    if (!primaryCode) return;
    const newName = prompt(`Duplicate "${primaryCode.name}" as:`, `${primaryCode.name} (Copy)`);
    if (newName) {
      const newCode: Code = {
        ...primaryCode,
        id: `split-${Date.now()}`,
        name: newName
      };
      setState(prev => ({
        ...prev,
        codes: [...prev.codes, newCode],
        lastAction: "Duplicated Code"
      }));
    }
  };

  // 6. EXCLUDE
  const handleExclude = () => {
    if (selectedIds.size === 0) return;
    const targets = state.codes.filter(c => selectedIds.has(c.id));
    if (confirm(`Exclude ${targets.length} codes and add to stoplist?`)) {
      const names = targets.map(c => c.name);
      setState(prev => ({
        ...prev,
        excludeKeywords: [...prev.excludeKeywords, ...names],
        codes: prev.codes.filter(c => !selectedIds.has(c.id)),
        lastAction: `Excluded ${names.length} keywords`
      }));
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Ribbon activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'Home' && (
          <RibbonGroup title="Code Actions">
             <RibbonButton icon={Plus} label="Add Code" onClick={handleAdd} />
             <RibbonButton icon={Edit2} label="Rename" disabled={selectedIds.size !== 1} onClick={startEdit} />
             <RibbonButton icon={Trash2} label="Delete" disabled={selectedIds.size === 0} onClick={handleDelete} />
             <RibbonButton icon={Split} label="Duplicate" disabled={selectedIds.size !== 1} onClick={handleSplit} />
          </RibbonGroup>
        )}

        {activeTab === 'View' && (
          <RibbonGroup title="Display Options">
            <RibbonButton icon={List} label="List View" active={viewMode === 'list'} onClick={() => setViewMode('list')} />
            <RibbonButton icon={Cloud} label="Word Cloud" active={viewMode === 'cloud'} onClick={() => setViewMode('cloud')} />
            <RibbonButton icon={BarChart3} label="Visualization" active={viewMode === 'visualization'} onClick={() => setViewMode('visualization')} />
          </RibbonGroup>
        )}
        
        {activeTab === 'Analyze' && (
          <>
            <RibbonGroup title="Refinement">
               <RibbonButton icon={Merge} label="Merge" disabled={selectedIds.size < 2} onClick={handleMerge} />
               <RibbonButton icon={Filter} label="Exclude" disabled={selectedIds.size === 0} onClick={handleExclude} />
            </RibbonGroup>
            <RibbonGroup title="Phase">
               <RibbonButton icon={Play} label="Axial Coding" variant="large" onClick={onNext} />
            </RibbonGroup>
          </>
        )}

        {activeTab === 'Export' && (
          <RibbonGroup title="Data">
             <RibbonButton icon={Save} label="Export Codes (JSON)" onClick={() => {
               import('../services/exportService').then(({ exportCodesAsJSON, downloadFile }) => {
                 const content = exportCodesAsJSON(state.codes);
                 downloadFile(content, 'codes.json', 'application/json');
               });
             }} />
             <RibbonButton icon={Save} label="Export Codes (CSV)" onClick={() => {
               import('../services/exportService').then(({ exportCodesAsCSV, downloadFile }) => {
                 const content = exportCodesAsCSV(state.codes);
                 downloadFile(content, 'codes.csv', 'text/csv');
               });
             }} />
          </RibbonGroup>
        )}
      </Ribbon>

      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-0">
        
        {/* COLUMN 1: CODE LIST */}
        <SidebarPanel className="md:col-span-1">
          <PanelHeader 
            title="Code List" 
            icon={<Tag className="w-3 h-3 text-blue-600" />} 
            actions={
              <div className="flex items-center gap-2">
                <button onClick={selectAll} className="text-[10px] text-blue-600 hover:underline">
                  {selectedIds.size === filteredCodes.length ? 'None' : 'All'}
                </button>
                <div className="text-[10px] bg-slate-100 px-1.5 rounded font-mono">{filteredCodes.length}</div>
              </div>
            } 
          />
          
          <div className="p-2 bg-slate-50 border-b border-slate-100">
             <div className="relative">
               <Search className="absolute left-2 top-2 w-3 h-3 text-slate-400" />
               <input 
                  className="w-full pl-7 pr-2 py-1.5 text-xs rounded border border-slate-200 outline-none focus:border-blue-400"
                  placeholder="Filter or search codes..."
                  value={filterText}
                  onChange={e => setFilterText(e.target.value)}
               />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-1 custom-scrollbar max-h-[500px]">
             {filteredCodes.map(code => {
               const isSelected = selectedIds.has(code.id);
               const isEditingThis = editingId === code.id;

               return (
                 <div
                   key={code.id}
                   className={`w-full text-left p-2 rounded mb-0.5 text-xs flex items-center justify-between transition-all group border border-transparent
                     ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-slate-50'}
                   `}
                 >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        onClick={() => toggleSelection(code.id, true)}
                        className="text-slate-400 hover:text-blue-600 focus:outline-none"
                      >
                        {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5" />}
                      </button>

                      {isEditingThis ? (
                        <input
                          autoFocus
                          className="flex-1 bg-white border border-blue-300 rounded px-1 py-0.5 text-xs outline-none"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          onBlur={saveEdit}
                        />
                      ) : (
                        <span
                          className="truncate font-medium cursor-pointer flex-1"
                          onClick={() => toggleSelection(code.id, false)}
                          onDoubleClick={() => {
                            setSelectedIds(new Set([code.id]));
                            setEditingId(code.id);
                            setEditName(code.name);
                          }}
                        >
                          {code.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-400'}`}>
                        {code.frequency}
                      </span>
                    </div>
                 </div>
               );
             })}
          </div>
        </SidebarPanel>

        {/* COLUMN 2: SEGMENT VIEWER */}
        <WorkspacePanel className="md:col-span-1 lg:col-span-2">
           <PanelHeader
              title={viewMode === 'cloud' ? "Frequency Visualization" : viewMode === 'visualization' ? "Interactive Visualizations" : `Segments for "${primaryCode?.name || 'Selection'}"`}
              icon={viewMode === 'cloud' ? <Cloud className="w-3 h-3"/> : viewMode === 'visualization' ? <BarChart3 className="w-3 h-3"/> : <Quote className="w-3 h-3"/>}
           />
           
           {viewMode === 'cloud' ? (
             <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/30">
                <WordCloudDisplay words={state.codes.map(c => ({ text: c.name, value: c.frequency }))} width={600} height={400} maxWords={60} />
             </div>
           ) : viewMode === 'visualization' ? (
             <div className="flex-1 overflow-y-auto p-4">
               <div className="h-[600px]">
                 <VisualizationView state={state} setState={setState} />
               </div>
             </div>
           ) : (
             <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar space-y-6">
                {primaryCode ? (
                  auditSegments.length > 0 ? (
                    auditSegments.map((seg, i) => seg && (
                      <div key={i} className="group relative pl-4 border-l-2 border-slate-200 hover:border-blue-400 transition-colors">
                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-400 transition-colors" />

                        {/* Dataset Badge */}
                        <div className="mb-2">
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                             <Layers className="w-2.5 h-2.5" />
                             {seg.dataset || "Unknown Source"}
                          </span>
                        </div>

                        <p className="text-sm text-slate-700 leading-relaxed font-serif">"{seg.text}"</p>

                        <div className="mt-2 flex gap-2">
                           <span className="text-[10px] text-slate-400 px-1">{seg.platform}</span>
                           <span className="text-[10px] text-slate-400 font-mono">ID: {seg.id}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                     <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <p className="text-sm">This code has no associated text segments yet.</p>
                     </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300">
                     <Search className="w-12 h-12 mb-2 opacity-20" />
                     <p className="text-sm">Select a single code to view its context</p>
                     {selectedIds.size > 1 && <p className="text-xs text-blue-400 mt-2">({selectedIds.size} codes selected)</p>}
                  </div>
                )}
             </div>
           )}
        </WorkspacePanel>

        {/* COLUMN 3: DETAILS */}
        <SidebarPanel className="md:col-span-1">
           <PanelHeader title="Selection Details" icon={<Tag className="w-3 h-3 text-emerald-600"/>} />
           <div className="p-4 space-y-4">
              {primaryCode ? (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Code</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-sm font-bold text-slate-800">{primaryCode.name}</div>
                      <button onClick={startEdit} className="text-slate-400 hover:text-blue-600"><Edit2 className="w-3 h-3"/></button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                    <div className="text-xs text-slate-600 mt-1 italic">{primaryCode.description}</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Memo</label>
                    <textarea
                      className="w-full text-xs p-2 border border-slate-200 rounded mt-1 resize-none"
                      rows={3}
                      value={primaryCode.memo || ""}
                      onChange={(e) => {
                        setState(prev => ({
                          ...prev,
                          codes: prev.codes.map(c =>
                            c.id === primaryCode.id ? { ...c, memo: e.target.value } : c
                          ),
                          lastAction: "Updated code memo"
                        }));
                      }}
                      placeholder="Add notes about this code..."
                    />
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statistics</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                       <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                          <div className="text-xl font-bold text-blue-600 font-mono">{primaryCode.frequency}</div>
                          <div className="text-[9px] text-slate-400 uppercase mt-1">Mentions</div>
                       </div>
                       <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                          <div className="text-xl font-bold text-purple-600 font-mono">{primaryCode.segmentIds.length}</div>
                          <div className="text-[9px] text-slate-400 uppercase mt-1">Segments</div>
                       </div>
                    </div>
                  </div>
                  
                  {selectedIds.size > 1 && (
                     <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800">
                        <strong>Batch Action:</strong> {selectedIds.size} codes selected.
                     </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-xs">
                   <span>No code selected</span>
                </div>
              )}
           </div>
        </SidebarPanel>
      </div>
    </div>
  );
};