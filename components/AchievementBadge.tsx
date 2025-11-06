import React from 'react';
import { Achievement } from '../types';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'medium',
  showProgress = true
}) => {
  const isUnlocked = !!achievement.unlockedAt;
  const progress = achievement.progress || 0;
  const maxProgress = achievement.maxProgress || 1;
  const progressPercent = (progress / maxProgress) * 100;

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-32 h-32'
  };

  const iconSizes = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-5xl'
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
        <div className={`absolute inset-0 rounded-full ${
          isUnlocked 
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50' 
            : 'bg-gray-700'
        } flex items-center justify-center transition-all duration-300`}>
          <span className={`${iconSizes[size]} ${isUnlocked ? 'grayscale-0' : 'grayscale opacity-50'}`}>
            {achievement.icon}
          </span>
        </div>
        
        {!isUnlocked && showProgress && maxProgress > 1 && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="8"
              strokeDasharray={`${progressPercent * 2.89} ${289 - progressPercent * 2.89}`}
              className="transition-all duration-500"
            />
          </svg>
        )}
        
        {isUnlocked && (
          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 shadow-lg">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="text-center mt-2">
        <h4 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-gray-400'} ${
          size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'
        }`}>
          {achievement.name}
        </h4>
        <p className={`text-gray-500 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
          {achievement.description}
        </p>
        {!isUnlocked && showProgress && maxProgress > 1 && (
          <p className="text-xs text-blue-400 mt-1">
            {progress}/{maxProgress}
          </p>
        )}
      </div>
    </div>
  );
};

interface AchievementListProps {
  achievements: Achievement[];
}

export const AchievementList: React.FC<AchievementListProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Achievements</h3>
        <span className="text-sm text-gray-400">
          {unlockedCount}/{achievements.length} Unlocked
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {achievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            size="medium"
          />
        ))}
      </div>
    </div>
  );
};
