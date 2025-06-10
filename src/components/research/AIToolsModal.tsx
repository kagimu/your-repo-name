
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Search, FileText, Lightbulb } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';

interface AIToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTool?: string;
  content?: string;
}

export const AIToolsModal: React.FC<AIToolsModalProps> = ({ 
  isOpen, 
  onClose, 
  initialTool = 'summarize',
  content = ''
}) => {
  const [selectedTool, setSelectedTool] = useState(initialTool);
  const [input, setInput] = useState(content);
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const tools = [
    { id: 'summarize', label: 'Summarize', icon: FileText, description: 'Get a concise summary' },
    { id: 'research', label: 'Research', icon: Search, description: 'Deep research assistance' },
    { id: 'analyze', label: 'Analyze', icon: Brain, description: 'Analyze and breakdown' },
    { id: 'ideas', label: 'Generate Ideas', icon: Lightbulb, description: 'Brainstorm new ideas' }
  ];

  const handleProcess = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      let result = '';
      switch (selectedTool) {
        case 'summarize':
          result = `Summary: ${input.substring(0, 200)}... This content discusses key educational concepts and methodologies relevant to modern learning environments.`;
          break;
        case 'research':
          result = `Research findings: Based on the content provided, here are related academic sources and research papers that expand on these topics...`;
          break;
        case 'analyze':
          result = `Analysis: The content can be broken down into three main components: 1) Core concepts, 2) Practical applications, 3) Educational implications...`;
          break;
        case 'ideas':
          result = `Generated ideas: 1) Create interactive learning modules, 2) Develop assessment frameworks, 3) Design collaborative projects...`;
          break;
        default:
          result = 'Processing complete. Results will appear here.';
      }
      setOutput(result);
      setIsProcessing(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Brain className="mr-3 text-teal-600" size={28} />
              AI Research Tools
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          {/* Tool Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedTool === tool.id
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Icon size={24} className="mx-auto mb-2" />
                  <p className="font-medium text-sm">{tool.label}</p>
                  <p className="text-xs opacity-70">{tool.description}</p>
                </button>
              );
            })}
          </div>

          {/* Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content to Process
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text, paste content, or describe what you need help with..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
            />
          </div>

          {/* Process Button */}
          <div className="mb-6">
            <EdumallButton
              onClick={handleProcess}
              disabled={!input.trim() || isProcessing}
              variant="primary"
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
            >
              {isProcessing ? 'Processing...' : `${tools.find(t => t.id === selectedTool)?.label} Content`}
            </EdumallButton>
          </div>

          {/* Output Section */}
          {(output || isProcessing) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Results
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-32">
                {isProcessing ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    <span className="ml-3 text-gray-600">AI is processing your content...</span>
                  </div>
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">{output}</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
