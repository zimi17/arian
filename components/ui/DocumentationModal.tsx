import React, { useState } from 'react';
import { BookOpen, FileText, HelpCircle, ChevronRight, X } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const documentationSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: `
# Getting Started with Qualitative Analysis App

This application helps you perform grounded theory analysis on your qualitative data. The workflow follows these steps:

1. **Input**: Upload your text data (interviews, observations, etc.)
2. **Open Coding**: Identify and code key concepts in your data
3. **Axial Coding**: Group codes into categories
4. **Selective Coding**: Develop your core theory

## Quick Start
- Click "Add New Data" to import your qualitative data
- Each dataset should be separated by double line breaks
- Use the ribbon interface at the top to navigate between functions
    `
  },
  {
    id: 'data-input',
    title: 'Data Input',
    content: `
# Data Input Guide

The input step allows you to add qualitative data to your project.

## Adding Data
- Type directly into the text area
- Paste from your clipboard
- Upload text, JSON, or CSV files

## Dataset Organization
- Each dataset needs a name for identification
- Segments are automatically created by splitting on double line breaks
- You can view all datasets in the left panel
    `
  },
  {
    id: 'open-coding',
    title: 'Open Coding',
    content: `
# Open Coding Guide

Open coding is the first step of grounded theory analysis where you identify initial codes.

## Creating Codes
- Codes can be created automatically or manually
- Each code has a name, description, and frequency
- Codes are linked to the text segments where they appear

## Managing Codes
- Select codes to see their related segments
- Use the "Merge" function to combine similar codes
- Use the "Exclude" function to remove unwanted codes
    `
  },
  {
    id: 'axial-coding',
    title: 'Axial Coding',
    content: `
# Axial Coding Guide

Axial coding involves grouping open codes into broader categories.

## Creating Categories
- Drag codes from the left into categories on the right
- Each category has a name and description
- Categories help organize related codes together

## Visualization
- The "Relationship Map" view shows connections between categories
- Categories with many connections are more central to your theory
    `
  },
  {
    id: 'selective-coding',
    title: 'Selective Coding',
    content: `
# Selective Coding Guide

Selective coding is the final step where you develop your core theory.

## Theory Development
- The application will generate an initial theoretical narrative
- You can edit this narrative to refine your theory
- The core category represents the central phenomenon in your study

## Exporting Results
- Use the export functions to save your analysis
- Reports can be exported in multiple formats
    `
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    content: `
# Keyboard Shortcuts

## Global Shortcuts
- **Ctrl+K / ⌘+K**: Global search
- **Ctrl+Shift+N / ⌘+Shift+N**: Create new project
- **Ctrl+S / ⌘+S**: Save project
- **Ctrl+E / ⌘+E**: Export project
- **Ctrl+→ / ⌘+→**: Go to next step
- **Ctrl+← / ⌘+←**: Go to previous step
- **Ctrl+Shift+C / ⌘+Shift+C**: Add new code
- **Ctrl+Shift+V / ⌘+Shift+V**: Visualization view
    `
  }
];

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState(documentationSections[0].id);

  if (!isOpen) return null;

  const activeContent = documentationSections.find(section => section.id === activeSection) || documentationSections[0];

  // Simple markdown to HTML conversion for headings and paragraphs
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) {
          return <h2 key={i} className="text-2xl font-bold text-slate-800 mt-6 mb-4">{line.substring(2)}</h2>;
        } else if (line.startsWith('## ')) {
          return <h3 key={i} className="text-xl font-semibold text-slate-700 mt-5 mb-3">{line.substring(3)}</h3>;
        } else if (line.trim() === '') {
          return <div key={i} className="my-2"></div>;
        } else {
          return <p key={i} className="text-slate-600 mb-3 leading-relaxed">{line}</p>;
        }
      });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-gray-800">Documentation</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
            <div className="p-4">
              <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Table of Contents
              </h4>
              <ul className="space-y-1">
                {documentationSections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-800 font-medium'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <ChevronRight className="w-3 h-3" />
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold text-slate-800 mb-6">{activeContent.title}</h1>
              <div className="prose prose-slate max-w-none">
                {renderMarkdown(activeContent.content)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
          Qualitative Analysis App - Version 1.0
        </div>
      </div>
    </div>
  );
};