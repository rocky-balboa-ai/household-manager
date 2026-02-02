'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, Package, Baby, User, Calendar, ShoppingCart, Settings, LogOut, UtensilsCrossed } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/hooks/useTranslation';

const navItems = [
  { href: '/', icon: Home, labelKey: 'nav.home' },
  { href: '/tasks', icon: CheckSquare, labelKey: 'nav.tasks' },
  { href: '/inventory', icon: Package, labelKey: 'nav.inventory' },
  { href: '/shopping', icon: ShoppingCart, labelKey: 'nav.shopping' },
  { href: '/kids', icon: Baby, labelKey: 'nav.kids', roles: ['ADMIN', 'MANAGER', 'NANNY'] },
  { href: '/meal-plans', icon: UtensilsCrossed, labelKey: 'nav.mealPlans' },
  { href: '/schedule', icon: Calendar, labelKey: 'nav.schedule' },
];

const bottomItems = [
  { href: '/profile', icon: User, labelKey: 'nav.profile' },
  { href: '/admin', icon: Settings, labelKey: 'nav.admin', roles: ['ADMIN'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { t } = useTranslation();

  const visibleItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const visibleBottomItems = bottomItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-white border-r border-gray-200">
      {/* Logo/Brand */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900">Household</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        {visibleBottomItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}

        {/* User Info & Logout */}
        {user && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">{user.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
