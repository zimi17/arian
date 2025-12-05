import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Project } from '../types';

interface ArianDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
    indexes: { 'by-date': Date };
  };
}

const DB_NAME = 'arian-db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

let dbInstance: IDBPDatabase<ArianDB> | null = null;

/**
 * Initialize IndexedDB
 */
async function getDB(): Promise<IDBPDatabase<ArianDB>> {
  if (dbInstance) return dbInstance;

  try {
    dbInstance = await openDB<ArianDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-date', 'updatedAt');
        }
      },
    });
    return dbInstance;
  } catch (error) {
    console.error('Failed to open IndexedDB:', error);
    throw error;
  }
}

/**
 * Storage service with IndexedDB and localStorage fallback
 */
export const storageService = {
  /**
   * Save a project
   */
  async saveProject(project: Project): Promise<void> {
    try {
      const db = await getDB();
      await db.put(STORE_NAME, project);
      // Also save to localStorage as backup
      this.saveToLocalStorage(project.id, project);
    } catch (error) {
      console.error('Failed to save to IndexedDB, using localStorage:', error);
      this.saveToLocalStorage(project.id, project);
    }
  },

  /**
   * Get a project by ID
   */
  async getProject(id: string): Promise<Project | null> {
    try {
      const db = await getDB();
      const project = await db.get(STORE_NAME, id);
      return project || this.getFromLocalStorage(id);
    } catch (error) {
      console.error('Failed to read from IndexedDB, using localStorage:', error);
      return this.getFromLocalStorage(id);
    }
  },

  /**
   * Get all projects
   */
  async getAllProjects(): Promise<Project[]> {
    try {
      const db = await getDB();
      const projects = await db.getAll(STORE_NAME);
      return projects.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error('Failed to read from IndexedDB, using localStorage:', error);
      return this.getAllFromLocalStorage();
    }
  },

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    try {
      const db = await getDB();
      await db.delete(STORE_NAME, id);
      this.deleteFromLocalStorage(id);
    } catch (error) {
      console.error('Failed to delete from IndexedDB, using localStorage:', error);
      this.deleteFromLocalStorage(id);
    }
  },

  /**
   * Export all projects as JSON
   */
  async exportAllProjects(): Promise<string> {
    const projects = await this.getAllProjects();
    return JSON.stringify(projects, null, 2);
  },

  /**
   * Import projects from JSON
   */
  async importProjects(jsonString: string): Promise<number> {
    try {
      const projects = JSON.parse(jsonString) as Project[];
      let imported = 0;

      for (const project of projects) {
        // Ensure dates are Date objects
        project.createdAt = new Date(project.createdAt);
        project.updatedAt = new Date(project.updatedAt);
        await this.saveProject(project);
        imported++;
      }

      return imported;
    } catch (error) {
      console.error('Failed to import projects:', error);
      throw new Error('Invalid project data format');
    }
  },

  // LocalStorage fallback methods
  saveToLocalStorage(id: string, project: Project): void {
    try {
      const key = `arian-project-${id}`;
      localStorage.setItem(key, JSON.stringify(project));
      
      // Update index
      const indexKey = 'arian-project-index';
      const index = JSON.parse(localStorage.getItem(indexKey) || '[]') as string[];
      if (!index.includes(id)) {
        index.push(id);
        localStorage.setItem(indexKey, JSON.stringify(index));
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  getFromLocalStorage(id: string): Project | null {
    try {
      const key = `arian-project-${id}`;
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      const project = JSON.parse(data) as Project;
      // Convert date strings to Date objects
      project.createdAt = new Date(project.createdAt);
      project.updatedAt = new Date(project.updatedAt);
      return project;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  },

  getAllFromLocalStorage(): Project[] {
    try {
      const indexKey = 'arian-project-index';
      const index = JSON.parse(localStorage.getItem(indexKey) || '[]') as string[];
      
      const projects: Project[] = [];
      for (const id of index) {
        const project = this.getFromLocalStorage(id);
        if (project) {
          projects.push(project);
        }
      }
      
      return projects.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return [];
    }
  },

  deleteFromLocalStorage(id: string): void {
    try {
      const key = `arian-project-${id}`;
      localStorage.removeItem(key);
      
      // Update index
      const indexKey = 'arian-project-index';
      const index = JSON.parse(localStorage.getItem(indexKey) || '[]') as string[];
      const newIndex = index.filter(i => i !== id);
      localStorage.setItem(indexKey, JSON.stringify(newIndex));
    } catch (error) {
      console.error('Failed to delete from localStorage:', error);
    }
  },

  /**
   * Clear all data (for testing or reset)
   */
  async clearAll(): Promise<void> {
    try {
      const db = await getDB();
      await db.clear(STORE_NAME);
    } catch (error) {
      console.error('Failed to clear IndexedDB:', error);
    }

    // Also clear localStorage
    try {
      const indexKey = 'arian-project-index';
      const index = JSON.parse(localStorage.getItem(indexKey) || '[]') as string[];
      for (const id of index) {
        localStorage.removeItem(`arian-project-${id}`);
      }
      localStorage.removeItem(indexKey);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};
