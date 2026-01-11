import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { SkillSwap } from './pages/SkillSwap';
import { Resources } from './pages/Resources';
import { Messages } from './pages/Messages';
import { Statistics } from './pages/Statistics';
import { mockService } from './services/mockService';
import { About } from './pages/About';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check for existing session
    const initUser = async () => {
      const currentUser = await mockService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setCurrentPage('dashboard');
      }
    };
    
    initUser();

    // Initialize Theme
    const savedTheme = localStorage.getItem('skillnexus_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Sync user state to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('skillnexus_current_user', JSON.stringify(user));
    }
  }, [user]);

  // Sync backend data once on app load
  useEffect(() => {
    const syncAllData = async () => {
      await mockService.getUsers();
      await mockService.getResources();
      await mockService.getSwapRequests();
    };
    syncAllData();
  }, []);


  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('skillnexus_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    await mockService.logout();
    setUser(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'dashboard':
        return user ? <Dashboard user={user} /> : <Login onLogin={handleLogin} />;
      case 'swap':
        return user ? <SkillSwap currentUser={user} onNavigate={setCurrentPage} /> : <Login onLogin={handleLogin} />;
      case 'messages':
        return user ? <Messages user={user} /> : <Login onLogin={handleLogin} />;
      case 'statistics':
        return user ? <Statistics /> : <Login onLogin={handleLogin} />;
      case 'resources':
        return user ? <Resources user={user} /> : <Login onLogin={handleLogin} />;
      case 'about':
        return <About onNavigate={setCurrentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navigation 
        user={user} 
        onLogout={handleLogout} 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;