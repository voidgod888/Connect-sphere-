import React from 'react';
import { Users, MessageSquare, Clock, TrendingUp } from 'lucide-react';

interface StatsDashboardProps {
  totalMatches: number;
  totalMessages: number;
  averageMatchDuration: number;
  successRate: number;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  totalMatches,
  totalMessages,
  averageMatchDuration,
  successRate
}) => {
  const formatDuration = (minutes: number): string => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const stats = [
    {
      label: 'Total Matches',
      value: totalMatches,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      label: 'Messages Sent',
      value: totalMessages,
      icon: MessageSquare,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      label: 'Avg. Duration',
      value: formatDuration(averageMatchDuration),
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-lg p-4 border border-gray-700/50 backdrop-blur-sm animate-fadeInUp`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-400">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
