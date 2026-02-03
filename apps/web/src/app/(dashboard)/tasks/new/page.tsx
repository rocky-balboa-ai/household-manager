'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/navigation/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function NewTaskPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('cleaning');
  const [dueDate, setDueDate] = useState('');
  const [recurring, setRecurring] = useState('none');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    api.getUsers().then(setUsers).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createTask({
        title,
        description: description || undefined,
        category,
        dueDate: dueDate || undefined,
        recurring: recurring !== 'none' ? recurring : undefined,
        assigneeIds,
      });
      router.push('/tasks');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const staff = users.filter((u) => ['DRIVER', 'NANNY', 'MAID'].includes(u.role));

  return (
    <>
      <Header title={t('tasks.newTask')} />

      <div className="space-y-6 pt-2">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600">
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <Input
            label={t('tasks.titleLabel')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('tasks.titlePlaceholder')}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('tasks.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('tasks.descriptionPlaceholder')}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('tasks.category')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="cleaning">{t('tasks.categoryCleaning')}</option>
              <option value="cooking">{t('tasks.categoryCooking')}</option>
              <option value="laundry">{t('tasks.categoryLaundry')}</option>
              <option value="kids">{t('tasks.categoryKids')}</option>
              <option value="shopping">{t('tasks.categoryShopping')}</option>
              <option value="other">{t('tasks.categoryOther')}</option>
            </select>
          </div>

          <Input
            label={t('tasks.dueDate')}
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          {/* Recurring Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <RefreshCw className="w-4 h-4 inline mr-1" />
              {t('tasks.recurring')}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['none', 'daily', 'weekly', 'monthly'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setRecurring(opt)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    recurring === opt
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt === 'none' ? t('tasks.recurringNone') : 
                   opt === 'daily' ? t('tasks.recurringDaily') : 
                   opt === 'weekly' ? t('tasks.recurringWeekly') : 
                   t('tasks.recurringMonthly')}
                </button>
              ))}
            </div>
            {recurring !== 'none' && (
              <p className="mt-2 text-xs text-gray-500">
                {t('tasks.recurringHint')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('tasks.assignTo')}</label>
            <div className="space-y-2">
              {staff.map((s) => (
                <label key={s.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={assigneeIds.includes(s.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAssigneeIds([...assigneeIds, s.id]);
                      } else {
                        setAssigneeIds(assigneeIds.filter((id) => id !== s.id));
                      }
                    }}
                    className="w-5 h-5 rounded text-primary-600"
                  />
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-gray-500">{s.role}</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" loading={loading} disabled={!title || assigneeIds.length === 0}>
            {t('tasks.createTask')}
          </Button>
        </form>
      </div>
    </>
  );
}
