import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Lightbulb, BookOpen, Download, Share, Star, Zap } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { CustomCursor } from '@/components/CustomCursor';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { ResearchResults } from '@/components/research/ResearchResults';
import { TopicExplorer } from '@/components/research/TopicExplorer';
import { AIToolsModal } from '@/components/research/AIToolsModal';
import { Brain } from 'lucide-react';

const Research = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showAITools, setShowAITools] = useState(false);
  const [selectedContent, setSelectedContent] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate AI-powered search
    setTimeout(() => {
      const mockResults = [
        {
          id: '1',
          title: 'The Impact of Digital Learning Platforms on Student Engagement',
          authors: ['Dr. Sarah Johnson', 'Prof. Michael Chen'],
          abstract: 'This comprehensive study examines how digital learning platforms have revolutionized student engagement across various educational levels. The research analyzes data from over 10,000 students...',
          journal: 'Journal of Educational Technology',
          year: 2023,
          citations: 147,
          downloadUrl: '#',
          relevanceScore: 0.92
        },
        {
          id: '2',
          title: 'Machine Learning Applications in Modern Education Systems',
          authors: ['Dr. Emily Rodriguez', 'Dr. James Wilson'],
          abstract: 'An in-depth analysis of how machine learning algorithms are being integrated into educational frameworks to provide personalized learning experiences...',
          journal: 'AI in Education Review',
          year: 2023,
          citations: 89,
          downloadUrl: '#',
          relevanceScore: 0.85
        }
      ];
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 2000);
  };

  const handleViewFullText = (content: string) => {
    setSelectedContent(content);
    setShowAITools(true);
  };

  const handleAIToolLaunch = (tool: string, content: string = '') => {
    setSelectedContent(content);
    setShowAITools(true);
  };

  const researchTools = [
    {
      id: 1,
      title: 'AI Research Assistant',
      description: 'Get intelligent help with research topics, thesis writing, and academic papers using advanced AI',
      icon: Lightbulb,
      color: 'from-blue-500 to-blue-600',
      features: ['Smart topic suggestions', 'Automated outline generation', 'Citation assistance', 'Plagiarism detection']
    },
    {
      id: 2,
      title: 'Academic Database Search',
      description: 'Access thousands of peer-reviewed papers and journals with intelligent search capabilities',
      icon: FileText,
      color: 'from-green-500 to-green-600',
      features: ['Peer-reviewed papers', 'Citation tracking', 'Full-text search', 'Export tools']
    },
    {
      id: 3,
      title: 'Research Planner',
      description: 'Organize your research timeline, milestones, and collaborate with team members',
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      features: ['Timeline creation', 'Milestone tracking', 'Progress reports', 'Team collaboration']
    },
    {
      id: 4,
      title: 'AI Writing Assistant',
      description: 'Get help with academic writing, grammar checking, and style improvements',
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      features: ['Grammar checking', 'Style suggestions', 'Academic tone', 'Reference formatting']
    }
  ];

  const recentSearches = [
    'Climate change effects on agriculture',
    'Machine learning in education',
    'Sustainable development goals',
    'Digital transformation in healthcare',
    'Renewable energy technologies'
  ];

  const handleTopicSelect = (topic) => {
    setSearchQuery(topic.title);
    setActiveTab('search');
    handleSearch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <CustomCursor />
      <Navbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                🔬 AI Research Hub
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                AI-powered research tools for academic excellence and discovery
              </p>
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white/80 backdrop-blur-lg rounded-xl p-1 border border-gray-200/50 mb-8">
            {[
              { id: 'search', label: 'AI Search', icon: Search },
              { id: 'tools', label: 'Research Tools', icon: Lightbulb },
              { id: 'topics', label: 'Topic Explorer', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content based on active tab */}
          {activeTab === 'search' && (
            <div className="space-y-8">
              {/* Search Section */}
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Powered Academic Search</h2>
                
                <div className="relative mb-6">
                  <Search size={24} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ask AI about any research topic or search for papers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  />
                  <EdumallButton 
                    variant="primary" 
                    className="absolute right-2 top-2 bg-gradient-to-r from-blue-500 to-blue-600"
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </EdumallButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Recent Searches</h3>
                    <div className="space-y-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(search)}
                          className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                    <div className="space-y-3">
                      <EdumallButton variant="ghost" className="w-full justify-start">
                        <Download size={18} className="mr-2" />
                        Download Citation Guide
                      </EdumallButton>
                      <EdumallButton variant="ghost" className="w-full justify-start">
                        <Share size={18} className="mr-2" />
                        Share Research
                      </EdumallButton>
                      <EdumallButton variant="ghost" className="w-full justify-start">
                        <Star size={18} className="mr-2" />
                        Saved Papers
                      </EdumallButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              {(searchQuery || searchResults.length > 0) && (
                <ResearchResults 
                  query={searchQuery}
                  results={searchResults}
                  isLoading={isSearching}
                  onViewFullText={handleViewFullText}
                  onSaveToLibrary={(result) => {
                    window.alert('Saved to Library!');
                  }}
                />
              )}
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {researchTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${tool.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{tool.title}</h3>
                    <p className="text-gray-600 mb-4">{tool.description}</p>
                    <div className="space-y-2 mb-6">
                      {tool.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-teal-500 rounded-full mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <EdumallButton 
                      variant="primary" 
                      className="w-full"
                      onClick={() => handleAIToolLaunch(tool.title)}
                    >
                      Launch Tool
                    </EdumallButton>
                  </motion.div>
                );
              })}
            </div>
          )}

          {activeTab === 'topics' && (
            <TopicExplorer onTopicSelect={handleTopicSelect} />
          )}
        </div>
      </main>

      <AIToolsModal
        isOpen={showAITools}
        onClose={() => setShowAITools(false)}
        content={selectedContent}
        initialTool={selectedContent || undefined}
      />
    </div>
  );
};

export default Research;
