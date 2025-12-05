import React, { useState, useEffect, useRef } from 'react';
import { StepProps, Category } from '../types';
import { Network, ArrowRight, Edit3, Plus, Trash2, GripVertical, CheckCircle, Cloud, LayoutGrid, BarChart3 } from 'lucide-react';
import { Ribbon, RibbonGroup, RibbonButton } from './ui/Ribbon';
import { PanelHeader, WorkspacePanel, SidebarPanel } from './ui/Panels';
import * as d3 from 'd3';
import { WordCloudDisplay } from './WordCloudDisplay';
import { VisualizationView } from './visualization/VisualizationView';

export const AxialCodingStep: React.FC<StepProps> = ({ state, setState, onNext }) => {
  const [activeTab, setActiveTab] = useState('Home');
  const [viewMode, setViewMode] = useState<'edit' | 'visual' | 'visualization'>('edit');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Initialize selected category from state when component mounts or selectedCategoryId changes
  useEffect(() => {
    if (state.selectedCategoryId) {
      setSelectedCatId(state.selectedCategoryId);
      // Clear the selection after setting it to avoid persistent selection
      setState(prev => ({ ...prev, selectedCategoryId: undefined }));
    }
  }, [state.selectedCategoryId, setState]);

  // --- D3 VISUALIZATION ---
  useEffect(() => {
    if (viewMode !== 'visual' || !svgRef.current) return;
    const width = svgRef.current.parentElement?.clientWidth || 800;
    const height = 500;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes = state.categories.map(c => ({ id: c.id, name: c.name, val: c.centrality, ...c }));
    const links: any[] = [];
    state.categories.forEach(cat => cat.connections.forEach(tid => {
       if (!links.find(l => (l.source === cat.id && l.target === tid) || (l.source === tid && l.target === cat.id))) {
         links.push({ source: cat.id, target: tid });
       }
    }));

    const sim = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance((d:any) => 100 + (10-d.target.val)*10))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width/2, height/2));

    const g = svg.append("g");
    const link = g.append("g").selectAll("line").data(links).join("line").attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("opacity", 0.6);
    const node = g.append("g").selectAll("g").data(nodes).join("g")
      .call(d3.drag<any,any>().on("start", (e,d)=>{if(!e.active)sim.alphaTarget(0.3).restart();d.fx=d.x;d.fy=d.y}).on("drag",(e,d)=>{d.fx=e.x;d.fy=e.y}).on("end",(e,d)=>{if(!e.active)sim.alphaTarget(0);d.fx=null;d.fy=null}))
      .on("click", (e, d) => {
        setSelectedCatId(d.id);
        svg.selectAll("circle").attr("stroke", "#fff").attr("stroke-width", 2);
        d3.select(e.currentTarget).select("circle").attr("stroke", "#f59e0b").attr("stroke-width", 4);
      });

    // Centrality-based sizing and coloring
    const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 10]);

    node.append("circle")
      .attr("r", (d:any)=> 20 + d.val * 3)
      .attr("fill", (d:any) => colorScale(d.val))
      .attr("stroke", "#fff").attr("stroke-width", 2)
      .attr("class", "cursor-pointer transition-all hover:opacity-80 shadow-md");
      
    node.append("text").text((d:any)=>d.name).attr("dy", (d:any) => 35 + d.val).attr("text-anchor", "middle").attr("class", "text-[10px] font-bold fill-slate-700 pointer-events-none");

    sim.on("tick", () => {
      link.attr("x1", (d:any)=>d.source.x).attr("y1", (d:any)=>d.source.y).attr("x2", (d:any)=>d.target.x).attr("y2", (d:any)=>d.target.y);
      node.attr("transform", (d:any)=>`translate(${d.x},${d.y})`);
    });
  }, [viewMode, state.categories]);

  // --- ACTIONS ---
  const handleCreateCat = () => {
    const newCat: Category = { id: `c-${Date.now()}`, name: "New Category", codeIds: [], connections: [], centrality: 1, description: "" };
    setState(p => ({ ...p, categories: [newCat, ...p.categories] }));
  };

  const handleDrop = (e: React.DragEvent, catId: string) => {
    const codeId = e.dataTransfer.getData("codeId");
    const srcCatId = e.dataTransfer.getData("srcCatId");
    if (srcCatId === catId) return;
    
    setState(prev => {
      const cats = [...prev.categories];
      const src = cats.find(c => c.id === srcCatId);
      const tgt = cats.find(c => c.id === catId);
      if (src && tgt) {
        src.codeIds = src.codeIds.filter(c => c !== codeId);
        tgt.codeIds.push(codeId);
      }
      return { ...prev, categories: cats, lastAction: "Moved Code" };
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Ribbon activeTab={activeTab} onTabChange={setActiveTab}>
         {activeTab === 'Home' && (
           <RibbonGroup title="Actions">
              <RibbonButton icon={Plus} label="New Category" onClick={handleCreateCat} />
              <RibbonButton icon={CheckCircle} label="Auto-Connect" />
           </RibbonGroup>
         )}

         {activeTab === 'View' && (
           <RibbonGroup title="View Mode">
              <RibbonButton icon={LayoutGrid} label="Category Editor" active={viewMode === 'edit'} onClick={() => setViewMode('edit')} />
              <RibbonButton icon={Network} label="Relationship Map" active={viewMode === 'visual'} onClick={() => setViewMode('visual')} />
              <RibbonButton icon={BarChart3} label="Advanced Visualization" active={viewMode === 'visualization'} onClick={() => setViewMode('visualization')} />
           </RibbonGroup>
         )}
         
         {activeTab === 'Analyze' && (
           <RibbonGroup title="Phase">
              <RibbonButton icon={ArrowRight} label="Selective Coding" variant="large" onClick={onNext} />
           </RibbonGroup>
         )}

         {activeTab === 'Export' && (
           <RibbonGroup title="Data">
             <RibbonButton icon={Save} label="Export Categories (JSON)" onClick={() => {
               import('../services/exportService').then(({ exportCategoriesAsJSON, downloadFile }) => {
                 const content = exportCategoriesAsJSON(state.categories);
                 downloadFile(content, 'categories.json', 'application/json');
               });
             }} />
             <RibbonButton icon={Save} label="Export Categories (CSV)" onClick={() => {
               import('../services/exportService').then(({ exportCategoriesAsCSV, downloadFile }) => {
                 const content = exportCategoriesAsCSV(state.categories);
                 downloadFile(content, 'categories.csv', 'text/csv');
               });
             }} />
           </RibbonGroup>
         )}
      </Ribbon>

      <div className="flex-1 p-4 min-h-0">
        {viewMode === 'edit' ? (
          <div className="h-full flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
             {state.categories.map(cat => (
               <div
                 key={cat.id}
                 className="w-72 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col shrink-0"
                 onDragOver={e => e.preventDefault()}
                 onDrop={e => handleDrop(e, cat.id)}
               >
                  <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2 group">
                     <div className="w-2 h-2 rounded-full bg-blue-500" />
                     <input
                       className="flex-1 text-sm font-bold bg-transparent outline-none focus:bg-white px-1 rounded"
                       value={cat.name}
                       onChange={e => setState(p => ({...p, categories: p.categories.map(c => c.id === cat.id ? {...c, name: e.target.value} : c)}))}
                     />
                     <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity" onClick={() => setState(p => ({...p, categories: p.categories.filter(c => c.id !== cat.id)}))}>
                        <Trash2 className="w-3 h-3" />
                     </button>
                  </div>
                  <div className="p-2">
                    <textarea
                      className="w-full text-xs p-2 border border-slate-200 rounded resize-none"
                      rows={2}
                      value={cat.memo || ""}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        categories: prev.categories.map(c =>
                          c.id === cat.id ? { ...c, memo: e.target.value } : c
                        )
                      }))}
                      placeholder="Add notes about this category..."
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50">
                     {cat.codeIds.map(cid => {
                        const code = state.codes.find(c => c.id === cid);
                        return code ? (
                          <div
                            key={cid}
                            draggable
                            onDragStart={e => { e.dataTransfer.setData("codeId", cid); e.dataTransfer.setData("srcCatId", cat.id); }}
                            className="p-2 bg-white rounded border border-slate-200 shadow-sm text-xs flex items-center gap-2 cursor-grab active:cursor-grabbing hover:border-blue-300"
                          >
                             <GripVertical className="w-3 h-3 text-slate-300" />
                             {code.name}
                          </div>
                        ) : null;
                     })}
                     {cat.codeIds.length === 0 && <div className="text-[10px] text-slate-400 text-center py-4 border-2 border-dashed border-slate-200 rounded">Drop Codes Here</div>}
                  </div>
               </div>
             ))}
             <button onClick={handleCreateCat} className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center sticky right-0 top-1/2 -translate-y-1/2 transition-transform hover:scale-110">
                <Plus className="w-6 h-6" />
             </button>
          </div>
        ) : viewMode === 'visualization' ? (
          <div className="h-full overflow-y-auto p-4">
            <div className="h-[600px]">
              <VisualizationView state={state} setState={setState} />
            </div>
          </div>
        ) : (
          <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-4">
             <WorkspacePanel className="lg:col-span-3">
                <div ref={svgRef} className="w-full h-full bg-slate-50" />
             </WorkspacePanel>
             <SidebarPanel className="lg:col-span-1">
                <PanelHeader title="Cluster Insight" icon={<Cloud className="w-3 h-3" />} />
                {selectedCatId ? (
                   <div className="p-4 flex flex-col">
                      <div className="text-sm font-bold mb-2 text-center text-slate-800">{state.categories.find(c => c.id === selectedCatId)?.name}</div>
                      <div className="w-full h-[200px] flex items-center justify-center mb-4">
                        <WordCloudDisplay
                          words={state.codes.filter(c => state.categories.find(cat => cat.id === selectedCatId)?.codeIds.includes(c.id)).map(c => ({ text: c.name, value: c.frequency }))}
                          width={200} height={200}
                        />
                      </div>
                      <div className="text-xs text-slate-500 text-center mb-2">
                         Centrality Score: <strong className="text-blue-600">{state.categories.find(c => c.id === selectedCatId)?.centrality}/10</strong>
                      </div>
                      <div className="mt-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Memo</label>
                        <textarea
                          className="w-full text-xs p-2 border border-slate-200 rounded mt-1 resize-none"
                          rows={3}
                          value={state.categories.find(c => c.id === selectedCatId)?.memo || ""}
                          onChange={(e) => setState(prev => ({
                            ...prev,
                            categories: prev.categories.map(c =>
                              c.id === selectedCatId ? { ...c, memo: e.target.value } : c
                            )
                          }))}
                          placeholder="Add notes about this category..."
                        />
                      </div>
                   </div>
                ) : (
                   <div className="p-10 text-center text-xs text-slate-400 flex flex-col items-center">
                      <Network className="w-8 h-8 mb-2 opacity-20" />
                      Select a category node to view details
                   </div>
                )}
             </SidebarPanel>
          </div>
        )}
      </div>
    </div>
  );
};