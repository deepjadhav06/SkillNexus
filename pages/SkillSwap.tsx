import React, { useState, useEffect } from 'react';
import { User, SwapRequest } from '../types';
import { mockService } from '../services/mockService';
import { SKILLS } from '../constants';
import { ChatWindow } from '../components/ChatWindow';

interface SkillSwapProps {
  currentUser: User;
  onNavigate?: (page: string) => void;
}

export const SkillSwap: React.FC<SkillSwapProps> = ({ currentUser, onNavigate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [filterSkill, setFilterSkill] = useState<string>('all');
  const [openChat, setOpenChat] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const allUsers = await mockService.getUsers();
      const allRequests = await mockService.getSwapRequests();
      setUsers(allUsers.filter(u => u.id !== currentUser.id));
      setRequests(allRequests);
    };
    
    loadData();
    
    // Poll for new messages - reduced to 5s to improve performance
    const interval = setInterval(async () => {
      const allRequests = await mockService.getSwapRequests();
      setRequests(allRequests);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleRequestSwap = async (targetUser: User, skillId: string) => {
    await mockService.createSwapRequest(currentUser.id, targetUser.id, skillId);
    const allRequests = await mockService.getSwapRequests();
    setRequests(allRequests);
    alert(`Swap request sent to ${targetUser.name}!`);
  };

  const handleAccept = async (req: SwapRequest) => {
    await mockService.acceptSwap(req.id);
    const allRequests = await mockService.getSwapRequests();
    setRequests(allRequests);
  };

  // Logic: Find users who OFFER what I WANT, or users who WANT what I OFFER
  const filteredUsers = users.filter(u => {
    if (filterSkill === 'all') return true;
    return u.skillsOffered.includes(filterSkill);
  });

  const getSkillName = (id: string) => SKILLS.find(s => s.id === id)?.name || id;

  const getRequestStatus = (targetId: string, skillId: string) => {
    const req = requests.find(
      r => r.requesterId === currentUser.id && r.targetUserId === targetId && r.skillId === skillId
    );
    if (!req) return null;
    return req.status;
  };

  const incomingRequests = requests.filter(r => r.targetUserId === currentUser.id && r.status === 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Incoming Requests Section */}
      {incomingRequests.length > 0 && (
        <div className="mb-10 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/30 dark:to-indigo-900/10 border-2 border-indigo-200 dark:border-indigo-800/50 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-indigo-700 dark:from-indigo-200 dark:to-indigo-400 mb-4">Incoming Requests</h2>
          <div className="grid gap-4">
            {incomingRequests.map(req => {
              const requester = users.find(u => u.id === req.requesterId) || { name: 'Unknown User' };
              return (
                <div key={req.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex items-center justify-between border-2 border-indigo-100 dark:border-indigo-700/50 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                  <div className="text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-lg">{requester?.name}</span> wants to learn 
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 mx-2 text-lg">{getSkillName(req.skillId)}</span> 
                    from you.
                  </div>
                  <div className="space-x-2">
                    <button 
                      onClick={() => handleAccept(req)}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                      Accept Swap
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Skill Swap Hub</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Find a partner. Swap skills. Unlock resources.</p>
        </div>
        <div className="mt-4 md:mt-0">
            <select 
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
            >
                <option value="all">All Skills</option>
                {SKILLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{user.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Can Teach</p>
                <div className="flex flex-wrap gap-2">
                  {user.skillsOffered.map(sid => (
                    <span key={sid} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-full border border-emerald-100 dark:border-emerald-900/30">
                      {getSkillName(sid)}
                    </span>
                  ))}
                  {user.skillsOffered.length === 0 && <span className="text-xs text-slate-400 italic">None listed</span>}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Wants to Learn</p>
                <div className="flex flex-wrap gap-2">
                  {user.skillsWanted.map(sid => (
                    <span key={sid} className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs rounded-full border border-amber-100 dark:border-amber-900/30">
                      {getSkillName(sid)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {user.skillsOffered.map(skillId => {
                    const status = getRequestStatus(user.id, skillId);
                    const swapWithUser = requests.find(r => 
                      r.requesterId === currentUser.id && 
                      r.targetUserId === user.id && 
                      r.skillId === skillId && 
                      r.status === 'ACCEPTED'
                    );
                    
                    if (status === 'ACCEPTED') {
                        return (
                          <div key={skillId} className="flex gap-2">
                             <button disabled className="flex-1 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 text-emerald-700 dark:text-emerald-400 py-2 rounded-lg text-xs font-bold border-2 border-emerald-200 dark:border-emerald-800/30">
                                {getSkillName(skillId)} Unlocked
                            </button>
                             <button
                              onClick={() => swapWithUser && setOpenChat(swapWithUser.id)}
                              className="px-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-xs font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                              title="Chat with user"
                            >
                              💬 Chat
                            </button>
                             {onNavigate && (
                              <button 
                                onClick={() => onNavigate('resources')}
                                className="px-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg text-xs font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                title="Go to Learning Materials"
                              >
                                Go Learn
                              </button>
                             )}
                          </div>
                           
                        )
                    }
                    if (status === 'PENDING') {
                         return (
                            <button key={skillId} disabled className="w-full bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/20 text-amber-700 dark:text-amber-400 py-2 rounded-lg text-sm font-bold border-2 border-amber-300 dark:border-amber-700/40">
                                Request Sent ({getSkillName(skillId)})
                            </button>
                        )
                    }

                    return (
                        <button 
                            key={skillId}
                            onClick={() => handleRequestSwap(user, skillId)}
                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-600 text-white py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Request to learn {getSkillName(skillId)}
                        </button>
                    )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      {openChat && (() => {
        const swap = requests.find(r => r.id === openChat && r.status === 'ACCEPTED');
        if (!swap) return null;
        
        const otherUserId = swap.requesterId === currentUser.id ? swap.targetUserId : swap.requesterId;
        const otherUser = users.find(u => u.id === otherUserId);
        
        return (
          <ChatWindow
            swapId={openChat}
            currentUserId={currentUser.id}
            currentUserName={currentUser.name}
            otherUserName={otherUser?.name || 'User'}
            onClose={() => setOpenChat(null)}
          />
        );
      })()}
    </div>
  );
};