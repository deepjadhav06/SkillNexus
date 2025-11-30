import React, { useState, useEffect } from 'react';
import { User, Resource, UserRole, SwapRequest } from '../types';
import { mockService } from '../services/mockService';
import { SKILLS } from '../constants';
import { generateSkillQuiz } from '../services/geminiService';

interface ResourcesProps {
  user: User;
}

export const Resources: React.FC<ResourcesProps> = ({ user }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newRes, setNewRes] = useState({ title: '', url: '', skillId: SKILLS[0].id, type: 'PDF' as 'PDF' | 'LINK' | 'VIDEO' });
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [certificateData, setCertificateData] = useState<{skill: string, date: string} | null>(null);
  const [mySwaps, setMySwaps] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await mockService.getResources();
        const swaps = await mockService.getSwapRequests();
        const allUsers = await mockService.getUsers();
        setResources(res);
        setMySwaps(swaps);
        setUsers(allUsers);
      } catch (err) {
        console.error('Error loading resources:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const res: Resource = {
      id: Date.now().toString(),
      skillId: newRes.skillId,
      title: newRes.title,
      url: newRes.url,
      type: newRes.type,
      uploadedBy: user.id
    };
    await mockService.addResource(res);
    const resources = await mockService.getResources();
    setResources(resources);
    setNewRes({ title: '', url: '', skillId: SKILLS[0].id, type: 'PDF' });
    alert('Resource uploaded successfully!');
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      await mockService.deleteResource(resourceId);
      const resources = await mockService.getResources();
      setResources(resources);
      alert('Resource deleted successfully!');
    }
  };

  const startCertification = async (skillId: string) => {
    const skillName = SKILLS.find(s => s.id === skillId)?.name || skillId;
    setQuizLoading(true);
    const quiz = await generateSkillQuiz(skillName);
    setActiveQuiz({ ...quiz, skillId, skillName });
    setQuizAnswers(new Array(quiz.questions.length).fill(-1));
    setQuizLoading(false);
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    
    let correct = 0;
    activeQuiz.questions.forEach((q: any, idx: number) => {
      if (q.correctAnswerIndex === quizAnswers[idx]) correct++;
    });

    if (correct === activeQuiz.questions.length) {
      await mockService.completeCourse(user.id, activeQuiz.skillId);
      setCertificateData({
        skill: activeQuiz.skillName,
        date: new Date().toLocaleDateString()
      });
      setActiveQuiz(null);
    } else {
      alert(`You got ${correct}/${activeQuiz.questions.length} correct. Try again to earn the certificate!`);
      setActiveQuiz(null);
    }
  };

  // Determine if a resource is locked for the current user
  const getUnlockInfo = (r: Resource) => {
    if (user.role === UserRole.OWNER) return { locked: false, unlockedBy: 'Owner Access' };

    // Get all completed swaps where the user is involved
    const acceptedSwaps = mySwaps.filter(s => 
        (s.requesterId === user.id || s.targetUserId === user.id) && 
        s.status === 'ACCEPTED'
    );
    
    // Find a swap where I requested this skill (meaning I am the learner)
    const unlockingSwap = acceptedSwaps.find(s => s.requesterId === user.id && s.skillId === r.skillId);

    if (unlockingSwap) {
        const teacher = users.find(u => u.id === unlockingSwap.targetUserId);
        return { locked: false, unlockedBy: teacher ? `Swapped with ${teacher.name}` : 'Unlocked via Swap' };
    }
        
    return { locked: true, unlockedBy: null };
  };

  if (certificateData) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 p-10 border-8 border-double border-indigo-200 dark:border-indigo-900 shadow-2xl text-center max-w-2xl w-full">
            <h1 className="text-4xl font-serif text-indigo-900 dark:text-indigo-300 mb-4">Certificate of Completion</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">This certifies that</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white border-b-2 border-slate-300 dark:border-slate-600 inline-block px-8 pb-2 mb-8">{user.name}</p>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-2">Has successfully demonstrated competency in</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-8">{certificateData.skill}</p>
            <p className="text-sm text-slate-400">Date Issued: {certificateData.date}</p>
            <button onClick={() => setCertificateData(null)} className="mt-8 text-indigo-600 dark:text-indigo-400 hover:underline">Close</button>
        </div>
      </div>
    )
  }

  if (activeQuiz) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
         <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Certification Quiz: {activeQuiz.skillName}</h2>
         {activeQuiz.questions.map((q: any, idx: number) => (
           <div key={idx} className="mb-6 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
             <p className="font-medium text-lg mb-4 text-slate-800 dark:text-slate-200">{idx + 1}. {q.question}</p>
             <div className="space-y-2">
               {q.options.map((opt: string, optIdx: number) => (
                 <label key={optIdx} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                   <input 
                    type="radio" 
                    name={`q-${idx}`} 
                    checked={quizAnswers[idx] === optIdx} 
                    onChange={() => {
                      const newAns = [...quizAnswers];
                      newAns[idx] = optIdx;
                      setQuizAnswers(newAns);
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                   />
                   <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                 </label>
               ))}
             </div>
           </div>
         ))}
         <button onClick={submitQuiz} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-md">Submit Quiz</button>
      </div>
    );
  }

  if (quizLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        <span className="ml-4 text-slate-600 dark:text-slate-400">Generating Quiz with Gemini...</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        <span className="ml-4 text-slate-600 dark:text-slate-400">Loading resources...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Owner Upload Section */}
      {user.role === UserRole.OWNER && (
        <div className="mb-12 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md border-l-4 border-indigo-500 border-t border-r border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Owner Dashboard: Upload Learning Materials</h2>
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Skill Category</label>
              <select 
                value={newRes.skillId}
                onChange={e => setNewRes({...newRes, skillId: e.target.value})}
                className="w-full border border-slate-300 dark:border-slate-700 rounded p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SKILLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Type</label>
               <select 
                value={newRes.type}
                onChange={e => setNewRes({...newRes, type: e.target.value as any})}
                className="w-full border border-slate-300 dark:border-slate-700 rounded p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PDF">PDF Document</option>
                <option value="LINK">Web Link</option>
                <option value="VIDEO">Video URL</option>
              </select>
            </div>
             <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Title</label>
              <input 
                type="text" 
                value={newRes.title}
                onChange={e => setNewRes({...newRes, title: e.target.value})}
                placeholder="Ex: Advanced React"
                className="w-full border border-slate-300 dark:border-slate-700 rounded p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
             <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">URL</label>
              <input 
                type="text" 
                value={newRes.url}
                onChange={e => setNewRes({...newRes, url: e.target.value})}
                placeholder="https://..."
                className="w-full border border-slate-300 dark:border-slate-700 rounded p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <button type="submit" className="w-full bg-slate-900 dark:bg-indigo-600 text-white p-2 rounded text-sm hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors">Upload</button>
            </div>
          </form>
        </div>
      )}

      {/* Resources List */}
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Learning Materials</h1>
      
      {resources.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
           <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No resources available yet.</p>
           <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Resources will appear after you accept a skill swap request.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(res => {
              const { locked, unlockedBy } = getUnlockInfo(res);
              const isCompleted = user.completedCourses.includes(res.skillId);
              const skillName = SKILLS.find(s => s.id === res.skillId)?.name;

              return (
                <div key={res.id} className={`relative bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between h-full transition-opacity ${locked ? 'opacity-75' : 'opacity-100'}`}>
                
                {/* Locked Overlay */}
                {locked && (
                    <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/60 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center p-6 text-center z-10">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg mb-3">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Content Locked</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Swap <span className="font-semibold text-indigo-600 dark:text-indigo-400">{skillName}</span> to unlock.</p>
                    </div>
                )}

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2">
                             <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded uppercase">{res.type}</span>
                             {!locked && unlockedBy && user.role !== UserRole.OWNER && (
                                 <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-800">{unlockedBy}</span>
                             )}
                        </div>
                        {user.role === UserRole.OWNER && (
                          <button
                            onClick={() => handleDeleteResource(res.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold text-sm transition-colors"
                            title="Delete resource"
                          >
                            ✕
                          </button>
                        )}
                    </div>
                    <div className="mb-2">
                        <span className="text-xs text-slate-400 block mb-1">{skillName}</span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{res.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 truncate">{res.url}</p>
                </div>
                
                <div className="space-y-3">
                    <a 
                        href={locked ? '#' : res.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`block w-full text-center border font-medium py-2 rounded transition-colors ${locked ? 'border-slate-300 text-slate-300 cursor-not-allowed' : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                        onClick={(e) => locked && e.preventDefault()}
                    >
                        Access Material
                    </a>
                    
                    {isCompleted ? (
                         <div className="flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/20 py-2 rounded">
                            ✓ Certified
                         </div>
                    ) : (
                         <button 
                            onClick={() => startCertification(res.skillId)}
                            disabled={locked}
                            className={`block w-full font-medium py-2 rounded transition-colors ${locked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-700'}`}
                        >
                            Get Certified
                        </button>
                    )}
                </div>
                </div>
            )
          })}
        </div>
      )}
    </div>
  );
};