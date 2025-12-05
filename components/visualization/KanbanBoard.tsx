import React, { useState } from 'react';
import { Code, Category } from '../../types';
import { GripVertical, Edit3, Plus, Trash2 } from 'lucide-react';

interface KanbanBoardProps {
  codes: Code[];
  categories: Category[];
  onCategoryUpdate: (categories: Category[]) => void;
  onCodeUpdate: (codes: Code[]) => void;
  onCategoryAdd: (newCategory: Omit<Category, 'id'>) => void;
  onCategoryDelete: (categoryId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  codes, 
  categories, 
  onCategoryUpdate,
  onCodeUpdate,
  onCategoryAdd,
  onCategoryDelete
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Function to move a code to a different category
  const moveCode = (codeId: string, targetCategoryId: string) => {
    const updatedCategories = categories.map(category => {
      // Remove code from its current category
      const categoryWithoutCode = {
        ...category,
        codeIds: category.codeIds.filter(id => id !== codeId)
      };
      
      // If this is the target category, add the code
      if (category.id === targetCategoryId) {
        return {
          ...categoryWithoutCode,
          codeIds: [...categoryWithoutCode.codeIds, codeId]
        };
      }
      
      return categoryWithoutCode;
    });
    
    onCategoryUpdate(updatedCategories);
  };

  // Function to create a new category
  const createNewCategory = () => {
    if (!newCategoryName.trim()) return;
    
    onCategoryAdd({
      name: newCategoryName,
      codeIds: [],
      description: '',
      connections: [],
      centrality: 1,
      memo: ''
    });
    
    setNewCategoryName('');
  };

  // Function to add a new code to a category
  const addNewCodeToCategory = (categoryId: string) => {
    const codeName = prompt("Enter code name:");
    if (codeName) {
      const newCode = {
        id: `code-${Date.now()}`,
        name: codeName,
        frequency: 0,
        segmentIds: [],
        description: '',
        memo: ''
      };
      
      // Update codes list
      onCodeUpdate([...codes, newCode]);
      
      // Add to selected category
      const updatedCategories = categories.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            codeIds: [...category.codeIds, newCode.id]
          };
        }
        return category;
      });
      
      onCategoryUpdate(updatedCategories);
    }
  };

  return (
    <div className="kanban-board h-full overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {/* Backlog Column - Codes not assigned to any category */}
        <div className="flex flex-col w-72 bg-slate-100 rounded-lg border border-slate-200">
          <div className="p-3 border-b border-slate-200 bg-slate-200 rounded-t-lg flex items-center justify-between">
            <h3 className="font-bold text-slate-700">Unassigned Codes</h3>
            <span className="bg-slate-300 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {codes.filter(code => !categories.some(cat => cat.codeIds.includes(code.id))).length}
            </span>
          </div>
          <div className="flex-1 p-2 min-h-[200px] space-y-2">
            {codes
              .filter(code => !categories.some(cat => cat.codeIds.includes(code.id)))
              .map(code => (
                <div
                  key={code.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('codeId', code.id);
                    e.dataTransfer.setData('sourceType', 'backlog');
                  }}
                  className="p-3 bg-white rounded border border-slate-200 shadow-sm text-xs flex items-start gap-2 cursor-grab active:cursor-grabbing hover:border-blue-300"
                >
                  <GripVertical className="w-3 h-3 text-slate-300 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{code.name}</div>
                    <div className="text-slate-500">Freq: {code.frequency}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Category Columns */}
        {categories.map(category => (
          <div 
            key={category.id} 
            className="flex flex-col w-72 bg-white rounded-lg border border-slate-200 shadow-sm"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const codeId = e.dataTransfer.getData('codeId');
              const sourceType = e.dataTransfer.getData('sourceType');
              
              if (sourceType === 'category' || sourceType === 'backlog') {
                moveCode(codeId, category.id);
              }
            }}
          >
            {/* Category Header */}
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between group">
              {editingCategory === category.id ? (
                <input
                  type="text"
                  className="flex-1 text-sm font-bold bg-white border border-blue-300 rounded px-2 py-1 outline-none"
                  value={newCategoryName || category.name}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  autoFocus
                  onBlur={() => {
                    if (newCategoryName.trim()) {
                      onCategoryUpdate(
                        categories.map(cat => 
                          cat.id === category.id 
                            ? { ...cat, name: newCategoryName } 
                            : cat
                        )
                      );
                    }
                    setEditingCategory(null);
                    setNewCategoryName('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (newCategoryName.trim()) {
                        onCategoryUpdate(
                          categories.map(cat => 
                            cat.id === category.id 
                              ? { ...cat, name: newCategoryName } 
                              : cat
                          )
                        );
                      }
                      setEditingCategory(null);
                      setNewCategoryName('');
                    } else if (e.key === 'Escape') {
                      setEditingCategory(null);
                      setNewCategoryName('');
                    }
                  }}
                />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-sm font-bold text-slate-800 truncate">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingCategory(category.id);
                        setNewCategoryName(category.name);
                      }}
                      className="text-slate-400 hover:text-blue-600"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => onCategoryDelete(category.id)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Category Content */}
            <div className="flex-1 p-2 min-h-[200px] space-y-2">
              {category.codeIds.map(codeId => {
                const code = codes.find(c => c.id === codeId);
                return code ? (
                  <div
                    key={code.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('codeId', code.id);
                      e.dataTransfer.setData('sourceType', 'category');
                    }}
                    className="p-3 bg-slate-50 rounded border border-slate-200 shadow-sm text-xs flex items-start gap-2 cursor-grab active:cursor-grabbing hover:border-blue-300"
                  >
                    <GripVertical className="w-3 h-3 text-slate-300 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{code.name}</div>
                      <div className="text-slate-500">Freq: {code.frequency}</div>
                    </div>
                  </div>
                ) : null;
              })}
              
              {category.codeIds.length === 0 && (
                <div className="text-[10px] text-slate-400 text-center py-4 border-2 border-dashed border-slate-200 rounded">
                  Drop codes here
                </div>
              )}
            </div>
            
            {/* Category Footer */}
            <div className="p-2 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => addNewCodeToCategory(category.id)}
                className="w-full py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Code
              </button>
            </div>
          </div>
        ))}

        {/* Add New Category Column */}
        <div className="flex flex-col w-72 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
          <div className="p-3">
            <h3 className="font-bold text-slate-500 mb-2">Add New Category</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Category name"
                className="flex-1 text-xs border border-slate-300 rounded px-2 py-1 outline-none"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') createNewCategory();
                }}
              />
              <button
                onClick={createNewCategory}
                className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};