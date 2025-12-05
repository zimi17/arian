import type { Project } from '../types';
import { storageService } from './storageService';
import { performOpenCoding, performAxialCoding, performSelectiveCoding } from './nlpService';

/**
 * Project management service
 */
export const projectService = {
  /**
   * Create a new project
   */
  async createProject(name: string, description: string): Promise<Project> {
    const project: Project = {
      id: generateProjectId(),
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      rawData: [],
      openCodes: [],
      axialCategories: [],
      selectiveTheory: null
    };

    await storageService.saveProject(project);
    return project;
  },

  /**
   * Update project data
   */
  async updateProject(project: Project): Promise<void> {
    project.updatedAt = new Date();
    await storageService.saveProject(project);
  },

  /**
   * Add raw data to project
   */
  async addRawData(projectId: string, data: string[]): Promise<Project> {
    const project = await storageService.getProject(projectId);
    if (!project) throw new Error('Project not found');

    project.rawData.push(...data);
    await this.updateProject(project);
    return project;
  },

  /**
   * Perform analysis on project data
   */
  async analyzeProject(projectId: string): Promise<Project> {
    const project = await storageService.getProject(projectId);
    if (!project) throw new Error('Project not found');

    if (project.rawData.length === 0) {
      throw new Error('No data to analyze');
    }

    // Perform Open Coding
    project.openCodes = performOpenCoding(project.rawData);

    // Perform Axial Coding
    project.axialCategories = performAxialCoding(project.openCodes);

    // Perform Selective Coding
    project.selectiveTheory = performSelectiveCoding(
      project.axialCategories,
      project.openCodes
    );

    await this.updateProject(project);
    return project;
  },

  /**
   * Get all projects
   */
  async getAllProjects(): Promise<Project[]> {
    return await storageService.getAllProjects();
  },

  /**
   * Get a single project
   */
  async getProject(id: string): Promise<Project | null> {
    return await storageService.getProject(id);
  },

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    await storageService.deleteProject(id);
  },

  /**
   * Export project as JSON
   */
  async exportProject(projectId: string): Promise<string> {
    const project = await storageService.getProject(projectId);
    if (!project) throw new Error('Project not found');
    return JSON.stringify(project, null, 2);
  },

  /**
   * Export all projects
   */
  async exportAllProjects(): Promise<string> {
    return await storageService.exportAllProjects();
  },

  /**
   * Import projects
   */
  async importProjects(jsonString: string): Promise<number> {
    return await storageService.importProjects(jsonString);
  }
};

function generateProjectId(): string {
  return `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
