import React from 'react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-white via-indigo-50 to-white dark:from-slate-900 dark:via-indigo-900/30 dark:to-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
        {/* Background Gradient Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-400/20 to-transparent rounded-full blur-3xl -mr-24 -mt-24 dark:from-indigo-500/10"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-400/15 to-transparent rounded-full blur-3xl -ml-20 -mb-20 dark:from-indigo-500/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="animate-slideInDown">
            <h1 className="text-5xl tracking-tight font-extrabold text-slate-900 dark:text-white sm:text-6xl md:text-7xl">
              <span className="block">Learn by Sharing.</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-400 dark:via-indigo-300 dark:to-purple-400">Grow Together.</span>
            </h1>
          </div>
          <p className="mt-6 max-w-md mx-auto text-lg text-slate-600 dark:text-slate-300 sm:text-xl md:mt-8 md:text-2xl md:max-w-3xl font-light leading-relaxed">
            SkillNexus is the premier platform where knowledge meets opportunity. 
            Offer your skills, match with peers, and unlock exclusive learning resources curated by experts.
          </p>
          
          <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-10 gap-4">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
              <button
                onClick={() => onNavigate('swap')}
                className="relative w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl"
              >
                Find a Swap
              </button>
            </div>
            
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600 rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-500"></div>
              <button
                onClick={() => onNavigate('login')}
                className="relative w-full flex items-center justify-center px-8 py-3 border-2 border-indigo-600 dark:border-indigo-400 text-base font-bold rounded-lg text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Steps */}
      <div className="py-20 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.04]" style={{backgroundImage: 'linear-gradient(to bottom, transparent 0%, transparent calc(100% - 1px), rgba(0,0,0,0.1) calc(100% - 1px), rgba(0,0,0,0.1) 100%)'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                num: '1',
                title: 'Create Profile',
                desc: 'List skills you can teach and skills you want to learn.'
              },
              {
                num: '2',
                title: 'Match & Accept',
                desc: 'Find users with complementary skills and accept swap requests.'
              },
              {
                num: '3',
                title: 'Unlock & Certify',
                desc: 'Access exclusive materials provided by the platform owner and earn certificates.'
              }
            ].map((step, idx) => (
              <div 
                key={idx}
                className="group relative animate-slideInUp"
                style={{animationDelay: `${idx * 0.1}s`}}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-white dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-indigo-300/50 dark:group-hover:border-indigo-700/50">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white mx-auto mb-6 shadow-lg shadow-indigo-500/50 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold">{step.num}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-3">{step.title}</h3>
                  <p className="text-center text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        {/* Creators Credit */}
        <div className="py-8 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Created by</div>
              <div className="flex items-center justify-center gap-3">
                <span className="creator-item text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Deep</span>
                <span className="text-slate-300">•</span>
                <span className="creator-item text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Tejas</span>
                <span className="text-slate-300">•</span>
                <span className="creator-item text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Gaurav</span>
              </div>
            </div>
          </div>
        </div>
        <style>{`\n        @keyframes sn_fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }\n        .creator-item { opacity: 0; display: inline-block; animation: sn_fadeUp 600ms ease forwards; }\n        .creator-item:nth-child(1) { animation-delay: 120ms; }\n        .creator-item:nth-child(3) { animation-delay: 320ms; }\n        .creator-item:nth-child(5) { animation-delay: 520ms; }\n        .creator-item:hover { transform: translateY(-3px); transition: transform 180ms ease; }\n      `}</style>
    </div>
  );
};