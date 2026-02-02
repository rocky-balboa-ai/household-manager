import { useCallback } from 'react';
import { useAuthStore } from '@/stores/auth';
import { t as translate, Language } from '@/lib/translations';

export function useTranslation() {
  const user = useAuthStore((s) => s.user);
  const lang = (user?.language || 'en') as Language;

  const t = useCallback(
    (key: string) => translate(key, lang),
    [lang]
  );

  return { t, lang };
}
