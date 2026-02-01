'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  pinSetAt: string | null;
}

export default function StaffLoginPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [pin, setPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const loginWithPin = useAuthStore((s) => s.loginWithPin);

  useEffect(() => {
    api.getStaffList().then(setStaff).catch(console.error);
  }, []);

  const needsNewPin = (staffMember: StaffMember) => {
    if (!staffMember.pinSetAt) return true;
    const pinDate = new Date(staffMember.pinSetAt);
    const today = new Date();
    return pinDate.toDateString() !== today.toDateString();
  };

  const handleSelectStaff = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setIsSettingPin(needsNewPin(staffMember));
    setPin('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    setError('');
    setLoading(true);

    try {
      if (isSettingPin) {
        await api.setPin(selectedStaff.id, pin);
        setIsSettingPin(false);
        setPin('');
      } else {
        await loginWithPin({ userId: selectedStaff.id, pin });
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const roleColors: Record<string, string> = {
    DRIVER: 'bg-blue-100 text-blue-800',
    NANNY: 'bg-pink-100 text-pink-800',
    MAID: 'bg-purple-100 text-purple-800',
  };

  if (!selectedStaff) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-warm-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-700">Staff Login</h1>
            <p className="text-gray-600 mt-2">Select your name</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 space-y-2">
            {staff.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectStaff(s)}
                className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 flex items-center justify-between transition-colors"
              >
                <span className="font-medium text-lg">{s.name}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[s.role]}`}>
                  {s.role}
                </span>
              </button>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link href="/login" className="text-primary-600 hover:underline">
              Admin Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-warm-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-700">Welcome, {selectedStaff.name}</h1>
          <p className="text-gray-600 mt-2">
            {isSettingPin ? 'Set your PIN for today' : 'Enter your PIN'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <Input
            label={isSettingPin ? 'Create 4-digit PIN' : 'Enter PIN'}
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            className="text-center text-2xl tracking-widest"
            required
          />

          <Button type="submit" className="w-full" loading={loading}>
            {isSettingPin ? 'Set PIN' : 'Login'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setSelectedStaff(null)}
          >
            Back to Staff List
          </Button>
        </form>
      </div>
    </main>
  );
}
