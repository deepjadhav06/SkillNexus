import React from 'react';
import { User } from '../types';

interface NavigationProps {
  user: User | null;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ user, onLogout, currentPage, onNavigate, theme, toggleTheme }) => {
  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-900 dark:to-indigo-950 text-white shadow-xl sticky top-0 z-50 transition-all duration-300 border-b border-indigo-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="relative mr-3">
              <svg className="w-8 h-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="absolute inset-0 bg-white/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">SkillNexus</span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {user && (
                <>
                  {[
                    { key: 'dashboard', label: 'Dashboard' },
                    { key: 'swap', label: 'Skill Swap' },
                    { key: 'messages', label: '💬 Messages' },
                    { key: 'statistics', label: '📊 Statistics' },
                    { key: 'resources', label: 'My Learning' },
                    { key: 'about', label: 'About' }
                  ].map((page) => (
                    <button 
                      key={page.key}
                      onClick={() => onNavigate(page.key)} 
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                        currentPage === page.key 
                          ? 'bg-white/20 text-white shadow-lg shadow-indigo-500/20' 
                          : 'text-indigo-50 hover:text-white'
                      }`}
                    >
                      <span className="relative z-10">{page.label}</span>
                      {currentPage === page.key && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-white via-indigo-100 to-transparent"></div>
                      )}
                      {currentPage !== page.key && (
                        <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/20 focus:outline-none transition-all duration-300 group relative"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              <div className="absolute inset-0 bg-white/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></div>
              {theme === 'light' ? (
                <svg className="w-5 h-5 text-indigo-100 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-yellow-300 group-hover:text-yellow-200 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-3 sm:space-x-4">
                <span className="text-sm opacity-90 hidden sm:block font-medium">Hi, {user.name}</span>
                <button
                  onClick={onLogout}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-white/20 hover:border-white/40"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('about')}
                  className="text-sm text-white/90 px-3 py-2 rounded hover:bg-white/10 transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-white/30 transition-all duration-300 hover:scale-105"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};