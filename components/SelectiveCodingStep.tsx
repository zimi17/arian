import React, { useState } from 'react';
import { StepProps } from '../types';
import { Download, Edit3, Target, CheckCircle, FileText, BarChart, Cloud, Save, X, RefreshCw, BarChart3 } from 'lucide-react';
import { Ribbon, RibbonGroup, RibbonButton } from './ui/Ribbon';
import { PanelHeader, WorkspacePanel, SidebarPanel } from './ui/Panels';
import { WordCloudDisplay } from './WordCloudDisplay';
import { RichTextEditor } from './ui/RichTextEditor';
import { VisualizationView } from './visualization/VisualizationView';

export const SelectiveCodingStep: React.FC<StepProps> = ({ state, setState, onRegenerate }) => {
  const [activeTab, setActiveTab] = useState('Home');
  const [viewMode, setViewMode] = useState<'normal' | 'visualization'>('normal');
  const [isEditing, setIsEditing] = useState(false);
  const [narrative, setNarrative] = useState(state.theory?.narrative || "");

  // Sync local edits back to global state on save
  const handleSave = () => {
    if (state.theory) {
      setState(prev => ({
        ...prev,
        theory: { ...prev.theory!, narrative: narrative },
        lastAction: "Narrative Updated"
      }));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setNarrative(state.theory?.narrative || "");
    setIsEditing(false);
  };

  const handleCoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onRegenerate) {
       onRegenerate(e.target.value);
    }
  };

  const handleDownload = () => {
    if (!state.theory) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Analisis Grounded Theory - PDIA Unsoed</title>
        <style>
          body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
          h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
          h2 { color: #2c5282; margin-top: 30px; border-bottom: 1px solid #eee; }
          .meta { background: #f7fafc; padding: 15px; border-radius: 5px; margin-bottom: 30px; font-family: sans-serif; font-size: 0.9em; }
          .core-badge { background: #ebf8ff; color: #2b6cb0; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
          .narrative { text-align: justify; }
          .code-list { display: flex; flex-wrap: wrap; gap: 5px; }
          .code-tag { background: #edf2f7; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; }
          blockquote { border-left: 4px solid #cbd5e0; margin: 10px 0; padding-left: 15px; color: #4a5568; font-style: italic; }
        </style>
      </head>
      <body>
        <h1>LAPORAN ANALISIS KUALITATIF</h1>
        <div class="meta">
          <p><strong>Program:</strong> Doktor Ilmu Akuntansi - Universitas Jenderal Soedirman</p>
          <p><strong>Proyek:</strong> Tugas Analisis Data Penelitian</p>
          <p><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}</p>
        </div>

        <h2>I. HASIL SELECTIVE CODING</h2>
        <p><strong>Core Category:</strong> <span class="core-badge">${state.theory.coreCategory}</span></p>
        <p><strong>Hipotesis Riset:</strong> <em>${state.theory.hypothesis}</em></p>
        <p><strong>Confidence:</strong> ${state.theory.confidenceScore} (${state.theory.confidenceRationale})</p>

        <h2>II. NARASI TEORITIS</h2>
        <div class="narrative">
          ${narrative.replace(/\n/g, '<br/>')}
        </div>

        <h2>III. STRUKTUR KATEGORI (AXIAL)</h2>
        ${state.categories.map(cat => `
          <div>
            <h3>${cat.name} (Centrality: ${cat.centrality})</h3>
            <p>${cat.description}</p>
            <div class="code-list">
              ${cat.codeIds.map(cid => {
                const c = state.codes.find(x => x.id === cid);
                return c ? `<span class="code-tag">${c.name} (${c.frequency})</span>` : '';
              }).join('')}
            </div>
          </div>
        `).join('')}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Analisis_PDIA_${new Date().toISOString().slice(0,10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Ribbon activeTab={activeTab} onTabChange={setActiveTab}>
         {activeTab === 'Home' && (
           <RibbonGroup title="Theory">
              <div className="flex flex-col justify-center px-2">
                 <label className="text-[10px] text-slate-500 mb-1">Core Category</label>
                 <select 
                    className="text-xs border border-slate-300 rounded p-1 w-32" 
                    value={state.categories.find(c => c.name === state.theory?.coreCategory)?.id || ""}
                    onChange={handleCoreChange}
                 >
                    {state.categories.map(c => (
                       <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                 </select>
              </div>
              <RibbonButton icon={Target} label="Recalculate" onClick={() => onRegenerate && onRegenerate("")} />
              
              {!isEditing ? (
                <RibbonButton icon={Edit3} label="Edit Narrative" onClick={() => setIsEditing(true)} />
              ) : (
                <>
                  <RibbonButton icon={Save} label="Save Changes" onClick={handleSave} />
                  <RibbonButton icon={X} label="Cancel Edit" onClick={handleCancel} />
                </>
              )}
           </RibbonGroup>
         )}

         {activeTab === 'Export' && (
           <RibbonGroup title="Output">
              <RibbonButton icon={Download} label="Export Report" variant="large" onClick={handleDownload} />
              <RibbonButton icon={Save} label="Export Theory (JSON)" onClick={() => {
                import('../services/exportService').then(({ exportTheoryAsJSON, downloadFile }) => {
                  const content = exportTheoryAsJSON(state.theory);
                  downloadFile(content, 'theory.json', 'application/json');
                });
              }} />
              <RibbonButton icon={Save} label="Export Project (JSON)" onClick={() => {
                import('../services/exportService').then(({ exportProjectAsJSON, downloadFile }) => {
                  const content = exportProjectAsJSON(state);
                  downloadFile(content, 'project.json', 'application/json');
                });
              }} />
           </RibbonGroup>
         )}
         
         {activeTab === 'View' && (
            <RibbonGroup title="Display Options">
              <RibbonButton icon={BarChart3} label="Visualization" active={viewMode === 'visualization'} onClick={() => setViewMode('visualization')} />
            </RibbonGroup>
         )}

         {activeTab === 'Analyze' && (
            <RibbonGroup title="Analysis">
              <span className="text-xs text-slate-400 italic px-2">Review Mode</span>
            </RibbonGroup>
         )}
      </Ribbon>

      {viewMode === 'visualization' ? (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="h-[600px]">
            <VisualizationView state={state} setState={setState} />
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
           {/* LEFT: NARRATIVE EDITOR */}
           <WorkspacePanel className="lg:col-span-2">
              <PanelHeader title="Theoretical Narrative" icon={<FileText className="w-3 h-3 text-blue-600" />} actions={
                 <div className="flex items-center gap-2">
                   <span className={`text-[10px] px-2 py-0.5 rounded-full border ${state.theory?.confidenceScore === 'High' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700'}`}>
                      Confidence: {state.theory?.confidenceScore}
                   </span>
                 </div>
              } />

              <div className="flex-1 flex flex-col min-h-0 bg-white">
                 {isEditing ? (
                   <RichTextEditor
                     value={narrative}
                     onChange={setNarrative}
                     className="flex-1 border-0 rounded-none shadow-none"
                   />
                 ) : (
                   <div
                      className="flex-1 p-8 overflow-y-auto prose prose-slate max-w-none font-serif text-lg leading-loose text-slate-700 custom-scrollbar"
                      dangerouslySetInnerHTML={{ __html: narrative }}
                   />
                 )}
              </div>
           </WorkspacePanel>

           {/* RIGHT: EVIDENCE & STATS */}
           <div className="flex flex-col gap-4">
              {/* CONFIDENCE & RATIONALE CARD */}
              <SidebarPanel className="h-auto shrink-0">
                 <PanelHeader title="Theory Confidence" icon={<CheckCircle className="w-3 h-3 text-emerald-600" />} />
                 <div className="p-4 bg-emerald-50/50">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-bold uppercase text-emerald-800 tracking-wider">Score</span>
                       <span className={`px-2 py-0.5 rounded text-xs font-bold ${state.theory?.confidenceScore === 'High' ? 'bg-emerald-200 text-emerald-800' : 'bg-yellow-200 text-yellow-800'}`}>
                          {state.theory?.confidenceScore}
                       </span>
                    </div>
                    <div className="text-xs text-emerald-900 italic border-t border-emerald-100 pt-2 leading-relaxed">
                       "{state.theory?.confidenceRationale}"
                    </div>
                 </div>
              </SidebarPanel>

              <SidebarPanel className="h-[250px]">
                 <PanelHeader title="Core Concept Cloud" icon={<Cloud className="w-3 h-3" />} />
                 <div className="flex-1 flex items-center justify-center bg-slate-50/50">
                    <WordCloudDisplay words={state.categories.find(c => c.name === state.theory?.coreCategory)?.codeIds.map(cid => {
                       const code = state.codes.find(c => c.id === cid);
                       return code ? { text: code.name, value: code.frequency } : null;
                    }).filter(Boolean) as any || []} width={280} height={200} maxWords={20} />
                 </div>
              </SidebarPanel>

              <SidebarPanel className="flex-1">
                 <PanelHeader title="Research Metrics" icon={<BarChart className="w-3 h-3" />} />
                 <div className="p-4 space-y-4 text-sm">
                    <div className="p-3 bg-white rounded border border-slate-200 shadow-sm">
                       <strong className="text-slate-500 text-[10px] uppercase tracking-wider block mb-1">Research Hypothesis</strong>
                       <p className="text-slate-800 font-medium leading-snug italic">"{state.theory?.hypothesis}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                       <div className="p-2 bg-slate-50 rounded text-center">
                          <div className="text-lg font-bold text-blue-600">{state.categories.length}</div>
                          <div className="text-[9px] text-slate-500 uppercase">Categories</div>
                       </div>
                       <div className="p-2 bg-slate-50 rounded text-center">
                          <div className="text-lg font-bold text-purple-600">{state.categories.reduce((acc,c) => acc + c.codeIds.length, 0)}</div>
                          <div className="text-[9px] text-slate-500 uppercase">Coded Segments</div>
                       </div>
                    </div>
                 </div>
              </SidebarPanel>
           </div>
        </div>
      )}
    </div>
  );
};