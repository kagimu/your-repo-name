import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Lightbulb, FileText, PenTool, Clock } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';
import { aiEducationService } from '@/services/aiEducationService';
import { Question, Flashcard, MindMapNode, StudyPlan } from '@/types/aiTypes';
import { ContentModal } from './ContentModal';

interface StudyToolsProps {
  academicLevel: string;
  subject?: string;
}

type ContentType = Question[] | Flashcard[] | MindMapNode | StudyPlan | string | null;

export const StudyTools: React.FC<StudyToolsProps> = ({ academicLevel, subject }) => {
  const [showContentModal, setShowContentModal] = useState(false);
  const [activeContent, setActiveContent] = useState<ContentType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  const tools = [
    {
      id: 'flashcards',
      title: 'AI Flashcards',
      description: 'Generate smart flashcards for quick revision',
      icon: Brain,
      color: 'from-blue-500 to-blue-600',
      action: () => aiEducationService.generateFlashcards(subject || 'general topics', academicLevel)
    },
    {
      id: 'summarizer',
      title: 'Smart Summarizer',
      description: 'Get AI-powered summaries of complex topics',
      icon: FileText,
      color: 'from-green-500 to-green-600',
      action: () => aiEducationService.generateStudyNotes(subject || 'general topics', 'summary', academicLevel)
    },
    {
      id: 'mindmap',
      title: 'Mind Mapping',
      description: 'Create visual concept maps',
      icon: Lightbulb,
      color: 'from-purple-500 to-purple-600',
      action: () => aiEducationService.generateMindMap(subject || 'general topics', 'key concepts')
    },
    {
      id: 'notes',
      title: 'Study Notes',
      description: 'Generate comprehensive study notes',
      icon: PenTool,
      color: 'from-orange-500 to-orange-600',
      action: () => aiEducationService.generateStudyNotes(subject || 'general topics', 'comprehensive notes', academicLevel)
    },
    {
      id: 'scheduler',
      title: 'Study Planner',
      description: 'Create personalized study schedules',
      icon: Clock,
      color: 'from-pink-500 to-pink-600',
      action: () => aiEducationService.generateStudyPlan(subject || 'general topics', academicLevel, '2 weeks')
    },
    {
      id: 'practice',
      title: 'Practice Problems',
      description: 'Get AI-generated practice questions',
      icon: BookOpen,
      color: 'from-teal-500 to-teal-600',
      action: () => aiEducationService.generatePracticeProblems(subject || 'general topics', 'current topic', academicLevel)
    }
  ];

  const handleToolClick = async (tool: typeof tools[0]) => {
    if (!academicLevel) {
      alert('Please select an academic level first');
      return;
    }

    setIsLoading(true);
    setActiveToolId(tool.id);

    try {
      const result = await tool.action();
      setActiveContent(result);
      setShowContentModal(true);
    } catch (error) {
      console.error('Error using AI tool:', error);
      alert('Sorry, there was an error. Please try again.');
    } finally {
      setIsLoading(false);
      setActiveToolId(null);
    }
  };

  const renderContent = (content: ContentType) => {
    if (!content) return null;

    if (Array.isArray(content)) {
      // Render Questions or Flashcards
      return content.map((item, index) => (
        <div key={index} className="mb-4 p-4 bg-white rounded-lg shadow">
          {'question' in item ? (
            // Question
            <>
              <h3 className="font-semibold">{item.question}</h3>
              {item.options && (
                <ul className="mt-2">
                  {item.options.map((option, idx) => (
                    <li key={idx} className="ml-4">{option}</li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-green-600">{item.answer}</p>
              {item.explanation && (
                <p className="mt-2 text-gray-600">{item.explanation}</p>
              )}
            </>
          ) : (
            // Flashcard
            <div className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="p-4 border rounded">
                <div className="font-semibold">{item.front}</div>
                <div className="mt-2 text-gray-600">{item.back}</div>
              </div>
            </div>
          )}
        </div>
      ));
    }

    if (typeof content === 'string') {
      // Render study notes
      return (
        <div className="prose max-w-none">
          {content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      );
    }

    if ('topics' in content) {
      // Render study plan
      const studyPlan = content as StudyPlan;
      return (
        <div className="space-y-4">
          {studyPlan.topics.map((topic, index) => (
            <div key={index} className="p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold">{topic.name}</h3>
              <p className="text-gray-600">{topic.duration}</p>
              <div className="mt-2">
                <h4 className="font-medium">Resources:</h4>
                <ul className="list-disc ml-4">
                  {topic.resources.map((resource, idx) => (
                    <li key={idx}>{resource}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Render mind map
    const mindMap = content as MindMapNode;
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="font-semibold">{mindMap.topic}</h3>
        <div className="mt-4">
          {mindMap.children.map((child, index) => (
            <div key={index} className="ml-4 mt-2">
              <h4 className="font-medium">{child.topic}</h4>
              <ul className="list-disc ml-4">
                {child.concepts.map((concept, idx) => (
                  <li key={idx}>{concept}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
              onClick={() => handleToolClick(tool)}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && activeToolId === tool.id ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate'
              )}
            </EdumallButton>
          </motion.div>
        ))}
      </div>

      {/* Content Modal */}
      {showContentModal && activeContent && (
        <ContentModal
          isOpen={showContentModal}
          onClose={() => setShowContentModal(false)}
          title={tools.find(t => t.id === activeToolId)?.title || 'Study Content'}
        >
          {renderContent(activeContent)}
        </ContentModal>
      )}
    </div>
  );
};
