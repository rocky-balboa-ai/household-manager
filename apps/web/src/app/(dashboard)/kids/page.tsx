'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/navigation/header';
import { api } from '@/lib/api';
import { Baby, Heart, Utensils, Activity, Calendar, MapPin, Clock } from 'lucide-react';

type FilterType = 'today' | 'week' | 'all';

export default function KidsPage() {
  const [kids, setKids] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('week');

  useEffect(() => {
    Promise.all([api.getKids(), api.getAllKidSchedules()])
      .then(([kidsData, schedulesData]) => {
        setKids(kidsData);
        setSchedules(schedulesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getKidColor = (kidName: string) => {
    const colors: Record<string, string> = {
      default: 'bg-purple-100 text-purple-700',
    };
    // Generate consistent color based on name
    const colorOptions = [
      'bg-pink-100 text-pink-700',
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-yellow-100 text-yellow-700',
      'bg-indigo-100 text-indigo-700',
      'bg-orange-100 text-orange-700',
    ];
    const index = kidName.charCodeAt(0) % colorOptions.length;
    return colorOptions[index];
  };

  const today = new Date().getDay();

  const filteredSchedules = schedules.filter((schedule) => {
    if (filter === 'today') {
      return schedule.dayOfWeek === today;
    }
    if (filter === 'week') {
      return true; // Show all for the week
    }
    return true; // 'all'
  });

  // Sort schedules: today first, then by day of week, then by time
  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    // Calculate "days from today" for sorting (today = 0, tomorrow = 1, etc.)
    const daysFromTodayA = (a.dayOfWeek - today + 7) % 7;
    const daysFromTodayB = (b.dayOfWeek - today + 7) % 7;
    
    if (daysFromTodayA !== daysFromTodayB) {
      return daysFromTodayA - daysFromTodayB;
    }
    // Same day, sort by time
    return a.time.localeCompare(b.time);
  });

  // Group schedules by day
  const schedulesByDay: Record<string, any[]> = sortedSchedules.reduce((acc: Record<string, any[]>, schedule) => {
    const day = String(schedule.dayOfWeek);
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {});

  if (loading) {
    return <div className="pt-20 text-center text-gray-500">Loading...</div>;
  }

  return (
    <>
      <Header title="Kids Hub" />

      <div className="space-y-6 pt-2">
        {/* Filter Buttons */}
        <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-sm">
          {[
            { id: 'today' as FilterType, label: 'Today' },
            { id: 'week' as FilterType, label: 'This Week' },
            { id: 'all' as FilterType, label: 'All' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Aggregated Schedule View */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            {filter === 'today' ? "Today's Activities" : filter === 'week' ? "This Week's Activities" : 'All Activities'}
          </h2>

          {sortedSchedules.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No scheduled activities {filter === 'today' ? 'today' : ''}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(schedulesByDay).map(([dayNum, daySchedules]: [string, any[]]) => {
                const dayOfWeek = parseInt(dayNum);
                const isToday = dayOfWeek === today;
                
                return (
                  <div key={dayNum}>
                    {/* Day Header */}
                    <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-primary-600' : 'text-gray-500'}`}>
                      {isToday ? '📅 Today' : getDayName(dayOfWeek)}
                    </div>
                    
                    {/* Events for this day */}
                    <div className="space-y-2">
                      {daySchedules.map((schedule: any) => (
                        <Link
                          key={schedule.id}
                          href={`/kids/${schedule.kid.id}`}
                          className={`block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${
                            isToday ? 'border-l-4 border-primary-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getKidColor(schedule.kid.name)}`}>
                                  {schedule.kid.name}
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-900 truncate">{schedule.activity}</h3>
                              {schedule.location && (
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {schedule.location}
                                </p>
                              )}
                              {schedule.notes && (
                                <p className="text-sm text-gray-400 mt-1 truncate">{schedule.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(schedule.time)}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kid Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Baby className="w-5 h-5 text-primary-600" />
            Kids Profiles
          </h2>
          
          {kids.map((kid) => (
            <Link
              key={kid.id}
              href={`/kids/${kid.id}`}
              className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                  {kid.name[0]}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{kid.name}</h2>
                  <p className="text-gray-500 text-sm">{getAge(kid.birthDate)} old</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-red-50 rounded-lg p-2.5 text-center">
                  <Heart className="w-4 h-4 text-red-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Health</p>
                  <p className="text-sm font-medium">{kid.healthLogs?.length || 0}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-2.5 text-center">
                  <Utensils className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Meals</p>
                  <p className="text-sm font-medium">{kid.mealLogs?.length || 0}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                  <Activity className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Activities</p>
                  <p className="text-sm font-medium">{kid.schedules?.length || 0}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
