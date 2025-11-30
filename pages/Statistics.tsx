import React, { useState, useEffect, useMemo } from 'react';
import { mockService } from '../services/mockService';
import { User, SwapRequest } from '../types';

export const Statistics: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const loadedUsers = await mockService.getUsers();
      const loadedSwaps = await mockService.getSwapRequests();
      setUsers(loadedUsers);
      setSwaps(loadedSwaps);
    };
    loadData();
  }, []);

  const totals = useMemo(() => {
    const totalUsers = users.length;
    const totalSwaps = swaps.length;
    const accepted = swaps.filter(s => s.status === 'ACCEPTED').length;
    const pending = swaps.filter(s => s.status === 'PENDING').length;

    // top skills offered (simple count)
    const skillCounts: Record<string, number> = {};
    users.forEach(u => {
      (u.skillsOffered || []).forEach((sk: string) => { skillCounts[sk] = (skillCounts[sk] || 0) + 1; });
    });
    const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { totalUsers, totalSwaps, accepted, pending, topSkills };
  }, [users, swaps]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Platform Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 border rounded">
          <div className="text-sm text-slate-500">Total Users</div>
          <div className="text-2xl font-bold">{totals.totalUsers}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-slate-500">Total Swaps</div>
          <div className="text-2xl font-bold">{totals.totalSwaps}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-slate-500">Accepted</div>
          <div className="text-2xl font-bold text-emerald-600">{totals.accepted}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-slate-500">Pending</div>
          <div className="text-2xl font-bold text-amber-600">{totals.pending}</div>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Top Skills Offered</h2>
        <ul className="space-y-2">
          {totals.topSkills.length === 0 && <li className="text-sm text-slate-500">No data yet</li>}
          {totals.topSkills.map(([skill, count]) => (
            <li key={skill} className="flex items-center justify-between p-3 border rounded bg-white">
              <span className="font-medium">{skill}</span>
              <span className="text-sm text-slate-500">{count} users</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-slate-500">Data is live from localStorage (mock service).</p>
    </div>
  );
};

export default Statistics;
