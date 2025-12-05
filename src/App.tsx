import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  FolderOpen,
  Upload,
  Download,
  Search,
  BarChart3,
  Trash2,
  Play,
  Home
} from 'lucide-react';
import type { Project } from './types';
import { projectService } from './services/projectService';
import { parseCSV, parseJSON } from './services/nlpService';
import { WordCloud } from './components/WordCloud';
import './App.css';

type View = 'home' | 'projects' | 'project-detail' | 'new-project' | 'import-data';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [rawDataInput, setRawDataInput] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const allProjects = await projectService.getAllProjects();
    setProjects(allProjects);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      showMessage('error', 'Project name is required');
      return;
    }

    setLoading(true);
    try {
      const project = await projectService.createProject(projectName, projectDescription);
      await loadProjects();
      setCurrentProject(project);
      setCurrentView('project-detail');
      setProjectName('');
      setProjectDescription('');
      showMessage('success', 'Project created successfully');
    } catch {
      showMessage('error', 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRawData = async (data: string[]) => {
    if (!currentProject) return;

    setLoading(true);
    try {
      const updated = await projectService.addRawData(currentProject.id, data);
      setCurrentProject(updated);
      showMessage('success', `Added ${data.length} data item(s)`);
      setRawDataInput('');
    } catch {
      showMessage('error', 'Failed to add data');
    } finally {
      setLoading(false);
    }
  };

  const handleTextInput = () => {
    if (!rawDataInput.trim()) return;
    const lines = rawDataInput.split('\n').filter(line => line.trim().length > 0);
    handleAddRawData(lines);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const content = await file.text();
      let data: string[];

      if (file.name.endsWith('.csv')) {
        data = parseCSV(content);
      } else if (file.name.endsWith('.json')) {
        data = parseJSON(content);
      } else {
        data = content.split('\n').filter(line => line.trim().length > 0);
      }

      await handleAddRawData(data);
    } catch {
      showMessage('error', 'Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!currentProject) return;

    setLoading(true);
    try {
      const analyzed = await projectService.analyzeProject(currentProject.id);
      setCurrentProject(analyzed);
      showMessage('success', 'Analysis completed successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      showMessage('error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportProject = async () => {
    if (!currentProject) return;

    try {
      const json = await projectService.exportProject(currentProject.id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name.replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showMessage('success', 'Project exported successfully');
    } catch {
      showMessage('error', 'Export failed');
    }
  };

  const handleImportProjects = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const content = await file.text();
      const count = await projectService.importProjects(content);
      await loadProjects();
      showMessage('success', `Imported ${count} project(s)`);
    } catch {
      showMessage('error', 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    setLoading(true);
    try {
      await projectService.deleteProject(projectId);
      await loadProjects();
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
        setCurrentView('projects');
      }
      showMessage('success', 'Project deleted');
    } catch {
      showMessage('error', 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProject = async (projectId: string) => {
    const project = await projectService.getProject(projectId);
    if (project) {
      setCurrentProject(project);
      setCurrentView('project-detail');
    }
  };

  // Ribbon UI
  const renderRibbon = () => (
    <div className="ribbon">
      <div className="ribbon-section">
        <h3>File</h3>
        <button onClick={() => setCurrentView('new-project')} title="New Project">
          <Plus size={20} />
          <span>New</span>
        </button>
        <button onClick={() => setCurrentView('projects')} title="Open Project">
          <FolderOpen size={20} />
          <span>Open</span>
        </button>
        <button 
          onClick={handleExportProject} 
          disabled={!currentProject}
          title="Export Project"
        >
          <Download size={20} />
          <span>Export</span>
        </button>
        <label className="file-button" title="Import Projects">
          <Upload size={20} />
          <span>Import</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImportProjects}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="ribbon-section">
        <h3>Data</h3>
        <button 
          onClick={() => currentProject && setCurrentView('import-data')}
          disabled={!currentProject}
          title="Add Data"
        >
          <FileText size={20} />
          <span>Add Data</span>
        </button>
        <button 
          onClick={handleAnalyze}
          disabled={!currentProject || currentProject.rawData.length === 0}
          title="Run Analysis"
        >
          <Play size={20} />
          <span>Analyze</span>
        </button>
      </div>

      <div className="ribbon-section">
        <h3>View</h3>
        <button onClick={() => setCurrentView('home')} title="Home">
          <Home size={20} />
          <span>Home</span>
        </button>
      </div>
    </div>
  );

  // Home view
  const renderHome = () => (
    <div className="view-container">
      <div className="welcome-section">
        <h1>ARIAN</h1>
        <p className="subtitle">Analisis Tekstual Riset Axial Naratif</p>
        <p className="description">
          A sophisticated pure frontend qualitative research application for performing 
          Grounded Theory analysis. All analysis is performed using client-side algorithms 
          with no external API calls.
        </p>
        
        <div className="feature-grid">
          <div className="feature-card">
            <BarChart3 size={32} />
            <h3>Open Coding</h3>
            <p>Automatic extraction of codes using N-gram analysis (unigrams, bigrams, trigrams)</p>
          </div>
          <div className="feature-card">
            <FileText size={32} />
            <h3>Axial Coding</h3>
            <p>Clustering codes into categories based on co-occurrence patterns</p>
          </div>
          <div className="feature-card">
            <Search size={32} />
            <h3>Selective Coding</h3>
            <p>Identification of core categories and theory generation</p>
          </div>
        </div>

        <div className="quick-actions">
          <button className="primary-button" onClick={() => setCurrentView('new-project')}>
            <Plus size={20} />
            Create New Project
          </button>
          <button className="secondary-button" onClick={() => setCurrentView('projects')}>
            <FolderOpen size={20} />
            Open Existing Project
          </button>
        </div>
      </div>
    </div>
  );

  // Projects list view
  const renderProjects = () => (
    <div className="view-container">
      <h2>Your Projects</h2>
      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. Create one to get started!</p>
          <button className="primary-button" onClick={() => setCurrentView('new-project')}>
            <Plus size={20} />
            Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <h3>{project.name}</h3>
              <p>{project.description || 'No description'}</p>
              <div className="project-stats">
                <span>{project.rawData.length} data items</span>
                <span>{project.openCodes.length} codes</span>
                <span>{project.axialCategories.length} categories</span>
              </div>
              <div className="project-actions">
                <button 
                  className="primary-button"
                  onClick={() => handleOpenProject(project.id)}
                >
                  Open
                </button>
                <button 
                  className="danger-button"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // New project view
  const renderNewProject = () => (
    <div className="view-container">
      <h2>Create New Project</h2>
      <div className="form">
        <div className="form-group">
          <label>Project Name *</label>
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder="Enter project name"
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={projectDescription}
            onChange={e => setProjectDescription(e.target.value)}
            placeholder="Enter project description"
            rows={4}
          />
        </div>
        <div className="form-actions">
          <button 
            className="primary-button" 
            onClick={handleCreateProject}
            disabled={loading}
          >
            Create Project
          </button>
          <button 
            className="secondary-button" 
            onClick={() => setCurrentView('projects')}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Import data view
  const renderImportData = () => (
    <div className="view-container">
      <h2>Add Data to Project</h2>
      <div className="form">
        <div className="form-group">
          <label>Text Input</label>
          <textarea
            value={rawDataInput}
            onChange={e => setRawDataInput(e.target.value)}
            placeholder="Enter your research data (one item per line)"
            rows={10}
          />
          <button 
            className="primary-button" 
            onClick={handleTextInput}
            disabled={loading || !rawDataInput.trim()}
          >
            Add Text Data
          </button>
        </div>

        <div className="form-group">
          <label>File Upload</label>
          <p className="help-text">Upload CSV, JSON, or text file</p>
          <input
            type="file"
            accept=".txt,.csv,.json"
            onChange={handleFileUpload}
          />
        </div>

        <button 
          className="secondary-button" 
          onClick={() => setCurrentView('project-detail')}
        >
          Back to Project
        </button>
      </div>
    </div>
  );

  // Project detail view
  const renderProjectDetail = () => {
    if (!currentProject) return null;

    const wordCloudData = currentProject.openCodes.slice(0, 50).map(code => ({
      text: code.text,
      value: code.frequency
    }));

    return (
      <div className="view-container">
        <div className="project-header">
          <div>
            <h2>{currentProject.name}</h2>
            <p>{currentProject.description}</p>
          </div>
        </div>

        <div className="tabs">
          <div className="tab-content">
            <div className="section">
              <h3>Raw Data ({currentProject.rawData.length})</h3>
              {currentProject.rawData.length === 0 ? (
                <p className="empty-state">No data yet. Add some data to begin analysis.</p>
              ) : (
                <div className="data-list">
                  {currentProject.rawData.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="data-item">
                      {item.substring(0, 200)}{item.length > 200 ? '...' : ''}
                    </div>
                  ))}
                  {currentProject.rawData.length > 5 && (
                    <p className="info-text">... and {currentProject.rawData.length - 5} more</p>
                  )}
                </div>
              )}
            </div>

            {currentProject.openCodes.length > 0 && (
              <>
                <div className="section">
                  <h3>Open Coding - Extracted Codes ({currentProject.openCodes.length})</h3>
                  <WordCloud words={wordCloudData} width={800} height={400} />
                  <div className="codes-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Frequency</th>
                          <th>N-gram</th>
                          <th>Sources</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProject.openCodes.slice(0, 20).map(code => (
                          <tr key={code.id}>
                            <td>{code.text}</td>
                            <td>{code.frequency}</td>
                            <td>{code.ngram}</td>
                            <td>{code.sources.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {currentProject.openCodes.length > 20 && (
                      <p className="info-text">Showing top 20 of {currentProject.openCodes.length} codes</p>
                    )}
                  </div>
                </div>

                {currentProject.axialCategories.length > 0 && (
                  <div className="section">
                    <h3>Axial Coding - Categories ({currentProject.axialCategories.length})</h3>
                    <div className="categories-list">
                      {currentProject.axialCategories.map(category => (
                        <div key={category.id} className="category-card">
                          <h4>{category.name}</h4>
                          <p className="category-meta">
                            {category.codes.length} codes | 
                            Centrality: {category.centrality.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentProject.selectiveTheory && (
                  <div className="section">
                    <h3>Selective Coding - Theory</h3>
                    <div className="theory-section">
                      <h4>Core Categories ({currentProject.selectiveTheory.coreCategories.length})</h4>
                      <div className="core-categories">
                        {currentProject.selectiveTheory.coreCategories.map(catId => {
                          const category = currentProject.axialCategories.find(c => c.id === catId);
                          return category ? (
                            <div key={catId} className="core-category-badge">
                              {category.name}
                            </div>
                          ) : null;
                        })}
                      </div>
                      
                      <h4>Generated Theory Narrative</h4>
                      <div className="narrative-box">
                        <pre>{currentProject.selectiveTheory.narrative}</pre>
                      </div>

                      {currentProject.selectiveTheory.relationships.length > 0 && (
                        <>
                          <h4>Category Relationships</h4>
                          <div className="relationships-list">
                            {currentProject.selectiveTheory.relationships.map((rel, idx) => {
                              const fromCat = currentProject.axialCategories.find(c => c.id === rel.from);
                              const toCat = currentProject.axialCategories.find(c => c.id === rel.to);
                              return (
                                <div key={idx} className="relationship-item">
                                  {fromCat?.name} ↔ {toCat?.name} (strength: {rel.strength})
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      {renderRibbon()}
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing...</p>
        </div>
      )}

      <main className="main-content">
        {currentView === 'home' && renderHome()}
        {currentView === 'projects' && renderProjects()}
        {currentView === 'new-project' && renderNewProject()}
        {currentView === 'import-data' && renderImportData()}
        {currentView === 'project-detail' && renderProjectDetail()}
      </main>
    </div>
  );
};

export default App;
