import { ReactNode } from 'react';
import { StatsCard } from '@/components/ui';
import { StatsCard as StatsCardType } from '@/lib/types';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  stats?: StatsCardType[];
  children?: ReactNode;
  className?: string;
  filterInfo?: string;
}

export default function PageHeader({ 
  title, 
  subtitle, 
  stats = [], 
  children,
  className,
  filterInfo
}: PageHeaderProps) {
  return (
    <header className={`bg-white shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-gray-600">
                {subtitle}
              </p>
            )}
            {filterInfo && (
              <p className="mt-1 text-sm text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded-full inline-block">
                {filterInfo}
              </p>
            )}
          </div>
          {children}
        </div>

        {stats.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <StatsCard key={index} stats={stat} />
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
