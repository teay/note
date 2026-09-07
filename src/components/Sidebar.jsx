import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

function getPreviewText(content) {
  if (!content) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  let text = tempDiv.innerText || '';
  text = text.replace(/^#+\s*/gm, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');
  text = text.replace(/\n+/g, ' ').trim();
  return text.length > 50 ? text.substring(0, 50) + '...' : text;
}

function getTitle(content) {
  if (!content) return 'Untitled';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const lines = (tempDiv.innerText || '').split('\n');
  const title = lines[0]?.trim();
  return title && title.length > 0 ? title.substring(0, 40) : 'Untitled';
}

export default function Sidebar({ notes, activeNoteId, onSelectNote, isOpen }) {
  const [search, setSearch] = useState('');

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter((note) => {
      const title = getTitle(note.content).toLowerCase();
      const body = getPreviewText(note.content).toLowerCase();
      return title.includes(q) || body.includes(q);
    });
  }, [notes, search]);

  if (!isOpen) return null;

  return (
    <div className="w-full md:w-80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-700/80 flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold px-1 text-slate-800 dark:text-slate-100 tracking-tight">my note</h1>
          <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {filteredNotes.length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border-0 outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-amber-300/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-200"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500">
            <svg className="w-10 h-10 mb-2 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">{search ? 'No matching notes' : 'No notes yet'}</p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const title = getTitle(note.content);
            const body = getPreviewText(note.content) || 'Start writing...';
            const date = note.updatedAt?.toDate ? note.updatedAt.toDate() : null;

            return (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-150 ${
                  activeNoteId === note.id 
                    ? 'bg-gradient-to-r from-iosYellow to-amber-500 text-white shadow-md shadow-amber-200/40' 
                    : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-semibold text-sm truncate leading-tight">{title}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className={`text-xs truncate flex-1 ${activeNoteId === note.id ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                    {body}
                  </div>
                  {date && (
                    <span className={`text-[10px] ml-2 flex-shrink-0 ${activeNoteId === note.id ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'}`}>
                      {date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
