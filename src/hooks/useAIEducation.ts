import { useState, useCallback } from 'react';
import { aiProviderManager } from '../services/aiProviders';
import { Question, Flashcard, StudyPlan } from '../types/ai';

export const useAIEducation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = useCallback(async (
    subject: string,
    topic: string,
    level: string
  ): Promise<Question[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const questions = await aiProviderManager.generateQuestions(subject, topic, level);
      return questions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate questions';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateFlashcards = useCallback(async (
    subject: string,
    topic: string
  ): Promise<Flashcard[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const flashcards = await aiProviderManager.generateFlashcards(subject, topic);
      return flashcards;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate flashcards';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const solveMathProblem = useCallback(async (
    problem: string
  ): Promise<{
    solution: string;
    steps?: string[];
    visualization?: string;
  }> => {
    setIsLoading(true);
    setError(null);
    try {
      const solution = await aiProviderManager.solveMathProblem(problem);
      return solution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to solve problem';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateStudyPlan = useCallback(async (
    subject: string,
    level: string,
    topics: string[],
    duration: string
  ): Promise<StudyPlan> => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = await aiProviderManager.generateStudyPlan(subject, level, topics, duration);
      return plan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate study plan';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    generateQuestions,
    generateFlashcards,
    solveMathProblem,
    generateStudyPlan,
  };
};
