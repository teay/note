import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, googleProvider, signInWithPopup, signOut } from './firebase';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Navbar from './components/Navbar';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (error.code === 'auth/popup-blocked') {
        setLoginError('Popup blocked by browser. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setLoginError('Login cancelled. Please try again.');
      } else {
        setLoginError('Login failed. Please try again later.');
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setActiveNoteId(null);
      return;
    }

    const q = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      notesData.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis() || 0;
        const timeB = b.updatedAt?.toMillis() || 0;
        return timeB - timeA;
      });

      setNotes(notesData);
      
      if (notesData.length > 0 && !activeNoteId) {
        setActiveNoteId(notesData[0].id);
      }
    });

    return () => unsubscribe();
  }, [user, activeNoteId]);

  const handleCreateNote = async () => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'notes'), {
        userId: user.uid,
        content: '<p></p>',
        title: 'Untitled Note',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setActiveNoteId(docRef.id);
    } catch (error) {
      console.error("Error creating note: ", error);
    }
  };

  const handleUpdateNote = async (updatedContent, title) => {
    if (!activeNoteId) return;
    try {
      const noteRef = doc(db, 'notes', activeNoteId);
      await updateDoc(noteRef, {
        content: updatedContent,
        title: title || 'Untitled Note',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating note: ", error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      if (activeNoteId === noteId) {
        setActiveNoteId(null);
      }
    } catch (error) {
      console.error("Error deleting note: ", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 border-3 border-iosYellow border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 px-6">
        <div className="text-center animate-fade-in">
          <img src="./logo.png" alt="note Logo" className="w-20 h-20 rounded-3xl shadow-xl shadow-amber-500/20 mx-auto mb-6 object-cover" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">note</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Capture your thoughts, anywhere.</p>
          <button 
            onClick={handleLogin}
            className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          {loginError && (
            <p className="mt-4 text-sm text-red-500 dark:text-red-400 animate-fade-in">{loginError}</p>
          )}
        </div>
      </div>
    );
  }

  const activeNote = notes.find((n) => n.id === activeNoteId);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-900 overflow-hidden">
      <Navbar 
        user={user}
        onLogin={handleLogin}
        onLogout={() => signOut(auth)}
        onNewNote={handleCreateNote}
        onDeleteNote={() => handleDeleteNote(activeNoteId)}
        activeNoteId={activeNoteId}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          notes={notes} 
          activeNoteId={activeNoteId} 
          onSelectNote={(id) => { setActiveNoteId(id); if (window.innerWidth < 768) setSidebarOpen(false); }}
          isOpen={sidebarOpen}
        />
        <main className="flex-1 h-full overflow-y-auto bg-slate-50/50 dark:bg-slate-800/50">
          {activeNote ? (
            <Editor 
              key={activeNote.id} 
              note={activeNote} 
              onUpdate={handleUpdateNote} 
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 animate-fade-in">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No note selected</p>
              <button 
                onClick={handleCreateNote} 
                className="mt-3 text-iosYellow hover:text-amber-600 font-medium text-sm transition-colors"
              >
                Create a new note
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
