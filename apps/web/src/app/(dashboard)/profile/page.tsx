'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/navigation/header';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import { User, Globe, LogOut, Calendar, Moon, Sun } from 'lucide-react';

const languages: Record<string, string> = {
  en: 'English',
  ur: 'اردو (Urdu)',
  tl: 'Tagalog',
  sw: 'Kiswahili',
  am: 'አማርኛ (Amharic)',
};

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setLanguage = useAuthStore((s) => s.setLanguage);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleLanguageChange = async (language: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await api.updateLanguage(user.id, language);
      setLanguage(language);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const availableLanguages = user?.altLanguage
    ? ['en', user.altLanguage]
    : Object.keys(languages);

  return (
    <>
      <Header title={t('profile.title')} />

      <div className="space-y-6 pt-2">
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            {user?.name[0]}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500">{user?.role}</p>
          {user?.email && (
            <p className="text-sm text-gray-400 mt-1">{user.email}</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold">{t('profile.language')}</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                disabled={loading}
                className={`p-3 rounded-lg text-center transition-colors ${
                  user?.language === lang
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {languages[lang] || lang}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
          <button
            onClick={() => router.push('/day-off')}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
          >
            <Calendar className="w-5 h-5 text-gray-400" />
            <span>{t('dayOff.request')}</span>
          </button>
        </div>

        <Button variant="danger" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          {t('profile.logout')}
        </Button>
      </div>
    </>
  );
}
