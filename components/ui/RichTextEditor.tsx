import React, { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Quote, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

const ToolbarButton: React.FC<{ 
  icon: React.ElementType; 
  command: string; 
  arg?: string;
  title?: string;
}> = ({ icon: Icon, command, arg, title }) => {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent losing focus from editor
        document.execCommand(command, false, arg);
      }}
      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
      title={title}
      type="button"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, className }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize content once
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== value) {
      // Only set if completely empty or strictly different to prevent cursor jumps
      // A simple check to avoid overwriting user edits in progress is mostly handled by
      // only setting this on mount or external reset.
      if (contentRef.current.innerHTML === "" || value === "") {
        contentRef.current.innerHTML = value;
      }
    }
  }, []); // Run once on mount

  const handleInput = () => {
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
  };

  return (
    <div className={`flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200">
          <ToolbarButton icon={Undo} command="undo" title="Undo" />
          <ToolbarButton icon={Redo} command="redo" title="Redo" />
        </div>
        
        <div className="flex items-center gap-0.5 px-2 border-r border-slate-200">
          <ToolbarButton icon={Heading1} command="formatBlock" arg="H1" title="Heading 1" />
          <ToolbarButton icon={Heading2} command="formatBlock" arg="H2" title="Heading 2" />
        </div>

        <div className="flex items-center gap-0.5 px-2 border-r border-slate-200">
          <ToolbarButton icon={Bold} command="bold" title="Bold" />
          <ToolbarButton icon={Italic} command="italic" title="Italic" />
          <ToolbarButton icon={Underline} command="underline" title="Underline" />
        </div>

        <div className="flex items-center gap-0.5 px-2 border-r border-slate-200">
          <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
          <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
          <ToolbarButton icon={Quote} command="formatBlock" arg="blockquote" title="Quote" />
        </div>
      </div>

      {/* Editable Area */}
      <div
        ref={contentRef}
        className="flex-1 p-6 overflow-y-auto outline-none prose prose-slate max-w-none text-slate-800 font-serif leading-relaxed custom-scrollbar min-h-[300px]"
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning={true}
        style={{ minHeight: '100%' }}
      />
    </div>
  );
};