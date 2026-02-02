'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/navigation/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { Users, Settings, Plus, Trash2, Key, RefreshCw, X } from 'lucide-react';

const ROLES = ['ADMIN', 'MANAGER', 'DRIVER', 'NANNY', 'MAID'] as const;
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'Urdu' },
  { value: 'tl', label: 'Tagalog' },
  { value: 'sw', label: 'Kiswahili' },
  { value: 'am', label: 'Amharic' },
];

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  language: string;
  altLanguage?: string;
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'config'>('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MAID' as typeof ROLES[number],
    language: 'en',
    phone: '',
  });
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    loadUsers();
  }, [user, router]);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    try {
      await api.createUser(newUser);
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'MAID', language: 'en', phone: '' });
      loadUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to create user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.deleteUser(id);
      loadUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleResetPin = async (id: string) => {
    if (!confirm('Reset PIN for this user? They will need to set a new PIN on next login.')) return;
    try {
      await api.resetUserPin(id);
      alert('PIN reset successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to reset PIN');
    }
  };

  const handleResetPassword = async () => {
    if (!showResetPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      await api.resetUserPassword(showResetPassword, newPassword);
      setShowResetPassword(null);
      setNewPassword('');
      alert('Password reset successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to reset password');
    }
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <>
      <Header title="Admin" />

      <div className="space-y-4 pt-2">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              activeTab === 'users' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            <Users className="w-4 h-4" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              activeTab === 'config' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            <Settings className="w-4 h-4" />
            Config
          </button>
        </div>

        {activeTab === 'users' && (
          <>
            {/* Add User Button */}
            <div className="flex justify-end">
              <Button onClick={() => setShowAddUser(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            {/* Add User Form */}
            {showAddUser && (
              <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-primary-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Add New User</h3>
                  <button onClick={() => setShowAddUser(false)}>
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                  <Input
                    type="password"
                    placeholder="Password (min 6 chars)"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                  <Input
                    placeholder="Phone (optional)"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                  <select
                    className="px-3 py-2 rounded-lg border border-gray-300"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as typeof ROLES[number] })}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <select
                    className="px-3 py-2 rounded-lg border border-gray-300"
                    value={newUser.language}
                    onChange={(e) => setNewUser({ ...newUser, language: e.target.value })}
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
                  <Button onClick={handleCreateUser}>Create User</Button>
                </div>
              </div>
            )}

            {/* Users List */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
                {users.map((u) => (
                  <div key={u.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{u.name}</h3>
                        <p className="text-sm text-gray-500">{u.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                            u.role === 'MANAGER' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {u.role}
                          </span>
                          <span className="text-xs text-gray-500">
                            {LANGUAGES.find((l) => l.value === u.language)?.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {u.role !== 'ADMIN' && (
                      <div className="flex gap-2 mt-4 pt-3 border-t">
                        <button
                          onClick={() => handleResetPin(u.id)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Reset PIN
                        </button>
                        <button
                          onClick={() => setShowResetPassword(u.id)}
                          className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-800"
                        >
                          <Key className="w-4 h-4" />
                          Reset Password
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reset Password Modal */}
            {showResetPassword && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
                  <Input
                    type="password"
                    placeholder="New password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1" onClick={() => {
                      setShowResetPassword(null);
                      setNewPassword('');
                    }}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={handleResetPassword}>
                      Reset Password
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'config' && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500">
              Configuration management coming soon. Use the API directly for now:
            </p>
            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
              <li>GET /api/config - List all config</li>
              <li>GET /api/config?type=task_category - Filter by type</li>
              <li>POST /api/config - Create new config item</li>
              <li>PATCH /api/config/:id - Update config item</li>
              <li>DELETE /api/config/:id - Delete config item</li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
