import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { notepadEditingProps } from '../editor/notepadEditing';

const SAVE_STATUS = {
  saving: { text: 'Saving…', className: 'text-amber-600 dark:text-amber-400 animate-pulse' },
  edited: { text: 'Edited', className: 'text-amber-600 dark:text-amber-400' },
  saved: { text: 'Saved', className: 'text-slate-400 dark:text-slate-500' },
  error: { text: 'Not saved', className: 'text-red-500' },
};

export default function Editor({ note, onUpdate, saveStatus }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: note?.content || '',
    editorProps: notepadEditingProps(),
    parseOptions: { preserveWhitespace: true },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const firstLine = text.split('\n')[0]?.trim() || 'Untitled Note';
      
      if (onUpdate) {
        onUpdate(html, firstLine);
      }
    },
  });

  useEffect(() => {
    if (editor && note) {
      if (editor.getHTML() !== note.content) {
        editor.commands.setContent(note.content || '', false, { preserveWhitespace: true });
      }
    }
  }, [note?.id, editor]);

  if (!editor) return null;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg text-sm font-semibold transition-all ${
            editor.isActive('bold') 
              ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg text-sm transition-all ${
            editor.isActive('italic') 
              ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-2 0l-4 16m-2 0h4" />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg text-xs font-bold transition-all ${
            editor.isActive('heading', { level: 1 }) 
              ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
          }`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg text-xs font-bold transition-all ${
            editor.isActive('heading', { level: 2 }) 
              ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
          }`}
        >
          H2
        </button>
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-all ${
            editor.isActive('bulletList') 
              ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg transition-all ${
            editor.isActive('blockquote') 
              ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
        <span
          aria-live="polite"
          className={`ml-auto mr-1 text-xs font-medium whitespace-nowrap transition-colors duration-300 ${
            (SAVE_STATUS[saveStatus] || SAVE_STATUS.saved).className
          }`}
        >
          {(SAVE_STATUS[saveStatus] || SAVE_STATUS.saved).text}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <EditorContent editor={editor} className="prose prose-slate dark:prose-invert max-w-none" />
      </div>
    </div>
  );
}
