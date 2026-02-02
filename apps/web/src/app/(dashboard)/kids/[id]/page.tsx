'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/navigation/header';
import { Button } from '@/components/ui/button';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { api } from '@/lib/api';
import { ArrowLeft, Heart, Utensils, Activity, Plus } from 'lucide-react';
import { format } from 'date-fns';

type Tab = 'health' | 'meals' | 'activities';

export default function KidDetailPage() {
  const [kid, setKid] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('health');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    loadKid();
  }, [params.id]);

  const loadKid = async () => {
    try {
      const data = await api.getKid(params.id as string);
      setKid(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHealthLog = async (type: string, notes: string) => {
    try {
      await api.addHealthLog(params.id as string, { type, notes: notes || undefined });
      loadKid();
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivityLog = async (activity: string, category: string, notes: string) => {
    try {
      await api.addActivityLog(params.id as string, { activity, category, notes: notes || undefined });
      loadKid();
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMealLog = async (data: any) => {
    try {
      await api.addMealLog(params.id as string, data);
      loadKid();
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !kid) {
    return <div className="pt-20 text-center text-gray-500">Loading...</div>;
  }

  const tabs = [
    { id: 'health' as Tab, label: 'Health', icon: Heart, color: 'text-red-500' },
    { id: 'meals' as Tab, label: 'Meals', icon: Utensils, color: 'text-orange-500' },
    { id: 'activities' as Tab, label: 'Activities', icon: Activity, color: 'text-blue-500' },
  ];

  const ratingEmojis = ['😫', '😕', '😐', '🙂', '😋'];

  return (
    <>
      <Header title={kid.name} />

      <div className="space-y-4 pt-2">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex gap-2 bg-white rounded-xl p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setShowForm(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                tab === t.id ? 'bg-primary-100 text-primary-700' : 'text-gray-500'
              }`}
            >
              <t.icon className={`w-4 h-4 ${tab === t.id ? t.color : ''}`} />
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>

        <Button onClick={() => setShowForm(!showForm)} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add {tab === 'health' ? 'Health Log' : tab === 'meals' ? 'Meal Log' : 'Activity'}
        </Button>

        {showForm && tab === 'health' && (
          <HealthLogForm onSubmit={handleHealthLog} onCancel={() => setShowForm(false)} />
        )}

        {showForm && tab === 'meals' && (
          <MealLogForm onSubmit={handleMealLog} onCancel={() => setShowForm(false)} />
        )}

        {showForm && tab === 'activities' && (
          <ActivityLogForm onSubmit={handleActivityLog} onCancel={() => setShowForm(false)} />
        )}

        <div className="space-y-3">
          {tab === 'health' && kid.healthLogs?.map((log: any) => (
            <div key={log.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  log.type === 'poop' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {log.type === 'poop' ? '💩 Poop' : '💧 Pee'}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                </span>
              </div>
              {log.notes && <p className="text-sm text-gray-600">{log.notes}</p>}
            </div>
          ))}

          {tab === 'meals' && kid.mealLogs?.map((log: any) => (
            <div key={log.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                  {log.mealType}
                </span>
                <span className="text-2xl">{ratingEmojis[log.rating - 1]}</span>
              </div>
              <p className="font-medium text-gray-900">{log.foodName}</p>
              <p className="text-sm text-gray-500">
                {log.foodSource === 'frozen' ? 'Frozen meal' : 'Fresh'} • {log.portions || 'Unknown'} eaten
              </p>
              {log.photo && !log.photo.includes('placeholder') && (
                <img src={log.photo} alt="Meal" className="mt-3 rounded-lg max-h-32 object-cover" />
              )}
              <p className="text-xs text-gray-400 mt-2">
                {format(new Date(log.createdAt), 'MMM d, h:mm a')}
              </p>
            </div>
          ))}

          {tab === 'activities' && kid.activityLogs?.map((log: any) => (
            <div key={log.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  {log.category}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                </span>
              </div>
              <p className="font-medium text-gray-900">{log.activity}</p>
              {log.notes && <p className="text-sm text-gray-600">{log.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function HealthLogForm({ onSubmit, onCancel }: { onSubmit: (type: string, notes: string) => void; onCancel: () => void }) {
  const [type, setType] = useState('poop');
  const [notes, setNotes] = useState('');

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex gap-2">
        {['poop', 'pee'].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 py-3 rounded-lg font-medium ${
              type === t ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t === 'poop' ? '💩 Poop' : '💧 Pee'}
          </button>
        ))}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="w-full px-4 py-3 rounded-lg border border-gray-300"
        rows={2}
      />
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={() => onSubmit(type, notes)} className="flex-1">Save</Button>
      </div>
    </div>
  );
}

function ActivityLogForm({ onSubmit, onCancel }: { onSubmit: (activity: string, category: string, notes: string) => void; onCancel: () => void }) {
  const [activity, setActivity] = useState('');
  const [category, setCategory] = useState('play');
  const [notes, setNotes] = useState('');

  const categories = ['play', 'learning', 'outdoor', 'screen', 'nap', 'other'];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <input
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
        placeholder="Activity name"
        className="w-full px-4 py-3 rounded-lg border border-gray-300"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-gray-300"
      >
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="w-full px-4 py-3 rounded-lg border border-gray-300"
        rows={2}
      />
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={() => onSubmit(activity, category, notes)} className="flex-1" disabled={!activity}>Save</Button>
      </div>
    </div>
  );
}

function MealLogForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [mealType, setMealType] = useState('breakfast');
  const [foodSource, setFoodSource] = useState('fresh');
  const [foodName, setFoodName] = useState('');
  const [rating, setRating] = useState(3);
  const [portions, setPortions] = useState('all');
  const [photo, setPhoto] = useState<string | null>(null);

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const portionOptions = ['all', 'most', 'half', 'little', 'none'];
  const ratingEmojis = ['😫', '😕', '😐', '🙂', '😋'];

  const handleSubmit = () => {
    onSubmit({
      mealType,
      foodSource,
      foodName,
      rating,
      portions,
      photo: photo || 'data:image/png;base64,placeholder',
    });
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
        <div className="flex gap-2 flex-wrap">
          {mealTypes.map((t) => (
            <button
              key={t}
              onClick={() => setMealType(t)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                mealType === t ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Food Source</label>
        <div className="flex gap-2">
          {['fresh', 'frozen'].map((s) => (
            <button
              key={s}
              onClick={() => setFoodSource(s)}
              className={`flex-1 py-2 rounded-lg font-medium capitalize ${
                foodSource === s ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <input
        value={foodName}
        onChange={(e) => setFoodName(e.target.value)}
        placeholder="What did they eat?"
        className="w-full px-4 py-3 rounded-lg border border-gray-300"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">How well did they eat?</label>
        <div className="flex justify-between">
          {ratingEmojis.map((emoji, i) => (
            <button
              key={i}
              onClick={() => setRating(i + 1)}
              className={`text-3xl p-2 rounded-lg ${
                rating === i + 1 ? 'bg-primary-100 scale-110' : 'opacity-50'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Portions eaten</label>
        <div className="flex gap-2 flex-wrap">
          {portionOptions.map((p) => (
            <button
              key={p}
              onClick={() => setPortions(p)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                portions === p ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <PhotoUpload
        value={photo || undefined}
        onChange={(value) => setPhoto(value)}
        label="Photo of plate"
        required
      />

      <div className="flex gap-2">
        <Button variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} className="flex-1" disabled={!foodName}>Save</Button>
      </div>
    </div>
  );
}
