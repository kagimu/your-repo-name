import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Trophy, Brain, Timer, Flag } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface PracticeZoneProps {
  academicLevel: string;
  subject?: string;
}

export const PracticeZone: React.FC<PracticeZoneProps> = ({ academicLevel, subject }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // seconds per question

  // Sample questions based on academic level
  const questions: Question[] = [
    {
      id: '1',
      question: 'What is the primary function of mitochondria in a cell?',
      options: [
        'Energy production',
        'Protein synthesis',
        'Cell division',
        'Waste removal'
      ],
      correctAnswer: 'Energy production',
      explanation: 'Mitochondria are often called the powerhouse of the cell because they generate most of the cell\'s supply of ATP (energy).',
      difficulty: 'medium',
      points: 10
    },
    // Add more questions based on academicLevel and subject
  ];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(score + questions[currentQuestion].points);
    }
    
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(30);
    } else {
      setQuizComplete(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {!quizComplete ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-xl"
        >
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1}/{questions.length}</span>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {questions[currentQuestion].question}
            </h3>
            
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showExplanation}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedAnswer === option
                      ? option === questions[currentQuestion].correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-blue-300'
                  } ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showExplanation && option === selectedAnswer && (
                      option === questions[currentQuestion].correctAnswer
                        ? <Check className="w-5 h-5 text-green-500" />
                        : <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Explanation */}
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200"
            >
              <p className="text-blue-800">
                <span className="font-semibold">Explanation: </span>
                {questions[currentQuestion].explanation}
              </p>
            </motion.div>
          )}

          {/* Next Button */}
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <EdumallButton
                onClick={handleNextQuestion}
                variant="primary"
                className="w-full"
              >
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
              </EdumallButton>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-2xl p-8 shadow-xl"
        >
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
          <p className="text-gray-600 mb-6">
            You scored {score} points
          </p>
          <EdumallButton
            onClick={() => window.location.reload()}
            variant="primary"
          >
            Try Another Quiz
          </EdumallButton>
        </motion.div>
      )}
    </div>
  );
};
