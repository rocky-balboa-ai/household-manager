'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/navigation/header';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { ChevronLeft, ChevronRight, Plus, X, Home } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, startOfDay } from 'date-fns';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const MEAL_COLORS: Record<string, string> = {
  breakfast: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  lunch: 'bg-blue-100 text-blue-800 border-blue-200',
  dinner: 'bg-purple-100 text-purple-800 border-purple-200',
  snack: 'bg-green-100 text-green-800 border-green-200',
};

interface MealPlan {
  id: string;
  date: string;
  mealType: string;
  description?: string;
  recipe?: string;
  notes?: string;
}

export default function MealPlansPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  // Default to today's date when page loads
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => startOfDay(new Date()));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ mealType: string; description: string } | null>(null);
  const user = useAuthStore((s) => s.user);
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    loadMealPlans();
  }, [currentMonth]);

  const loadMealPlans = async () => {
    setLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const data = await api.getMealPlans(start, end);
      setMealPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!selectedDate || !editing) return;
    setError(null);
    setSaving(true);
    try {
      await api.saveMealPlan({
        date: format(selectedDate, 'yyyy-MM-dd'),
        mealType: editing.mealType,
        description: editing.description,
      });
      setEditing(null);
      await loadMealPlans();
    } catch (err: any) {
      console.error('Failed to save meal plan:', err);
      setError(err.message || 'Failed to save meal plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      await api.deleteMealPlan(id);
      loadMealPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getMealsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return mealPlans.filter((p) => p.date.startsWith(dateStr));
  };

  const dayMeals = selectedDate ? getMealsForDate(selectedDate) : [];

  return (
    <>
      <Header title="Household Meal Plans" />

      <div className="space-y-4 pt-2">
        {/* Household-level notice */}
        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-sm">
          <Home className="w-4 h-4 flex-shrink-0" />
          <span>Meal plans are for the entire household — all family members share the same meals.</span>
        </div>

        {/* Error display */}
        {error && (
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before start of month */}
            {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 md:h-24" />
            ))}

            {days.map((day) => {
              const dayPlans = getMealsForDate(day);
              const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`h-20 md:h-24 p-1 rounded-lg border text-left transition-colors ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : isToday(day)
                      ? 'border-primary-200 bg-primary-50/50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-primary-600' : 'text-gray-900'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayPlans.slice(0, 3).map((plan) => (
                      <div
                        key={plan.id}
                        className={`text-xs px-1 py-0.5 rounded truncate border ${MEAL_COLORS[plan.mealType] || 'bg-gray-100'}`}
                      >
                        {plan.description || plan.mealType}
                      </div>
                    ))}
                    {dayPlans.length > 3 && (
                      <div className="text-xs text-gray-500 px-1">+{dayPlans.length - 3} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDate && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{format(selectedDate, 'EEEE, MMMM d')}</h3>
              <button onClick={() => setSelectedDate(null)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              {MEAL_TYPES.map((mealType) => {
                const meal = dayMeals.find((m) => m.mealType === mealType);
                const isEditing = editing?.mealType === mealType;

                return (
                  <div key={mealType} className={`p-3 rounded-lg border ${MEAL_COLORS[mealType]}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium capitalize">{mealType}</span>
                      {canEdit && meal && !isEditing && (
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editing.description}
                          onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveMeal();
                            }
                          }}
                          placeholder="What's for this meal?"
                          className="flex-1 px-2 py-1 rounded border text-sm bg-white"
                          autoFocus
                        />
                        <Button size="sm" onClick={handleSaveMeal} disabled={saving}>
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                      </div>
                    ) : meal ? (
                      <p className="text-sm">{meal.description}</p>
                    ) : canEdit ? (
                      <button
                        onClick={() => setEditing({ mealType, description: '' })}
                        className="flex items-center gap-1 text-sm opacity-70 hover:opacity-100"
                      >
                        <Plus className="w-4 h-4" />
                        Add meal
                      </button>
                    ) : (
                      <p className="text-sm opacity-70">No meal planned</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
