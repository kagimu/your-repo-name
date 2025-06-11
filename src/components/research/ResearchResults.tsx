import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Star, Calendar } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';

interface ResearchResult {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  journal: string;
  year: number;
  citations: number;
  downloadUrl: string;
  relevanceScore: number;
}

interface ResearchResultsProps {
  query: string;
  results: ResearchResult[];
  isLoading: boolean;
  onViewFullText?: (content: string) => void;
  onSaveToLibrary?: (result: ResearchResult) => void;
}

export const ResearchResults: React.FC<ResearchResultsProps> = ({ query, results, isLoading, onViewFullText, onSaveToLibrary }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200/50 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
        <p className="text-gray-600">Try adjusting your search terms or explore suggested topics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          Research Results for "{query}" ({results.length} found)
        </h3>
      </div>
      
      <div className="space-y-4">
        {results.map((result, index) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                  {result.title}
                </h4>
                <p className="text-sm text-blue-600 mb-2">
                  {result.authors.join(', ')}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {result.year}
                  </span>
                  <span>{result.journal}</span>
                  <span className="flex items-center">
                    <Star size={14} className="mr-1" />
                    {result.citations} citations
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  result.relevanceScore >= 0.8 ? 'bg-green-100 text-green-700' :
                  result.relevanceScore >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {Math.round(result.relevanceScore * 100)}% match
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 text-sm leading-relaxed">
              {result.abstract}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <EdumallButton variant="primary" size="sm" onClick={() => onViewFullText && onViewFullText(result.abstract)}>
                  <FileText size={16} className="mr-2" />
                  View Full Text
                </EdumallButton>
                <EdumallButton variant="ghost" size="sm">
                  <Download size={16} className="mr-2" />
                  Download PDF
                </EdumallButton>
              </div>
              <EdumallButton variant="ghost" size="sm" onClick={() => onSaveToLibrary && onSaveToLibrary(result)}>
                Save to Library
              </EdumallButton>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
