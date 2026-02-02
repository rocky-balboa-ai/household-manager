'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/navigation/header';
import { Button } from '@/components/ui/button';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { ArrowLeft, Clock, User, CheckCircle, Camera, X } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskDetailPage() {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [photoProof, setPhotoProof] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const user = useAuthStore((s) => s.user);

  const isAssigned = task?.assignments?.some((a: any) => a.user.id === user?.id);
  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    loadTask();
  }, [params.id]);

  const loadTask = async () => {
    try {
      const data = await api.getTask(params.id as string);
      setTask(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await api.completeTask(task.id, photoProof || undefined);
      setShowCompleteModal(false);
      loadTask();
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.deleteTask(task.id);
      router.push('/tasks');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="pt-20 text-center text-gray-500">Loading...</div>;
  }

  if (!task) {
    return <div className="pt-20 text-center text-gray-500">Task not found</div>;
  }

  return (
    <>
      <Header title="Task Details" />

      <div className="space-y-6 pt-2">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
              task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {task.status.replace('_', ' ')}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-warm-100 text-warm-700">
              {task.category}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>

          {task.description && (
            <p className="text-gray-600 mb-4">{task.description}</p>
          )}

          <div className="space-y-3 text-sm">
            {task.dueDate && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                Due: {format(new Date(task.dueDate), 'MMMM d, yyyy h:mm a')}
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              Assigned to: {task.assignments.map((a: any) => a.user.name).join(', ') || 'No one'}
            </div>
          </div>

          {task.photoProof && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Photo Proof:</p>
              <img src={task.photoProof} alt="Proof" className="rounded-lg max-h-48 object-cover" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          {task.status !== 'COMPLETED' && isAssigned && (
            <Button className="w-full" onClick={() => setShowCompleteModal(true)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          )}

          {isManager && (
            <Button variant="danger" className="w-full" onClick={handleDelete}>
              Delete Task
            </Button>
          )}
        </div>
      </div>

      {/* Complete Task Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Complete Task</h2>
              <button onClick={() => setShowCompleteModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600">Add a photo as proof of completion (optional).</p>

            <PhotoUpload
              value={photoProof || undefined}
              onChange={(value) => setPhotoProof(value)}
              label="Photo Proof"
            />

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCompleteModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleComplete} disabled={completing}>
                {completing ? 'Completing...' : 'Complete Task'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
