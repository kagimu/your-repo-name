import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './useCart';
import { useVoiceAssistant } from '@/contexts/VoiceAssistantContext';

export const useVoiceCommands = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { 
    setUserName, 
    lastSearchResults, 
    setLastSearchResults,
    conversationContext,
    setConversationContext
  } = useVoiceAssistant();

  const handleSearch = useCallback((query: string) => {
    // Implement your search logic here
    // This should integrate with your existing search functionality
  }, []);

  const handleAddToCart = useCallback((productId: number) => {
    if (productId) {
      addToCart(productId);
      return true;
    }
    return false;
  }, [addToCart]);

  const handleBudgetQuery = useCallback((budget: number) => {
    // Implement budget-based product suggestions
    // This should integrate with your existing product filtering
  }, []);

  const handleNavigation = useCallback((destination: string) => {
    navigate(destination);
    return true;
  }, [navigate]);

  const handlePersonalization = useCallback((name: string) => {
    setUserName(name);
    return true;
  }, [setUserName]);

  const processCommand = useCallback((command: string) => {
    // Store the command in conversation context
    setConversationContext({
      ...conversationContext,
      lastCommand: command
    });

    // Search commands
    if (command.includes('search for')) {
      const query = command.replace('search for', '').trim();
      return handleSearch(query);
    }

    // Navigation commands
    if (command.includes('show my cart')) {
      return handleNavigation('/cart');
    }
    if (command.includes('checkout')) {
      return handleNavigation('/checkout');
    }

    // Add to cart commands
    if (command.includes('add to cart')) {
      if (command.includes('first one') && lastSearchResults.length > 0) {
        return handleAddToCart(lastSearchResults[0].id);
      }
      // Extract product info from command and add to cart
    }

    // Budget queries
    if (command.includes('what can i buy with')) {
      const budgetMatch = command.match(/\d+/);
      if (budgetMatch) {
        return handleBudgetQuery(parseInt(budgetMatch[0]));
      }
    }

    // Personalization
    if (command.includes('call me')) {
      const name = command.replace('call me', '').trim();
      return handlePersonalization(name);
    }

    return false;
  }, [
    conversationContext,
    handleSearch,
    handleAddToCart,
    handleNavigation,
    handleBudgetQuery,
    handlePersonalization,
    lastSearchResults,
    setConversationContext
  ]);

  return {
    processCommand,
    handleSearch,
    handleAddToCart,
    handleNavigation,
    handleBudgetQuery,
    handlePersonalization
  };
};

export default useVoiceCommands;
