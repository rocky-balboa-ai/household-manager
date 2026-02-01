'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/navigation/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { ArrowLeft, Calendar, Check, X, Clock } from 'lucide-react';

export default function DayOffPage() {
  const [dayOffs, setDayOffs] = useState<any[]>([]);
  const [date, setDate] = useState('');
  const [type, setType] = useState('full');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getDayOffs();
      setDayOffs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.requestDayOff({ date, type });
      setDate('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    denied: 'bg-red-100 text-red-700',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-4 h-4" />,
    approved: <Check className="w-4 h-4" />,
    denied: <X className="w-4 h-4" />,
  };

  return (
    <>
      <Header title="Day Off" />

      <div className="space-y-6 pt-2">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Request Day Off</h2>

          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex gap-2">
              {[
                { id: 'full', label: 'Full Day' },
                { id: 'half_am', label: 'Half (AM)' },
                { id: 'half_pm', label: 'Half (PM)' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`flex-1 py-3 rounded-lg font-medium ${
                    type === t.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Submit Request
          </Button>
        </form>

        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">My Requests</h2>
          {dayOffs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No requests yet</p>
          ) : (
            dayOffs.map((req) => (
              <div key={req.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{new Date(req.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">{req.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusColors[req.status]}`}>
                  {statusIcons[req.status]}
                  {req.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
