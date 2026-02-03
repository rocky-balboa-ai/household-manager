'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/navigation/header';
import { TaskCard } from '@/components/tasks/task-card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { socketClient } from '@/lib/socket';
import { useTranslation } from '@/hooks/useTranslation';
import { Plus, ChevronDown } from 'lucide-react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

type StatusFilter = 'all' | 'pending' | 'completed';
type DateFilter = 'all' | 'today' | 'week' | 'month';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const { t } = useTranslation();

  // Staff default to seeing their own tasks
  useEffect(() => {
    if (user && !isManager) {
      setAssigneeFilter(user.id);
    }
  }, [user, isManager]);

  const loadTasks = useCallback(async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadUsers();

    // Listen for real-time task updates
    const handleTaskCreated = () => loadTasks();
    const handleTaskUpdated = () => loadTasks();
    const handleTaskCompleted = () => loadTasks();

    socketClient.on('task:created', handleTaskCreated);
    socketClient.on('task:updated', handleTaskUpdated);
    socketClient.on('task:completed', handleTaskCompleted);

    return () => {
      socketClient.off('task:created', handleTaskCreated);
      socketClient.off('task:updated', handleTaskUpdated);
      socketClient.off('task:completed', handleTaskCompleted);
    };
  }, [loadTasks, loadUsers]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    // Optimistic update - update local state immediately
    const previousTasks = [...tasks];
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: newStatus, completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null }
        : task
    ));

    try {
      if (newStatus === 'COMPLETED') {
        await api.completeTask(taskId);
      } else {
        await api.updateTask(taskId, { status: newStatus });
      }
      // Server confirmed, no need to reload
    } catch (err) {
      console.error(err);
      // Revert to previous state on error
      setTasks(previousTasks);
    }
  };

  // Get staff members for assignee filter
  const staffMembers = useMemo(() => {
    return users.filter((u) => ['DRIVER', 'NANNY', 'MAID'].includes(u.role));
  }, [users]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    const now = new Date();

    return tasks
      .filter((task) => {
        // Status filter
        if (statusFilter === 'pending' && task.status === 'COMPLETED') return false;
        if (statusFilter === 'completed' && task.status !== 'COMPLETED') return false;

        // Assignee filter
        if (assigneeFilter !== 'all') {
          const isAssigned = task.assignments?.some((a: any) => a.user.id === assigneeFilter);
          if (!isAssigned) return false;
        }

        // Date filter
        if (dateFilter !== 'all' && task.dueDate) {
          const dueDate = parseISO(task.dueDate);
          let interval: { start: Date; end: Date };

          switch (dateFilter) {
            case 'today':
              interval = { start: startOfDay(now), end: endOfDay(now) };
              break;
            case 'week':
              interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
              break;
            case 'month':
              interval = { start: startOfMonth(now), end: endOfMonth(now) };
              break;
            default:
              return true;
          }

          if (!isWithinInterval(dueDate, interval)) return false;
        } else if (dateFilter !== 'all' && !task.dueDate) {
          // Tasks without due date only show in 'all' date filter
          return false;
        }

        return true;
      })
      // Sort by due date (nulls last), then by status (pending first), then by creation
      .sort((a, b) => {
        // Completed tasks go to the bottom
        if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
        if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;

        // Sort by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;

        // Fall back to creation date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, statusFilter, dateFilter, assigneeFilter]);

  const pendingCount = tasks.filter((t) => t.status !== 'COMPLETED').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <>
      <Header title={t('tasks.title')} />

      <div className="space-y-4 pt-2">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl p-3 shadow-sm space-y-3">
          {/* Row 1: Assignee and Date filters */}
          <div className="flex flex-wrap gap-2">
            {/* Assignee Filter */}
            <div className="relative">
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">{t('tasks.allAssignees')}</option>
                {staffMembers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Date Filter */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['all', 'today', 'week', 'month'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setDateFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    dateFilter === f
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {f === 'all' ? t('tasks.dateAll') : f === 'today' ? t('tasks.dateToday') : f === 'week' ? t('tasks.dateWeek') : t('tasks.dateMonth')}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Status tabs */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {(['all', 'pending', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === f
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? `${t('tasks.all')} (${tasks.length})` : f === 'pending' ? `${t('tasks.pending')} (${pendingCount})` : `${t('tasks.done')} (${completedCount})`}
                </button>
              ))}
            </div>

            {isManager && (
              <Link href="/tasks/new">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  {t('tasks.add')}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">{t('common.loading')}</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">{t('tasks.noTasks')}</div>
        ) : (
          <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={(status) => handleStatusChange(task.id, status)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
