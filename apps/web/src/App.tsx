// apps/web/src/App.tsx
import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg'; // Vite logo example
import viteLogo from '/vite.svg'; // Vite logo example
import './App.css';

import { User, DreamEntry } from '@somni/types'; // Import from shared package
import { formatDate } from '@somni/utils';   // Import from shared package
import { supabase } from './lib/supabase'; // Import the Supabase client

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [dream, setDream] = useState<DreamEntry | null>(null);
  const [message, setMessage] = useState<string>("Loading web data...");
  const [sessionStatus, setSessionStatus] = useState<string>("Checking Supabase connection...");

  useEffect(() => {
    setUser({ id: 'user-web-456', email: 'web@example.com' });
    const today = new Date();
    setDream({
      id: 'dream-web-1',
      userId: 'user-web-456',
      date: today.toISOString(),
      title: 'My First Web Dream',
      content: 'Logged from the web app!',
      tags: ['vite', 'web'],
    });
    setMessage("Web data loaded!");

    // Test Supabase connection
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          setSessionStatus(`Supabase Error: ${error.message}`);
        } else if (session) {
          setSessionStatus('Connected to Supabase: Logged In');
        } else {
          setSessionStatus('Connected to Supabase: Logged Out');
        }
      } catch (e: any) {
        setSessionStatus(`Supabase Connection Error: ${e.message}`);
      }
    };
    checkSession();
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>SOMNI Web App (Vite + React)</h1>
      <p>{message}</p>
      <p>{sessionStatus}</p> {/* Display session status */}

      {user && (
        <div className="card">
          <h2>User Info</h2>
          <p>ID: {user.id}</p>
          <p>Email: {user.email || 'N/A'}</p>
        </div>
      )}

      {dream && (
        <div className="card">
          <h2>Latest Dream</h2>
          <p>Title: {dream.title}</p>
          <p>Date: {formatDate(dream.date)}</p>
          <p>Content: {dream.content}</p>
          {dream.tags && <p>Tags: {dream.tags.join(', ')}</p>}
        </div>
      )}
    </>
  );
}

export default App;