'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/navigation/header';
import { TaskCard } from '@/components/tasks/task-card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { socketClient } from '@/lib/socket';
import { Plus, Filter } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

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

  useEffect(() => {
    loadTasks();

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
  }, [loadTasks]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      if (newStatus === 'COMPLETED') {
        await api.completeTask(taskId);
      } else {
        await api.updateTask(taskId, { status: newStatus });
      }
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status !== 'COMPLETED';
    if (filter === 'completed') return task.status === 'COMPLETED';
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status !== 'COMPLETED').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <>
      <Header title="Tasks" />

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? `All (${tasks.length})` : f === 'pending' ? `Pending (${pendingCount})` : `Done (${completedCount})`}
              </button>
            ))}
          </div>

          {isManager && (
            <Link href="/tasks/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No tasks found</div>
        ) : (
          <div className="space-y-3">
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
