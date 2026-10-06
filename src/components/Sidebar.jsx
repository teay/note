import React, { useState, useMemo } from 'react';
import { Search, Download, Pin } from 'lucide-react';
import { htmlToPlainText } from '../utils/text';

function getPlainText(content) {
  if (!content) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  let text = tempDiv.innerText || '';
  text = text.replace(/^#+\s*/gm, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');
  return text.replace(/\n+/g, ' ').trim();
}

function getTitle(content) {
  if (!content) return 'Untitled';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const lines = (tempDiv.innerText || '').split('\n');
  const title = lines[0]?.trim();
  return title && title.length > 0 ? title.substring(0, 40) : 'Untitled';
}

function truncate(text, max) {
  return text.length > max ? text.substring(0, max) + '...' : text;
}

function getPreview(text, query) {
  if (!text) return '';
  if (!query) return truncate(text, 50);
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return truncate(text, 50);
  const start = Math.max(0, idx - 20);
  const end = Math.min(text.length, start + 60);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const parts = [];
  const lower = text.toLowerCase();
  let i = 0;
  let idx = lower.indexOf(query);
  while (idx !== -1) {
    if (idx > i) parts.push(text.slice(i, idx));
    parts.push(
      <mark key={idx} className="bg-amber-300 text-slate-900 rounded-sm">
        {text.slice(idx, idx + query.length)}
      </mark>
    );
    i = idx + query.length;
    idx = lower.indexOf(query, i);
  }
  parts.push(text.slice(i));
  return <>{parts}</>;
}

export default function Sidebar({ notes, activeNoteId, onSelectNote, isOpen }) {
  const [search, setSearch] = useState('');
  const metaCacheRef = React.useRef(new Map());

  const items = useMemo(() => {
    const cache = metaCacheRef.current;
    const liveIds = new Set();
    const result = notes.map((note) => {
      liveIds.add(note.id);
      const cached = cache.get(note.id);
      if (cached && cached.content === note.content) {
        return { note, title: cached.title, text: cached.text };
      }
      const meta = {
        content: note.content,
        title: getTitle(note.content),
        text: getPlainText(note.content)
      };
      cache.set(note.id, meta);
      return { note, title: meta.title, text: meta.text };
    });

    cache.forEach((value, id) => {
      if (!liveIds.has(id)) cache.delete(id);
    });

    return result;
  }, [notes]);

  const query = search.trim().toLowerCase();

  const filteredNotes = useMemo(() => {
    if (!query) return items;
    return items.filter((item) => item.text.toLowerCase().includes(query));
  }, [items, query]);

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const sections = notes.map((note) => {
      const full = htmlToPlainText(note.content);
      const lines = full.split('\n');
      const title = (lines[0] || '').trim() || 'Untitled';
      const body = lines.slice(1).join('\n').trim();
      const updated = note.updatedAt?.toDate ? note.updatedAt.toDate().toISOString().slice(0, 10) : '';
      return `## ${title}${updated ? ` (${updated})` : ''}\n\n${body}`;
    });
    const content = `# Notes export ${date}\n\n${sections.join('\n\n---\n\n')}\n`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${date}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const pinnedItems = filteredNotes.filter((item) => item.note.pinned);
  const otherItems = filteredNotes.filter((item) => !item.note.pinned);
  const sectionHeader = 'px-3 pt-2 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500';

  const renderRow = ({ note, title, text }) => {
    const isActive = activeNoteId === note.id;
    const preview = getPreview(text, query) || 'Start writing...';
    const date = note.updatedAt?.toDate ? note.updatedAt.toDate() : null;

    return (
      <button
        key={note.id}
        onClick={() => onSelectNote(note.id)}
        className={`relative w-full text-left p-3 rounded-xl transition-all duration-150 ${
          isActive
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-300/30'
            : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
        }`}
      >
        {note.pinned && (
          <span
            className={`absolute top-2.5 right-2.5 leading-none ${
              isActive ? 'text-slate-900/70' : 'text-slate-500 dark:text-amber-400'
            }`}
            title="Pinned"
          >
            <Pin size={13} fill="currentColor" />
          </span>
        )}
        <div className={`font-bold text-sm leading-tight truncate ${note.pinned ? 'pr-6' : ''}`}>
          <Highlight text={title} query={query} />
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className={`text-xs truncate flex-1 ${isActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
            <Highlight text={preview} query={query} />
          </div>
          {date && (
            <span className={`text-[10px] ml-2 flex-shrink-0 ${isActive ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'}`}>
              {date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </button>
    );
  };

  const renderList = (
    <>
      {pinnedItems.length > 0 && (
        <div className={sectionHeader}>Pinned</div>
      )}
      {pinnedItems.map(renderRow)}
      {pinnedItems.length > 0 && otherItems.length > 0 && (
        <div className={sectionHeader}>Others</div>
      )}
      {otherItems.map(renderRow)}
    </>
  );

  return (
    <div className="w-full md:w-80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-700/80 flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold px-1 text-slate-800 dark:text-slate-100 tracking-tight">my note</h1>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExport}
              title="Export all notes (.md)"
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-150"
            >
              <Download size={14} />
            </button>
            <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {filteredNotes.length}
            </span>
          </div>
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
          renderList
        )}
      </div>
    </div>
  );
}
