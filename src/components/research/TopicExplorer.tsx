
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight, BookOpen, Users, TrendingUp } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';

interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  popularity: number;
  relatedTopics: string[];
}

interface TopicExplorerProps {
  onTopicSelect: (topic: Topic) => void;
}

export const TopicExplorer: React.FC<TopicExplorerProps> = ({ onTopicSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const topics: Topic[] = [
    {
      id: '1',
      title: 'Impact of Technology on Modern Education',
      description: 'Explore how digital transformation is reshaping educational methodologies and learning outcomes.',
      category: 'Education Technology',
      difficulty: 'Intermediate',
      estimatedTime: '2-3 weeks',
      popularity: 85,
      relatedTopics: ['Digital Learning', 'EdTech Tools', 'Online Assessment']
    },
    {
      id: '2',
      title: 'Renewable Energy Solutions in Developing Countries',
      description: 'Investigate sustainable energy alternatives and their implementation challenges in emerging economies.',
      category: 'Environmental Science',
      difficulty: 'Advanced',
      estimatedTime: '4-6 weeks',
      popularity: 92,
      relatedTopics: ['Solar Energy', 'Wind Power', 'Energy Policy']
    },
    {
      id: '3',
      title: 'Mental Health Awareness in Academic Institutions',
      description: 'Study the prevalence of mental health issues among students and effective intervention strategies.',
      category: 'Psychology',
      difficulty: 'Beginner',
      estimatedTime: '1-2 weeks',
      popularity: 78,
      relatedTopics: ['Student Wellbeing', 'Counseling Services', 'Stress Management']
    },
    {
      id: '4',
      title: 'Artificial Intelligence in Healthcare Diagnostics',
      description: 'Examine the role of AI and machine learning in improving medical diagnosis accuracy.',
      category: 'Medical Technology',
      difficulty: 'Advanced',
      estimatedTime: '3-4 weeks',
      popularity: 89,
      relatedTopics: ['Machine Learning', 'Medical Imaging', 'Predictive Analytics']
    },
    {
      id: '5',
      title: 'Sustainable Agriculture Practices',
      description: 'Research eco-friendly farming methods and their impact on food security and environmental conservation.',
      category: 'Agriculture',
      difficulty: 'Intermediate',
      estimatedTime: '2-3 weeks',
      popularity: 73,
      relatedTopics: ['Organic Farming', 'Crop Rotation', 'Precision Agriculture']
    }
  ];

  const categories = ['all', 'Education Technology', 'Environmental Science', 'Psychology', 'Medical Technology', 'Agriculture'];

  const filteredTopics = selectedCategory === 'all' 
    ? topics 
    : topics.filter(topic => topic.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
            }`}
          >
            {category === 'all' ? 'All Categories' : category}
          </button>
        ))}
      </div>

      {/* Topics Grid */}
      <div className="space-y-4">
        {filteredTopics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Lightbulb size={20} className="text-yellow-500" />
                  <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                    {topic.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{topic.title}</h3>
                <p className="text-gray-600 mb-3">{topic.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <span className={`px-2 py-1 rounded-full ${
                    topic.difficulty === 'Beginner' ? 'bg-green-100 text-green-600' :
                    topic.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {topic.difficulty}
                  </span>
                  <span className="flex items-center">
                    <BookOpen size={14} className="mr-1" />
                    {topic.estimatedTime}
                  </span>
                  <span className="flex items-center">
                    <TrendingUp size={14} className="mr-1" />
                    {topic.popularity}% popular
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {topic.relatedTopics.map((relatedTopic) => (
                    <span
                      key={relatedTopic}
                      className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
                    >
                      {relatedTopic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Users size={14} className="mr-1" />
                <span>{Math.floor(topic.popularity * 10)} researchers working on this</span>
              </div>
              <div className="flex space-x-2">
                <EdumallButton variant="ghost" size="sm">
                  Learn More
                </EdumallButton>
                <EdumallButton 
                  variant="primary" 
                  size="sm"
                  onClick={() => onTopicSelect(topic)}
                  className="group-hover:bg-blue-600 transition-colors"
                >
                  Start Research
                  <ArrowRight size={16} className="ml-1" />
                </EdumallButton>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
