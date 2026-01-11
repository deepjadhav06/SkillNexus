import React from 'react';

interface AboutProps {
  onNavigate?: (page: string) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  const features = [
    {
      title: 'Peer-to-Peer Skill Exchange',
      desc: 'Connect with peers to teach and learn in a trusted swap environment — no money, just knowledge.'
    },
    {
      title: 'Curated Learning Library',
      desc: 'Owner-curated materials and resources that unlock as you complete swaps and certifications.'
    },
    {
      title: 'Verified Certifications',
      desc: 'Take short skill quizzes to earn certificates that demonstrate your competence.'
    },
    {
      title: 'Smart Matching & Requests',
      desc: 'Find complementary learners and teachers quickly using skill-based matching and swap requests.'
    },
    {
      title: 'Secure Messaging & Progress Tracking',
      desc: 'Chat with swap partners, track completed swaps, and build your learning history.'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">About SkillNexus</h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">A community-first platform for exchanging practical skills and building verified learning paths.</p>
        </div>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 items-start">
          <div>
            <div className="space-y-6">
              {features.map((f, idx) => (
                <div key={idx} className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Contact & Support</h3>
            <p className="text-sm opacity-90 mb-4">Reach out to our team for help, partnerships, or feedback.</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3">
                <span className="font-mono bg-white/10 px-2 py-1 rounded">📞</span>
                <span className="font-semibold">8080837516</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="font-mono bg-white/10 px-2 py-1 rounded">📞</span>
                <span className="font-semibold">8483892631</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="font-mono bg-white/10 px-2 py-1 rounded">📞</span>
                <span className="font-semibold">9373212503</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-white/20">
              <button
                onClick={() => onNavigate && onNavigate('home')}
                className="mt-4 inline-block bg-white text-indigo-600 font-bold px-4 py-2 rounded-lg hover:opacity-95"
              >
                Back to Home
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default About;
