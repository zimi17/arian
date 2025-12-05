import { AnalysisState } from "../types";
import { initDB, saveToDB, loadFromDB, deleteFromDB, getAllFromDB } from "./indexedDBService";

// Project type definition
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  state: AnalysisState;
  metadata: {
    totalSegments: number;
    totalCodes: number;
    totalCategories: number;
    analysisProgress: string; // 'input', 'open', 'axial', 'selective'
  };
}

// IndexedDB configuration
const DB_CONFIG = {
  dbName: 'QualitativeAnalysisDB',
  version: 1,
  storeName: 'projects'
};

// Get all projects from IndexedDB
export const getAllProjects = async (): Promise<Project[]> => {
  try {
    const projects = await getAllFromDB(DB_CONFIG);
    return projects.map((project: any) => ({
      ...project,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading projects from IndexedDB:', error);
    // Fallback to localStorage
    try {
      const projectsJson = localStorage.getItem('pdia_unsoed_projects');
      if (!projectsJson) return [];

      const projects = JSON.parse(projectsJson);
      return projects.map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
      }));
    } catch (localStorageError) {
      console.error('Error loading projects from localStorage:', localStorageError);
      return [];
    }
  }
};

// Save all projects to IndexedDB
export const saveAllProjects = async (projects: Project[]): Promise<void> => {
  try {
    // Clear existing projects
    await clearDB(DB_CONFIG);

    // Save each project individually
    for (const project of projects) {
      await saveToDB(DB_CONFIG, {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      });
    }
  } catch (error) {
    console.error('Error saving projects to IndexedDB:', error);
    // Fallback to localStorage
    try {
      localStorage.setItem('pdia_unsoed_projects', JSON.stringify(projects));
    } catch (localStorageError) {
      console.error('Error saving projects to localStorage:', localStorageError);
      throw localStorageError;
    }
  }
};

// Create a new project
export const createProject = async (name: string, description: string, initialState: AnalysisState): Promise<Project> => {
  const newProject: Project = {
    id: `project_${Date.now()}`,
    name,
    description,
    createdAt: new Date(),
    updatedAt: new Date(),
    state: initialState,
    metadata: {
      totalSegments: initialState.segments.length,
      totalCodes: initialState.codes.length,
      totalCategories: initialState.categories.length,
      analysisProgress: initialState.step
    }
  };

  // Save to storage
  const projects = await getAllProjects();
  projects.unshift(newProject); // Add to beginning of list
  await saveAllProjects(projects);

  return newProject;
};

// Update an existing project
export const updateProject = async (projectId: string, updatedState: AnalysisState): Promise<Project | null> => {
  const projects = await getAllProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);

  if (projectIndex === -1) return null;

  const updatedProject: Project = {
    ...projects[projectIndex],
    state: updatedState,
    updatedAt: new Date(),
    metadata: {
      totalSegments: updatedState.segments.length,
      totalCodes: updatedState.codes.length,
      totalCategories: updatedState.categories.length,
      analysisProgress: updatedState.step
    }
  };

  projects[projectIndex] = updatedProject;
  await saveAllProjects(projects);

  return updatedProject;
};

// Load a project by ID
export const loadProject = async (projectId: string): Promise<Project | null> => {
  try {
    // Try IndexedDB first
    const project = await loadFromDB(DB_CONFIG, projectId);
    if (project) {
      return {
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading project from IndexedDB:', error);
    // Fallback to localStorage
    try {
      const projectsJson = localStorage.getItem('pdia_unsoed_projects');
      if (!projectsJson) return null;

      const projects = JSON.parse(projectsJson);
      const project = projects.find((p: any) => p.id === projectId);
      if (project) {
        return {
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
        };
      }
    } catch (localStorageError) {
      console.error('Error loading project from localStorage:', localStorageError);
    }
    return null;
  }
};

// Delete a project by ID
export const deleteProject = async (projectId: string): Promise<boolean> => {
  try {
    const result = await deleteFromDB(DB_CONFIG, projectId);

    // Update the in-memory list too
    const projects = await getAllProjects();
    const filteredProjects = projects.filter(p => p.id !== projectId);
    await saveAllProjects(filteredProjects);

    return true;
  } catch (error) {
    console.error('Error deleting project from IndexedDB:', error);
    // Fallback to localStorage
    try {
      const projectsJson = localStorage.getItem('pdia_unsoed_projects');
      if (!projectsJson) return false;

      const projects = JSON.parse(projectsJson);
      const filteredProjects = projects.filter((p: any) => p.id !== projectId);

      if (projects.length === filteredProjects.length) {
        return false; // Project not found
      }

      localStorage.setItem('pdia_unsoed_projects', JSON.stringify(filteredProjects));
      return true;
    } catch (localStorageError) {
      console.error('Error deleting project from localStorage:', localStorageError);
      return false;
    }
  }
};

// Rename a project
export const renameProject = async (projectId: string, name: string, description: string): Promise<boolean> => {
  try {
    const projects = await getAllProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) return false;

    projects[projectIndex] = {
      ...projects[projectIndex],
      name,
      description,
      updatedAt: new Date()
    };

    await saveAllProjects(projects);
    return true;
  } catch (error) {
    console.error('Error renaming project:', error);
    return false;
  }
};

// Get project metadata for display in project list
export const getProjectList = async (): Promise<{ id: string, name: string, description: string, createdAt: Date, updatedAt: Date, metadata: Project['metadata'] }[]> => {
  const projects = await getAllProjects();
  return projects.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    metadata: p.metadata
  }));
};

// Utility function to clear all data from IndexedDB
export const clearDB = async (config: { dbName: string; version: number; storeName: string }): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(config.dbName);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Database is blocked and cannot be deleted'));
  });
};