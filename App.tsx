import React, { useState, useEffect } from 'react';
import { AnalysisState, StepProps, Segment } from './types';
import { performOpenCoding, performAxialCoding, performSelectiveCoding } from './services/geminiService';
import { InputStep } from './components/InputStep';
import { OpenCodingStep } from './components/OpenCodingStep';
import { AxialCodingStep } from './components/AxialCodingStep';
import { SelectiveCodingStep } from './components/SelectiveCodingStep';
import { StatusBar } from './components/ui/StatusBar';
import { SearchModal } from './components/ui/SearchModal';
import { UserPreferencesModal } from './components/ui/UserPreferencesModal';
import { DocumentationModal } from './components/ui/DocumentationModal';
import { Project, createProject, loadProject, deleteProject, getProjectList, updateProject } from './services/projectService';
import { initializePreferences } from './services/userPreferencesService';
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from './services/keyboardShortcutsService';
import { University, Search, Folder, Plus, Trash2, Save, Settings, BookOpen } from 'lucide-react';

const STORAGE_KEY = 'pdia_unsoed_project_final_v2';
const CURRENT_PROJECT_ID_KEY = 'pdia_unsoed_current_project_id';

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    step: 'input',
    segments: [],
    codes: [],
    categories: [],
    theory: null,
    excludeKeywords: [],
    isProcessing: false,
    error: null,
    lastAction: 'System Initialized',
    selectedCodeId: undefined,
    selectedCategoryId: undefined
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showProjectList, setShowProjectList] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);

  // Initialize preferences when app starts
  useEffect(() => {
    initializePreferences();
  }, []);

  // Initialize keyboard shortcuts with actual app functions
  useKeyboardShortcuts(
    DEFAULT_SHORTCUTS.map(shortcut => {
      switch (shortcut.id) {
        case 'global-search':
          return { ...shortcut, action: () => setIsSearchOpen(true) };
        case 'new-project':
          return { ...shortcut, action: () => {
            const projectName = prompt("Enter project name:");
            if (projectName) {
              const projectDescription = prompt("Enter project description (optional):", "") || "";
              createProject(projectName, projectDescription, {
                step: 'input',
                segments: [],
                codes: [],
                categories: [],
                theory: null,
                excludeKeywords: [],
                isProcessing: false,
                error: null,
                lastAction: 'New Project Created',
                selectedCodeId: undefined,
                selectedCategoryId: undefined
              }).then(newProject => {
                setCurrentProjectId(newProject.id);
                setState(newProject.state);
              });
            }
          }};
        case 'save-project':
          // For save, we're already auto-saving, but we could trigger a manual save if needed
          return {
            ...shortcut,
            action: () => setState(prev => ({ ...prev, lastAction: 'Manual save triggered' }))
          };
        case 'export-project':
          // This would need to be implemented per step
          return {
            ...shortcut,
            action: () => alert('Export functionality - implementation depends on current step')
          };
        case 'toggle-sidebar':
          // Would need to implement sidebar toggle state
          return {
            ...shortcut,
            action: () => console.log('Toggle sidebar - would need sidebar state management')
          };
        case 'next-step':
          // Would trigger next step based on current step
          return {
            ...shortcut,
            action: () => {
              if (state.step === 'input') transitionToOpenCoding();
              else if (state.step === 'open') transitionToAxialCoding();
              else if (state.step === 'axial') transitionToSelectiveCoding();
            }
          };
        case 'prev-step':
          // Would trigger previous step
          return {
            ...shortcut,
            action: () => {
              // Go back to previous step
              if (state.step === 'open') setState(prev => ({ ...prev, step: 'input' }));
              else if (state.step === 'axial') setState(prev => ({ ...prev, step: 'open' }));
              else if (state.step === 'selective') setState(prev => ({ ...prev, step: 'axial' }));
            }
          };
        case 'add-code':
          // This would open add code dialog, but it's step-specific
          return {
            ...shortcut,
            action: () => {
              setState(prev => ({
                ...prev,
                step: 'open', // Go to open coding step where codes are added
                lastAction: 'Navigate to add code'
              }));
            }
          };
        case 'visualization-view':
          // Switch to visualization view if possible
          return {
            ...shortcut,
            action: () => {
              if (state.step === 'open' || state.step === 'axial' || state.step === 'selective') {
                alert('Switch to visualization view - implementation depends on current step');
              }
            }
          };
        default:
          return shortcut;
      }
    })
  );

  // Load projects on app start
  useEffect(() => {
    const loadProjects = async () => {
      const allProjects = await getProjectList();
      const projectPromises = allProjects.map(project => loadProject(project.id));
      const loadedProjects = await Promise.all(projectPromises);
      setProjects(loadedProjects.filter(Boolean) as Project[]);

      // Try to load current project ID
      const savedProjectId = localStorage.getItem(CURRENT_PROJECT_ID_KEY);
      if (savedProjectId) {
        const project = await loadProject(savedProjectId);
        if (project) {
          setState(project.state);
          setCurrentProjectId(savedProjectId);
        }
      }
    };

    loadProjects();
  }, []);

  // Update projects list when changes happen
  useEffect(() => {
    const updateProjectsList = async () => {
      const allProjects = await getProjectList();
      const projectPromises = allProjects.map(project => loadProject(project.id));
      const loadedProjects = await Promise.all(projectPromises);
      setProjects(loadedProjects.filter(Boolean) as Project[]);
    };

    updateProjectsList();
  }, [state]);

  // Auto-save project when state changes
  useEffect(() => {
    const handleStateUpdate = async () => {
      if (currentProjectId) {
        // Don't save certain transient properties
        const { isProcessing, error, lastAction, selectedCodeId, selectedCategoryId, ...toSave } = state;
        await updateProject(currentProjectId, {
          ...state,
          isProcessing: false, // Reset processing state on save
          error: null, // Reset errors on save
          selectedCodeId: undefined,
          selectedCategoryId: undefined
        });
      } else if (state.segments.length > 0) {
        // If no project loaded but we have data, create a default project
        const newProject = await createProject('Untitled Project', 'New analysis project', state);
        setCurrentProjectId(newProject.id);
        localStorage.setItem(CURRENT_PROJECT_ID_KEY, newProject.id);
      }
    };

    handleStateUpdate();
  }, [state]);

  // Load project when currentProjectId changes
  useEffect(() => {
    const loadCurrentProject = async () => {
      if (currentProjectId) {
        const project = await loadProject(currentProjectId);
        if (project) {
          setState(project.state);
          localStorage.setItem(CURRENT_PROJECT_ID_KEY, currentProjectId);
        }
      }
    };

    loadCurrentProject();
  }, [currentProjectId]);

  // --- TRANSITIONS ---
  const transitionToOpenCoding = async () => {
    // Note: Segments are already in state from InputStep (multi-dataset support)
    const segmentsToProcess = state.segments;
    if (!segmentsToProcess.length) return setState(p => ({ ...p, error: "No Data in Project" }));

    setState(p => ({ ...p, isProcessing: true, lastAction: 'Running Open Coding...' }));
    try {
      const codes = await performOpenCoding(segmentsToProcess, state.excludeKeywords);
      setState(p => ({ ...p, codes, step: 'open', isProcessing: false, lastAction: 'Open Coding Complete' }));
    } catch (err: any) { setState(p => ({ ...p, isProcessing: false, error: err.message })); }
  };

  const transitionToAxialCoding = async () => {
    setState(p => ({ ...p, isProcessing: true, lastAction: 'Running Axial Coding...' }));
    try {
      const categories = await performAxialCoding(state.codes, state.segments);
      setState(p => ({ ...p, categories, step: 'axial', isProcessing: false, lastAction: 'Axial Coding Complete' }));
    } catch (err: any) { setState(p => ({ ...p, isProcessing: false, error: err.message })); }
  };

  const transitionToSelectiveCoding = async () => {
    setState(p => ({ ...p, isProcessing: true, lastAction: 'Generating Theory...' }));
    try {
      const theory = await performSelectiveCoding(state.categories, state.segments, state.codes);
      setState(p => ({ ...p, theory, step: 'selective', isProcessing: false, lastAction: 'Theory Generated' }));
    } catch (err: any) { setState(p => ({ ...p, isProcessing: false, error: err.message })); }
  };

  const handleRegenerate = async (coreId: string) => {
    setState(p => ({ ...p, isProcessing: true, lastAction: 'Regenerating...' }));
    try {
      const theory = await performSelectiveCoding(state.categories, state.segments, state.codes, coreId);
      setState(p => ({ ...p, theory, isProcessing: false, lastAction: 'Theory Updated' }));
    } catch (e: any) { setState(p => ({...p, isProcessing: false, error: e.message})); }
  };

  // --- PROJECT MANAGEMENT ---
  const handleLoadProject = async (projectId: string) => {
    const project = await loadProject(projectId);
    if (project) {
      setState(project.state);
      setCurrentProjectId(projectId);
      setShowProjectList(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      const isDeleted = await deleteProject(projectId);
      if (isDeleted) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (currentProjectId === projectId) {
          // If we're deleting the current project, reset to empty state
          setCurrentProjectId(null);
          setState({
            step: 'input',
            segments: [],
            codes: [],
            categories: [],
            theory: null,
            excludeKeywords: [],
            isProcessing: false,
            error: null,
            lastAction: 'Project Deleted',
            selectedCodeId: undefined,
            selectedCategoryId: undefined
          });
        }
      }
    }
  };

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchSelectResult = (result: any) => {
    // Handle navigation to the appropriate section based on result type
    switch(result.type) {
      case 'code':
        setState(prev => ({
          ...prev,
          step: 'open',
          selectedCodeId: result.id,
          lastAction: `Navigated to code: ${result.content}`
        }));
        break;
      case 'category':
        setState(prev => ({
          ...prev,
          step: 'axial',
          selectedCategoryId: result.id,
          lastAction: `Navigated to category: ${result.content}`
        }));
        break;
      case 'segment':
        setState(prev => ({
          ...prev,
          step: 'input',
          lastAction: `Navigated to segment: ${result.content}`
        }));
        break;
    }
  };

  // Handle global search shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const props: StepProps = {
    state, setState,
    onNext: () => {}, onBack: () => {}, onRegenerate: handleRegenerate
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-slate-800 bg-white">
      {/* GLOBAL HEADER / TITLE BAR */}
      <header className="h-10 bg-slate-900 flex items-center justify-center relative shrink-0 z-50 select-none drag-region">
        {/* Left: Branding Icon */}
        <div className="absolute left-4 flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <University className="w-4 h-4 text-yellow-400" />
          <span className="text-[10px] text-slate-300 font-bold tracking-wider uppercase">Aplikasi Coding Etnografer</span>
        </div>

        {/* Center: Window Title */}
        <div className="text-center">
          <h1 className="text-xs font-semibold text-white tracking-wide">Tugas Analisis Data Penelitian</h1>
          <span className="text-[9px] text-slate-400 block -mt-0.5">PDIA - Universitas Jenderal Soedirman</span>
        </div>

        {/* Right: Step Indicator (Wizard) */}
        <div className="absolute right-16 flex items-center gap-1">
          {['Input', 'Open', 'Axial', 'Selective'].map((label, i) => {
            const stepIdx = ['input', 'open', 'axial', 'selective'].indexOf(state.step);
            const active = i <= stepIdx;
            const current = i === stepIdx;
            return (
              <div
                key={label}
                className={`
                  px-2 py-0.5 rounded text-[9px] font-bold transition-all border
                  ${current ? 'bg-yellow-500 text-slate-900 border-yellow-600' : active ? 'bg-slate-700 text-slate-300 border-slate-600' : 'text-slate-600 border-transparent'}
                `}
              >
                {label}
              </div>
            );
          })}
        </div>

        {/* Project Selector */}
        <div className="absolute right-20 flex items-center gap-1">
          <button
            onClick={() => setShowProjectList(true)}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1.5 rounded text-xs transition-colors border border-slate-500 hover:border-slate-400"
          >
            <Folder className="w-3 h-3" />
            <span>
              {currentProjectId
                ? (projects.find(p => p.id === currentProjectId)?.name || 'Project')
                : 'No Project'}
            </span>
          </button>
        </div>

        {/* Documentation Button */}
        <button
          onClick={() => setShowDocumentation(true)}
          className="absolute right-20 flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1.5 rounded text-xs transition-colors border border-slate-500 hover:border-slate-400"
          title="Documentation"
        >
          <BookOpen className="w-3 h-3" />
          <span>Docs</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setShowPreferences(true)}
          className="absolute right-12 flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1.5 rounded text-xs transition-colors border border-slate-500 hover:border-slate-400"
          title="User Preferences"
        >
          <Settings className="w-3 h-3" />
          <span>Settings</span>
        </button>

        {/* Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="absolute right-4 flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1.5 rounded text-xs transition-colors border border-slate-500 hover:border-slate-400"
        >
          <Search className="w-3 h-3" />
          <span>Search</span>
          <kbd className="bg-slate-600 px-1.5 py-0.5 rounded text-[10px]">^K</kbd>
        </button>
      </header>

      {/* Project List Modal */}
      {showProjectList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-gray-800">Project Management</h3>
              </div>
              <button
                onClick={() => setShowProjectList(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Project List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4 flex gap-2 flex-wrap">
                <button
                  onClick={async () => {
                    const projectName = prompt("Enter project name:");
                    if (projectName) {
                      const projectDescription = prompt("Enter project description (optional):", "") || "";
                      const newProject = await createProject(projectName, projectDescription, {
                        step: 'input',
                        segments: [],
                        codes: [],
                        categories: [],
                        theory: null,
                        excludeKeywords: [],
                        isProcessing: false,
                        error: null,
                        lastAction: 'New Project Created',
                        selectedCodeId: undefined,
                        selectedCategoryId: undefined
                      });
                      setCurrentProjectId(newProject.id);
                      setState(newProject.state);
                    }
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>

                <button
                  onClick={async () => {
                    const allProjects = await getProjectList();
                    if (allProjects.length === 0) {
                      alert('No projects to backup');
                      return;
                    }

                    const projectsWithDetails = await Promise.all(
                      allProjects.map(async p => await loadProject(p.id))
                    );

                    const backupData = {
                      version: '1.0',
                      exportedAt: new Date().toISOString(),
                      projects: projectsWithDetails.filter(Boolean)
                    };

                    const content = JSON.stringify(backupData, null, 2);
                    const blob = new Blob([content], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `analysis_backup_${new Date().toISOString().slice(0,10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Backup All
                </button>

                <label className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Restore
                  <input
                    type="file"
                    className="hidden"
                    accept=".json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const text = await file.text();
                      try {
                        const backupData = JSON.parse(text);

                        if (backupData.version && backupData.projects) {
                          // This is a backup file, import all projects
                          for (const project of backupData.projects) {
                            await createProject(project.name, project.description, project.state);
                          }

                          alert(`Restored ${backupData.projects.length} projects`);
                          setShowProjectList(false);
                        } else {
                          alert('Invalid backup file format');
                        }
                      } catch (error) {
                        alert('Error parsing backup file: ' + (error as Error).message);
                      }
                    }}
                  />
                </label>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No projects found. Create a new project to get started.
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      className={`p-4 rounded-lg border flex items-center justify-between ${
                        currentProjectId === project.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate">{project.name}</div>
                        <div className="text-sm text-gray-600 truncate">{project.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {project.metadata.totalSegments} segments, {project.metadata.totalCodes} codes
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => {
                            handleLoadProject(project.id);
                          }}
                          className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded text-sm"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteProject(project.id);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Documentation Modal */}
      <DocumentationModal
        isOpen={showDocumentation}
        onClose={() => setShowDocumentation(false)}
      />

      {/* User Preferences Modal */}
      <UserPreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />

      {/* Search Modal */}
      <SearchModal
        state={state}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSearchSelectResult}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {state.step === 'input' && <InputStep {...props} onNext={transitionToOpenCoding} />}
        {state.step === 'open' && <OpenCodingStep {...props} onNext={transitionToAxialCoding} />}
        {state.step === 'axial' && <AxialCodingStep {...props} onNext={transitionToSelectiveCoding} />}
        {state.step === 'selective' && <SelectiveCodingStep {...props} />}

        {/* Error Toast */}
        {state.error && (
          <div className="absolute bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded shadow-lg text-sm flex items-center gap-2 animate-in slide-in-from-right z-[60]">
             <span>Error: {state.error}</span>
             <button onClick={() => setState(p => ({...p, error: null}))} className="font-bold ml-2">✕</button>
          </div>
        )}
      </main>

      {/* STATUS BAR */}
      <StatusBar state={state} />
    </div>
  );
};

export default App;