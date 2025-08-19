import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Lightbulb, FileText, PenTool, Clock } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';

interface StudyToolsProps {
  academicLevel: string;
  subject?: string;
}

export const StudyTools: React.FC<StudyToolsProps> = ({ academicLevel, subject }) => {
  const tools = [
    {
      id: 'flashcards',
      title: 'AI Flashcards',
      description: 'Generate smart flashcards for quick revision',
      icon: Brain,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'summarizer',
      title: 'Smart Summarizer',
      description: 'Get AI-powered summaries of complex topics',
      icon: FileText,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'mindmap',
      title: 'Mind Mapping',
      description: 'Create visual concept maps',
      icon: Lightbulb,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'notes',
      title: 'Study Notes',
      description: 'Generate comprehensive study notes',
      icon: PenTool,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'scheduler',
      title: 'Study Planner',
      description: 'Create personalized study schedules',
      icon: Clock,
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'practice',
      title: 'Practice Problems',
      description: 'Get AI-generated practice questions',
      icon: BookOpen,
      color: 'from-teal-500 to-teal-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4`}>
              {React.createElement(tool.icon, { size: 24, className: "text-white" })}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {tool.title}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {tool.description}
            </p>

            <EdumallButton
              variant="ghost"
              onClick={() => {
                // Handle tool activation based on academic level and subject
                console.log(`Activating ${tool.title} for ${academicLevel} ${subject || ''}`);
              }}
              className="w-full"
            >
              Use Tool
            </EdumallButton>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
