import { StatsCard as StatsCardType } from '@/lib/types';
import { clsx } from 'clsx';

interface StatsCardProps {
  stats: StatsCardType;
  className?: string;
}

export default function StatsCard({ stats, className }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };
  
  const labelColorClasses = {
    blue: 'text-blue-800',
    yellow: 'text-yellow-800',
    green: 'text-green-800',
    purple: 'text-purple-800',
    red: 'text-red-800',
    indigo: 'text-indigo-800'
  };
  
  return (
    <div className={clsx('p-4 rounded-lg', colorClasses[stats.color], className)}>
      <div className="text-2xl font-bold">
        {stats.value.toLocaleString()}
      </div>
      <div className={clsx('text-sm', labelColorClasses[stats.color])}>
        {stats.label}
      </div>
    </div>
  );
}
