'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/navigation/header';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { User, Calendar, Check, X, Clock } from 'lucide-react';

export default function StaffPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [dayOffs, setDayOffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((s) => s.user);
  const isManager = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, dayOffsData] = await Promise.all([
        api.getUsers(),
        api.getDayOffs(),
      ]);
      setUsers(usersData.filter((u: any) => ['DRIVER', 'NANNY', 'MAID'].includes(u.role)));
      setDayOffs(dayOffsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDayOffAction = async (id: string, status: string) => {
    try {
      await api.updateDayOff(id, status);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const roleColors: Record<string, string> = {
    DRIVER: 'bg-blue-100 text-blue-700',
    NANNY: 'bg-pink-100 text-pink-700',
    MAID: 'bg-purple-100 text-purple-700',
  };

  const pendingRequests = dayOffs.filter((d) => d.status === 'pending');

  if (loading) {
    return <div className="pt-20 text-center text-gray-500">Loading...</div>;
  }

  return (
    <>
      <Header title="Staff" />

      <div className="space-y-6 pt-2">
        {isManager && pendingRequests.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900">Pending Day Off Requests</h2>
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{req.user?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(req.date).toLocaleDateString()} • {req.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDayOffAction(req.id, 'approved')}
                    className="flex-1 py-2 rounded-lg bg-green-100 text-green-700 font-medium flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleDayOffAction(req.id, 'denied')}
                    className="flex-1 py-2 rounded-lg bg-red-100 text-red-700 font-medium flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">Staff Members</h2>
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-lg font-bold">
                {user.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user.name}</p>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${roleColors[user.role]}`}>
                  {user.role}
                </span>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>{user.language.toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
