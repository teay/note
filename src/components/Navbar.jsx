import React from 'react';
import { SquarePen, Trash2, LogIn, LogOut, PanelLeft, Sun, Moon, Copy, Check } from 'lucide-react';

export default function Navbar({ user, onLogin, onLogout, onNewNote, onDeleteNote, activeNoteId, toggleSidebar, darkMode, setDarkMode, onCopy }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-14 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleSidebar} 
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-150 hover:scale-105 active:scale-95"
        >
          <PanelLeft size={20} />
        </button>
        <div className="hidden md:flex items-center gap-2 ml-2">
          <img src="./logo.png" alt="note Logo" className="w-7 h-7 rounded-lg shadow-sm object-cover" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">note</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {user ? (
          <>
            {activeNoteId && (
              <>
                <button 
                  onClick={handleCopy}
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-150 hover:scale-105 active:scale-95"
                  title="Copy content"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
                <button 
                  onClick={onDeleteNote} 
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-150 hover:scale-105 active:scale-95"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
            <button 
              onClick={onNewNote} 
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-150 hover:scale-105 active:scale-95"
            >
              <SquarePen size={18} />
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-150 hover:scale-105 active:scale-95"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <div className="flex items-center gap-2">
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt="" 
                  className="w-7 h-7 rounded-full ring-2 ring-slate-200 dark:ring-slate-700"
                />
              )}
              <button 
                onClick={onLogout} 
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-150"
              >
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={onLogin} 
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-iosYellow to-amber-500 text-white rounded-full font-medium text-sm shadow-md shadow-amber-200/50 hover:shadow-lg hover:shadow-amber-300/50 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <LogIn size={16} /> Sign In
          </button>
        )}
      </div>
    </div>
  );
}
