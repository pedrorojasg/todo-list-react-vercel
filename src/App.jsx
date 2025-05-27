import React, { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabaseClient'; // Ensure this path is correct
import Auth from './components/Auth';
import TodoList from './components/TodoList';
import UpdatePassword from './components/UpdatePassword'; // Import UpdatePassword

function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [appView, setAppView] = useState('auth'); // 'auth', 'todolist', 'updatePassword'

  useEffect(() => {
    setLoadingSession(true);
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession) {
        // Check if this session is from a password recovery link
        // The URL hash will contain #access_token=...&type=recovery
        // For simplicity, we are relying on onAuthStateChange to also give us this info via the event.
        // If onAuthStateChange immediately provides a session with type recovery, we can switch view.
        // This part can be tricky without a router to parse URL hash directly.
        setAppView('todolist');
      } else {
        setAppView('auth');
      }
      setLoadingSession(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth event:', event, 'Session:', currentSession);
        setSession(currentSession);
        if (event === 'PASSWORD_RECOVERY') {
          setAppView('updatePassword'); 
        } else if (currentSession) {
          setAppView('todolist');
        } else {
          setAppView('auth');
        }
        setLoadingSession(false);
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []); // Only run once on mount

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null); // Explicitly set session to null
    setAppView('auth'); // Switch view to auth on sign out
    console.log('Signed out successfully');
  };
  
  let content;
  if (loadingSession) {
    content = (
      <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col items-center justify-center pt-10">
        <p className="text-xl text-indigo-400">Loading session...</p>
      </div>
    );
  } else if (appView === 'updatePassword') {
    content = <UpdatePassword />;
  } else if (appView === 'todolist' && session) {
    content = <TodoList key={session.user.id} />;
  } else { // Default to auth view
    content = <Auth />;
  }

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col items-center pt-10">
      <header className="w-full max-w-lg px-4 mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-indigo-400">Todo List</h1>
        {session && appView === 'todolist' && ( // Only show signout if session exists and on todolist view
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded text-sm focus:outline-none focus:shadow-outline"
          >
            Sign Out
          </button>
        )}
      </header>
      <main className="w-full max-w-lg px-4">
        {content}
      </main>
    </div>
  );
}

export default App;
