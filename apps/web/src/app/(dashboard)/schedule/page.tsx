'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/navigation/header';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Home, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadSchedule();
  }, [weekStart]);

  const loadSchedule = async () => {
    try {
      const data = await api.getFredSchedule();
      setSchedule(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (date: Date) => {
    if (!isAdmin) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = schedule.find((s) => format(new Date(s.date), 'yyyy-MM-dd') === dateStr);
    const newLocation = existing?.location === 'office' ? 'wfh' : 'office';

    try {
      await api.setFredSchedule(dateStr, newLocation);
      loadSchedule();
    } catch (err) {
      console.error(err);
    }
  };

  const getLocationForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = schedule.find((s) => format(new Date(s.date), 'yyyy-MM-dd') === dateStr);
    return entry?.location;
  };

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <>
      <Header title="Fred's Schedule" />

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekStart(subWeeks(weekStart, 1))}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-semibold">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </h2>
          <button
            onClick={() => setWeekStart(addWeeks(weekStart, 1))}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const location = getLocationForDate(day);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleToggle(day)}
                disabled={!isAdmin}
                className={`p-3 rounded-xl text-center transition-colors ${
                  isToday ? 'ring-2 ring-primary-500' : ''
                } ${
                  location === 'office'
                    ? 'bg-blue-100'
                    : location === 'wfh'
                    ? 'bg-green-100'
                    : 'bg-gray-50'
                } ${isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`}
              >
                <p className="text-xs text-gray-500">{format(day, 'EEE')}</p>
                <p className={`text-lg font-bold ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </p>
                {location && (
                  <div className="mt-1">
                    {location === 'office' ? (
                      <Building2 className="w-4 h-4 mx-auto text-blue-600" />
                    ) : (
                      <Home className="w-4 h-4 mx-auto text-green-600" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-medium mb-3">Legend</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100" />
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Office</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100" />
              <Home className="w-4 h-4 text-green-600" />
              <span className="text-sm">WFH</span>
            </div>
          </div>
          {isAdmin && (
            <p className="text-xs text-gray-500 mt-2">Tap a day to toggle location</p>
          )}
        </div>
      </div>
    </>
  );
}
