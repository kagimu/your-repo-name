import React from 'react';
import { motion } from 'framer-motion';
import { Book, GraduationCap, Award, Brain } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
}

interface Level {
  id: string;
  name: string;
  subjects: Subject[];
  icon: JSX.Element;
  description: string;
}

const levels: Level[] = [
  {
    id: 'primary',
    name: 'Primary',
    icon: <Book className="w-6 h-6" />,
    description: 'Foundation subjects for young learners',
    subjects: [
      { id: 'math-p', name: 'Mathematics', icon: <span>➕</span>, color: 'from-blue-500 to-cyan-500' },
      { id: 'science-p', name: 'Science', icon: <span>🔬</span>, color: 'from-green-500 to-teal-500' },
      { id: 'english-p', name: 'English', icon: <span>📚</span>, color: 'from-purple-500 to-pink-500' },
      { id: 'social-p', name: 'Social Studies', icon: <span>🌍</span>, color: 'from-orange-500 to-red-500' }
    ]
  },
  {
    id: 'o-level',
    name: 'O-Level',
    icon: <GraduationCap className="w-6 h-6" />,
    description: 'Comprehensive secondary education',
    subjects: [
      { id: 'math-o', name: 'Mathematics', icon: <span>📐</span>, color: 'from-blue-600 to-cyan-600' },
      { id: 'physics-o', name: 'Physics', icon: <span>⚡</span>, color: 'from-purple-600 to-blue-600' },
      { id: 'chemistry-o', name: 'Chemistry', icon: <span>⚗️</span>, color: 'from-green-600 to-teal-600' },
      { id: 'biology-o', name: 'Biology', icon: <span>🧬</span>, color: 'from-teal-600 to-green-600' }
    ]
  },
  {
    id: 'a-level',
    name: 'A-Level',
    icon: <Award className="w-6 h-6" />,
    description: 'Advanced academic preparation',
    subjects: [
      { id: 'math-a', name: 'Mathematics', icon: <span>∫</span>, color: 'from-indigo-600 to-blue-600' },
      { id: 'physics-a', name: 'Physics', icon: <span>🔭</span>, color: 'from-blue-600 to-cyan-600' },
      { id: 'chemistry-a', name: 'Chemistry', icon: <span>🧪</span>, color: 'from-teal-600 to-green-600' },
      { id: 'biology-a', name: 'Biology', icon: <span>🦠</span>, color: 'from-green-600 to-emerald-600' }
    ]
  },
  {
    id: 'university',
    name: 'University',
    icon: <Brain className="w-6 h-6" />,
    description: 'Higher education and research',
    subjects: [
      { id: 'stem', name: 'STEM', icon: <span>🤖</span>, color: 'from-blue-700 to-indigo-700' },
      { id: 'humanities', name: 'Humanities', icon: <span>📜</span>, color: 'from-purple-700 to-pink-700' },
      { id: 'business', name: 'Business', icon: <span>📊</span>, color: 'from-green-700 to-teal-700' },
      { id: 'arts', name: 'Arts', icon: <span>🎨</span>, color: 'from-orange-700 to-red-700' }
    ]
  }
];

interface LearningLevelsProps {
  onLevelSelect: (levelId: string) => void;
  onSubjectSelect: (levelId: string, subjectId: string) => void;
  selectedLevel?: string;
}

export const LearningLevels: React.FC<LearningLevelsProps> = ({
  onLevelSelect,
  onSubjectSelect,
  selectedLevel
}) => {
  return (
    <div className="space-y-8">
      {/* Level Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {levels.map((level) => (
          <motion.button
            key={level.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onLevelSelect(level.id)}
            className={`p-6 rounded-2xl border transition-all ${
              selectedLevel === level.id
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-xl ${
                selectedLevel === level.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {level.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{level.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{level.description}</p>
            
            {selectedLevel === level.id && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-2"
              >
                {level.subjects.map((subject) => (
                  <motion.button
                    key={subject.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubjectSelect(level.id, subject.id);
                    }}
                    className="p-2 rounded-xl bg-gradient-to-r hover:shadow-md transition-all text-white text-sm font-medium"
                    style={{
                      background: `linear-gradient(to right, var(--tw-gradient-stops))`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {subject.icon}
                      <span>{subject.name}</span>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
