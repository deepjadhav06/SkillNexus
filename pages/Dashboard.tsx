import React, { useState, useEffect } from 'react';
import { User, UserRole, SwapRequest } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mockService } from '../services/mockService';
import { SKILLS } from '../constants';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [allRequests, setAllRequests] = useState<SwapRequest[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const requests = await mockService.getSwapRequests();
        const users = await mockService.getUsers();
        if (!mounted) return;
        setAllRequests(Array.isArray(requests) ? requests : []);
        setAllUsers(Array.isArray(users) ? users : []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        if (!mounted) return;
        setAllRequests([]);
        setAllUsers([]);
      }
    };

    // Initial load
    loadData();

    // Refresh swap requests regularly to keep KPIs up-to-date
    const interval = setInterval(async () => {
      try {
        const requests = await mockService.getSwapRequests();
        if (mounted) setAllRequests(Array.isArray(requests) ? requests : []);
      } catch (e) {
        console.warn('Failed to refresh swap requests:', e);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user]);

  // Stats Logic
  const totalSwaps = allRequests.length;
  const mySwaps = allRequests.filter(r => r.requesterId === user.id || r.targetUserId === user.id);
  const pendingRequests = mySwaps.filter(r => r.status === 'PENDING' && r.targetUserId === user.id);

  // Chart Data Preparation
  const skillPopularity = SKILLS.map(skill => {
    const count = allUsers.filter(u => u.skillsWanted.includes(skill.id)).length;
    return { name: skill.name, count };
  });

  const swapStatusData = [
    { name: 'Accepted', value: allRequests.filter(r => r.status === 'ACCEPTED').length },
    { name: 'Pending', value: allRequests.filter(r => r.status === 'PENDING').length },
    { name: 'Rejected', value: allRequests.filter(r => r.status === 'REJECTED').length },
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Welcome back, {user.name}. Here's what's happening.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Active Swaps</div>
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{mySwaps.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending Requests</div>
          <div className="text-3xl font-bold text-amber-500 mt-2">{pendingRequests.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Skills Learned</div>
          <div className="text-3xl font-bold text-emerald-500 mt-2">{user.completedCourses.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Community Members</div>
          <div className="text-3xl font-bold text-slate-700 dark:text-slate-200 mt-2">{allUsers.length}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-semibold mb-6 text-slate-800 dark:text-white">Most Wanted Skills</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillPopularity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                  itemStyle={{ color: '#818cf8' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-semibold mb-6 text-slate-800 dark:text-white">Platform Swap Status</h3>
          <div className="h-64 flex justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={swapStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {swapStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div> Accepted</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div> Pending</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> Rejected</div>
          </div>
        </div>
      </div>
    </div>
  );
};