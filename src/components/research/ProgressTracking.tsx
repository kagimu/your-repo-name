import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Flame, Award, Brain } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  icon: React.ElementType;
  color: string;
}

interface ProgressTrackingProps {
  academicLevel: string;
  subject?: string;
}

export const ProgressTracking: React.FC<ProgressTrackingProps> = ({ academicLevel, subject }) => {
  const achievements: Achievement[] = [
    {
      id: 'streak',
      title: 'Learning Streak',
      description: 'Days of consecutive learning',
      progress: 7,
      total: 30,
      icon: Flame,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'quizzes',
      title: 'Quiz Master',
      description: 'Quizzes completed with >80% score',
      progress: 12,
      total: 50,
      icon: Brain,
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'topics',
      title: 'Topic Explorer',
      description: 'Topics mastered',
      progress: 5,
      total: 20,
      icon: Target,
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'time',
      title: 'Study Hours',
      description: 'Hours spent learning',
      progress: 25,
      total: 100,
      icon: Star,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const rewards = [
    { id: 1, title: 'Quick Learner', description: 'Complete 5 quizzes in one day', icon: Trophy },
    { id: 2, title: 'Knowledge Seeker', description: 'Study for 50 hours', icon: Award },
    { id: 3, title: 'Master Mind', description: 'Master 10 topics', icon: Brain }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${achievement.color} flex items-center justify-center mb-4`}>
              {React.createElement(achievement.icon, { size: 24, className: "text-white" })}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {achievement.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-3">
              {achievement.description}
            </p>
            
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {Math.round((achievement.progress / achievement.total) * 100)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r ${achievement.color}`}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {achievement.progress} / {achievement.total}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rewards Section */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-blue-300 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                {React.createElement(reward.icon, { size: 20, className: "text-blue-600" })}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{reward.title}</h3>
                <p className="text-sm text-gray-600">{reward.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
