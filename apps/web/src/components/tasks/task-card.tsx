'use client';

import Link from 'next/link';
import { Clock, User, CheckCircle, Circle, Play, RefreshCw } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    category: string;
    status: string;
    dueDate?: string;
    recurring?: string;
    assignments: { user: { id: string; name: string } }[];
  };
  onStatusChange?: (status: string) => void;
}

const categoryColors: Record<string, string> = {
  cleaning: 'bg-blue-100 text-blue-700',
  cooking: 'bg-orange-100 text-orange-700',
  laundry: 'bg-purple-100 text-purple-700',
  kids: 'bg-pink-100 text-pink-700',
  shopping: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-700',
};

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Circle className="w-5 h-5 text-gray-400" />,
  IN_PROGRESS: <Play className="w-5 h-5 text-blue-500" />,
  COMPLETED: <CheckCircle className="w-5 h-5 text-green-500" />,
};

const recurringLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

function formatDueDate(dueDate: string): { text: string; isOverdue: boolean; isUrgent: boolean } {
  const date = new Date(dueDate);
  const now = new Date();

  if (isToday(date)) {
    return { text: `Today, ${format(date, 'h:mm a')}`, isOverdue: isPast(date), isUrgent: true };
  }

  if (isTomorrow(date)) {
    return { text: `Tomorrow, ${format(date, 'h:mm a')}`, isOverdue: false, isUrgent: true };
  }

  if (isPast(date)) {
    return { text: format(date, 'MMM d, h:mm a'), isOverdue: true, isUrgent: false };
  }

  return { text: format(date, 'MMM d, h:mm a'), isOverdue: false, isUrgent: false };
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : null;
  const isOverdue = dueInfo?.isOverdue && task.status !== 'COMPLETED';

  return (
    <Link
      href={`/tasks/${task.id}`}
      className={`block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${
        task.status === 'COMPLETED' ? 'opacity-60' : ''
      } ${isOverdue ? 'ring-2 ring-red-200' : ''}`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            if (task.status !== 'COMPLETED' && onStatusChange) {
              onStatusChange(task.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED');
            }
          }}
          className="mt-1"
        >
          {statusIcons[task.status]}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.title}
          </h3>

          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[task.category]}`}>
              {task.category}
            </span>

            {task.recurring && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                <RefreshCw className="w-3 h-3" />
                {recurringLabels[task.recurring] || task.recurring}
              </span>
            )}

            {dueInfo && (
              <span className={`flex items-center gap-1 text-xs ${
                isOverdue ? 'text-red-600 font-medium' : 
                dueInfo.isUrgent ? 'text-amber-600 font-medium' : 
                'text-gray-500'
              }`}>
                <Clock className="w-3 h-3" />
                {dueInfo.text}
              </span>
            )}

            {task.assignments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <User className="w-3 h-3" />
                {task.assignments.map((a) => a.user.name).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
