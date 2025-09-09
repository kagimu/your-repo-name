import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, GraduationCap, Award, Brain } from 'lucide-react';
import { 
  UgandanCurriculum, 
  CambridgeCurriculum
} from '../../data/curriculumData';

interface CurriculumLevel {
  subjects: string[];
  levels: string[];
  examBoard: string;
}

interface UgandanCurriculumType {
  primary: CurriculumLevel;
  oLevel: CurriculumLevel;
  aLevel: CurriculumLevel;
}

interface CambridgeCurriculumType {
  primary: CurriculumLevel;
  igcse: CurriculumLevel;
  aLevel: CurriculumLevel;
}

// Interfaces
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

interface LearningLevelsProps {
  onLevelSelect: (levelId: string) => void;
  onSubjectSelect: (levelId: string, subjectId: string) => void;
  selectedLevel?: string;
}

// Helper Functions
const getSubjectIcon = (subject: string): string => {
  const icons: Record<string, string> = {
    'Mathematics': '📐',
    'Physics': '⚡',
    'Chemistry': '⚗️',
    'Biology': '🧬',
    'English': '📚',
    'Literature': '📖',
    'Geography': '🌍',
    'History': '📜',
    'Economics': '📊',
    'Computer Science': '💻'
  };
  return icons[subject] || '📚';
};

const getSubjectColor = (index: number): string => {
  const colors = [
    'from-blue-500 to-cyan-500',
    'from-green-500 to-teal-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-blue-500',
    'from-teal-500 to-emerald-500'
  ];
  return colors[index % colors.length];
};

const getSubjectsForLevel = (level: string, curriculum: 'ugandan' | 'cambridge'): Subject[] => {
  const currData = curriculum === 'ugandan' 
    ? UgandanCurriculum as UgandanCurriculumType
    : CambridgeCurriculum as CambridgeCurriculumType;
  
  if (level.startsWith('P') || level.includes('Grade')) {
    return currData.primary.subjects.map((name, index) => ({
      id: `${name.toLowerCase()}-${level}`,
      name,
      icon: <span>{getSubjectIcon(name)}</span>,
      color: getSubjectColor(index)
    }));
  } 
  
  if (level.startsWith('S1') || level.startsWith('Year')) {
    const subjects = curriculum === 'ugandan' 
      ? (currData as UgandanCurriculumType).oLevel.subjects 
      : (currData as CambridgeCurriculumType).igcse.subjects;
      
    return subjects.map((name, index) => ({
      id: `${name.toLowerCase()}-${level}`,
      name,
      icon: <span>{getSubjectIcon(name)}</span>,
      color: getSubjectColor(index)
    }));
  }
  
  return currData.aLevel.subjects.map((name, index) => ({
    id: `${name.toLowerCase()}-${level}`,
    name,
    icon: <span>{getSubjectIcon(name)}</span>,
    color: getSubjectColor(index)
  }));
};

// Main Component
export const LearningLevels: React.FC<LearningLevelsProps> = ({
  onLevelSelect,
  onSubjectSelect,
  selectedLevel
}) => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<'ugandan' | 'cambridge'>('ugandan');

  const renderLevelCard = (level: Level, curriculumType: 'ugandan' | 'cambridge') => (
    <motion.div
      key={level.id}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl shadow-lg transition-all ${
        selectedLevel === level.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => onLevelSelect(level.id)}
    >
      <div className={`bg-gradient-to-br ${
        curriculumType === 'ugandan' 
          ? 'from-blue-500 to-purple-600' 
          : 'from-emerald-500 to-teal-600'
      } p-6`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-white text-xl font-bold">{level.name}</span>
          <span className="text-white text-3xl">{level.icon}</span>
        </div>
        <p className={`${
          curriculumType === 'ugandan' ? 'text-blue-100' : 'text-emerald-100'
        } text-sm`}>
          {level.description}
        </p>
      </div>
      
      {selectedLevel === level.id && (
        <div className="p-4 bg-white">
          <div className="grid grid-cols-2 gap-3">
            {getSubjectsForLevel(level.id, curriculumType).map((subject) => (
              <button
                key={subject.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSubjectSelect(level.id, subject.id);
                }}
                className={`flex items-center space-x-2 p-2 rounded-lg text-sm
                  bg-gradient-to-r ${subject.color} text-white hover:opacity-90
                  transition-all`}
              >
                <span>{subject.icon}</span>
                <span>{subject.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Curriculum Selector */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-xl p-1 shadow-md inline-flex">
          <button
            onClick={() => setSelectedCurriculum('ugandan')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCurriculum === 'ugandan'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Ugandan Curriculum
          </button>
          <button
            onClick={() => setSelectedCurriculum('cambridge')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCurriculum === 'cambridge'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cambridge International
          </button>
        </div>
      </div>

      {/* Level Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(() => {
          // Get curriculum data with proper typing
          const ugandanData = UgandanCurriculum as UgandanCurriculumType;
          const cambridgeData = CambridgeCurriculum as CambridgeCurriculumType;
          const currData = selectedCurriculum === 'ugandan' ? ugandanData : cambridgeData;

          // Combine levels from all sections
          const allLevels = [
            // Primary levels
            ...currData.primary.levels.map(level => ({
              id: level,
              name: level,
              subjects: currData.primary.subjects.map((name, idx) => ({
                id: `${name.toLowerCase()}-${level}`,
                name,
                icon: <span>{getSubjectIcon(name)}</span>,
                color: getSubjectColor(idx)
              })),
              icon: <Book className="w-6 h-6" />,
              description: `${selectedCurriculum === 'ugandan' ? 'Primary' : 'Cambridge Primary'} Level ${level}`
            })),
            
            // O-Level/IGCSE levels
            ...(selectedCurriculum === 'ugandan' 
              ? ugandanData.oLevel.levels.map(level => ({
                  id: level,
                  name: level,
                  subjects: ugandanData.oLevel.subjects.map((name, idx) => ({
                    id: `${name.toLowerCase()}-${level}`,
                    name,
                    icon: <span>{getSubjectIcon(name)}</span>,
                    color: getSubjectColor(idx)
                  })),
                  icon: <GraduationCap className="w-6 h-6" />,
                  description: `O-Level ${level}`
                }))
              : cambridgeData.igcse.levels.map(level => ({
                  id: level,
                  name: level,
                  subjects: cambridgeData.igcse.subjects.map((name, idx) => ({
                    id: `${name.toLowerCase()}-${level}`,
                    name,
                    icon: <span>{getSubjectIcon(name)}</span>,
                    color: getSubjectColor(idx)
                  })),
                  icon: <GraduationCap className="w-6 h-6" />,
                  description: `IGCSE ${level}`
                }))),
            
            // A-Level
            ...currData.aLevel.levels.map(level => ({
              id: level,
              name: level,
              subjects: currData.aLevel.subjects.map((name, idx) => ({
                id: `${name.toLowerCase()}-${level}`,
                name,
                icon: <span>{getSubjectIcon(name)}</span>,
                color: getSubjectColor(idx)
              })),
              icon: <Award className="w-6 h-6" />,
              description: `A-Level ${level}`
            }))
          ];

          return allLevels.map(level => renderLevelCard(level, selectedCurriculum));
        })()}
      </div>
    </div>
  );
};
