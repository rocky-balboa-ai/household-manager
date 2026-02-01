'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/navigation/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

export default function NewTaskPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('cleaning');
  const [dueDate, setDueDate] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      <Header title="New Task" />

      <div className="space-y-6 pt-2">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="cleaning">Cleaning</option>
              <option value="cooking">Cooking</option>
              <option value="laundry">Laundry</option>
              <option value="kids">Kids</option>
              <option value="shopping">Shopping</option>
              <option value="other">Other</option>
            </select>
          </div>

          <Input
            label="Due Date"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
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
            Create Task
          </Button>
        </form>
      </div>
    </>
  );
}
