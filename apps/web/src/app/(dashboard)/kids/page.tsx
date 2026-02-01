'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/navigation/header';
import { api } from '@/lib/api';
import { Baby, Heart, Utensils, Activity } from 'lucide-react';

export default function KidsPage() {
  const [kids, setKids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getKids().then(setKids).catch(console.error).finally(() => setLoading(false));
  }, []);

  const getAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    if (years === 0) return `${months}mo`;
    if (months < 0) return `${years - 1}y`;
    return `${years}y`;
  };

  if (loading) {
    return <div className="pt-20 text-center text-gray-500">Loading...</div>;
  }

  return (
    <>
      <Header title="Kids Hub" />

      <div className="space-y-4 pt-2">
        {kids.map((kid) => (
          <Link
            key={kid.id}
            href={`/kids/${kid.id}`}
            className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {kid.name[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{kid.name}</h2>
                <p className="text-gray-500">{getAge(kid.birthDate)} old</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Health</p>
                <p className="text-sm font-medium">{kid.healthLogs?.length || 0} logs</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <Utensils className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Meals</p>
                <p className="text-sm font-medium">{kid.mealLogs?.length || 0} logs</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <Activity className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Activities</p>
                <p className="text-sm font-medium">{kid.schedules?.length || 0} scheduled</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
