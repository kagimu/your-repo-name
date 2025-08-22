import React, { useState } from 'react';
import { useAIEducation } from '../hooks/useAIEducation';

interface Question {
  id: string;
  question: string;
  options?: string[];
  answer?: string;
  explanation?: string;
}

interface StudyPlan {
  title: string;
  description: string;
  topics: Array<{
    name: string;
    duration: string;
    objectives: string[];
    resources: string[];
  }>;
}


export const StudyAssistant: React.FC = () => {
  const {
    generateQuestions,
    generateStudyPlan,
    solveMathProblem,
    isLoading,
    error,
    aiAvailable
  } = useAIEducation();


  const [questions, setQuestions] = useState<Question[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [mathSolution, setMathSolution] = useState<{
    solution: string;
    steps: string[];
    explanation: string;
  } | null>(null);

  if (!aiAvailable) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>
        <h2>AI features are currently unavailable.</h2>
        <p>Please try again later or contact support if you believe this is an error.</p>
      </div>
    );
  }

  const handleGenerateQuestions = async () => {
    try {
      const newQuestions = await generateQuestions(
        'Mathematics',
        'Algebra',
        'O-Level',
        5
      );
      setQuestions(newQuestions);
    } catch (err) {
      console.error('Failed to generate questions:', err);
    }
  };

  const handleCreateStudyPlan = async () => {
    try {
      const plan = await generateStudyPlan(
        'Mathematics',
        'O-Level',
        '3 months',
        ['Master algebra', 'Understand trigonometry', 'Excel in geometry']
      );
      setStudyPlan(plan);
    } catch (err) {
      console.error('Failed to create study plan:', err);
    }
  };

  const handleSolveMathProblem = async () => {
    try {
      const solution = await solveMathProblem(
        'Solve the equation: 2x + 5 = 13',
        'O-Level'
      );
      setMathSolution(solution);
    } catch (err) {
      console.error('Failed to solve math problem:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Study Assistant</h2>
        
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            {error.message}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleGenerateQuestions}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Generate Practice Questions
          </button>
          
          <button
            onClick={handleCreateStudyPlan}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Create Study Plan
          </button>
          
          <button
            onClick={handleSolveMathProblem}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
          >
            Solve Math Problem
          </button>
        </div>

        {isLoading && (
          <div className="text-center text-gray-600">
            Processing your request...
          </div>
        )}

        {questions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Practice Questions</h3>
            {questions.map((q) => (
              <div key={q.id} className="p-4 bg-white shadow rounded">
                <p className="font-medium">{q.question}</p>
                {q.options && (
                  <ul className="mt-2 space-y-1">
                    {q.options.map((option, idx) => (
                      <li key={idx}>{option}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-2 text-gray-600">
                  <p><strong>Answer:</strong> {q.answer}</p>
                  {q.explanation && (
                    <p><strong>Explanation:</strong> {q.explanation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {studyPlan && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{studyPlan.title}</h3>
            <p>{studyPlan.description}</p>
            <div className="space-y-4">
              {studyPlan.topics.map((topic, idx) => (
                <div key={idx} className="p-4 bg-white shadow rounded">
                  <h4 className="font-medium">{topic.name}</h4>
                  <p className="text-gray-600">Duration: {topic.duration}</p>
                  <div className="mt-2">
                    <strong>Objectives:</strong>
                    <ul className="list-disc list-inside">
                      {topic.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-2">
                    <strong>Resources:</strong>
                    <ul className="list-disc list-inside">
                      {topic.resources.map((res, i) => (
                        <li key={i}>{res}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mathSolution && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Math Solution</h3>
            <div className="p-4 bg-white shadow rounded">
              <p><strong>Solution:</strong> {mathSolution.solution}</p>
              <div className="mt-2">
                <strong>Steps:</strong>
                <ol className="list-decimal list-inside">
                  {mathSolution.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
              <p className="mt-2">
                <strong>Explanation:</strong> {mathSolution.explanation}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
