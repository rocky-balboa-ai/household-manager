'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/navigation/header';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';
import { CheckSquare, Package, ShoppingCart, Baby, Calendar, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({ tasks: 0, lowStock: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [tasks, lowStock] = await Promise.all([
          api.getTasks(),
          api.getLowStock(),
        ]);
        setStats({
          tasks: tasks.filter((t: any) => t.status !== 'COMPLETED').length,
          lowStock: lowStock.length,
        });
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, []);

  const quickActions = [
    { href: '/tasks', icon: CheckSquare, label: 'Tasks', count: stats.tasks, color: 'bg-blue-100 text-blue-600' },
    { href: '/inventory', icon: Package, label: 'Inventory', count: stats.lowStock > 0 ? stats.lowStock : undefined, alert: stats.lowStock > 0, color: 'bg-green-100 text-green-600' },
    { href: '/shopping', icon: ShoppingCart, label: 'Shopping', color: 'bg-orange-100 text-orange-600', roles: ['ADMIN', 'MANAGER', 'DRIVER'] },
    { href: '/kids', icon: Baby, label: 'Kids', color: 'bg-pink-100 text-pink-600', roles: ['ADMIN', 'MANAGER', 'NANNY'] },
    { href: '/schedule', icon: Calendar, label: 'Schedule', color: 'bg-purple-100 text-purple-600' },
  ];

  const visibleActions = quickActions.filter(
    (action) => !action.roles || (user && action.roles.includes(user.role))
  );

  return (
    <>
      <Header title="Home" />
      <div className="space-y-6 pt-2">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold">Welcome, {user?.name}!</h2>
          <p className="text-primary-100 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {stats.lowStock > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-amber-800">{stats.lowStock} items are running low</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {visibleActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                <action.icon className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 md:text-lg">{action.label}</span>
                {action.count !== undefined && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${action.alert ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {action.count}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
