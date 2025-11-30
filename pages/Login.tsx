import React, { useState } from 'react';
import { mockService } from '../services/mockService';
import { User } from '../types';
import { SKILLS } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login State
  const [email, setEmail] = useState('');
  
  // Register State
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [offered, setOffered] = useState<string[]>([]);
  const [wanted, setWanted] = useState<string[]>([]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    
    try {
      const user = await mockService.login(email);
      if (user) {
        onLogin(user);
      } else {
        setError('User not found. Check your email or sign up.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!regEmail.includes('@') || !regEmail.includes('.')) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
    }
    if (offered.length === 0) {
        setError('Please select at least one skill to teach.');
        setLoading(false);
        return;
    }
    if (wanted.length === 0) {
        setError('Please select at least one skill to learn.');
        setLoading(false);
        return;
    }

    try {
        const newUser = await mockService.register(name, regEmail, offered, wanted);
        onLogin(newUser);
    } catch (err: any) {
        setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (list: string[], setList: (s: string[]) => void, id: string) => {
    if (list.includes(id)) {
        setList(list.filter(item => item !== id));
    } else {
        setList([...list, id]);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden p-8 border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {isRegistering ? 'Join the community to swap skills' : 'Sign in to access your dashboard'}
          </p>
        </div>
        
        {error && <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">{error}</div>}

        {!isRegistering ? (
            // LOGIN FORM
            <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white dark:bg-slate-800 dark:text-white placeholder-slate-400"
                placeholder="you@example.com"
                required
                />
            </div>
            
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
                {loading ? 'Signing In...' : 'Sign In'}
            </button>
            </form>
        ) : (
            // REGISTER FORM
             <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                    placeholder="John Doe"
                    required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                    <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                    placeholder="you@example.com"
                    required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">I can teach:</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                        {SKILLS.map(skill => (
                            <label key={skill.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded">
                                <input 
                                    type="checkbox" 
                                    checked={offered.includes(skill.id)}
                                    onChange={() => toggleSkill(offered, setOffered, skill.id)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-slate-700 dark:text-slate-200">{skill.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">I want to learn:</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                        {SKILLS.map(skill => (
                            <label key={skill.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded">
                                <input 
                                    type="checkbox" 
                                    checked={wanted.includes(skill.id)}
                                    onChange={() => toggleSkill(wanted, setWanted, skill.id)}
                                    className="rounded text-amber-500 focus:ring-amber-500"
                                />
                                <span className="text-slate-700 dark:text-slate-200">{skill.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>
        )}

        <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
                {isRegistering ? "Already have an account?" : "Don't have an account?"}
                <button 
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="ml-2 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                >
                    {isRegistering ? "Sign In" : "Sign Up"}
                </button>
            </p>
        </div>

        {!isRegistering && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-500">
            <p className="font-medium mb-2">Demo Accounts:</p>
            <button onClick={() => { setEmail('owner@skillnexus.com'); }} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded mr-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                owner@skillnexus.com (Admin)
            </button>
             <button onClick={() => { setEmail('alice@example.com'); }} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                alice@example.com (User)
            </button>
            </div>
        )}
      </div>
    </div>
  );
};