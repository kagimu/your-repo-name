import Fuse from 'fuse.js';
import { CommandIntent } from '@/types/speech';

const commandRegistry: CommandIntent[] = [
  {
    name: 'search',
    patterns: ['search for', 'find', 'look for', 'show me'],
    examples: ['search for books', 'find laptops', 'show me science kits'],
    slots: {
      query: {
        type: 'string'
      }
    }
  },
  {
    name: 'addToCart',
    patterns: ['add to cart', 'buy', 'purchase'],
    examples: ['add to cart', 'buy this item', 'add first one to cart'],
    slots: {
      item: {
        type: 'string'
      }
    }
  },
  {
    name: 'filter',
    patterns: ['filter by', 'show items in', 'show products in'],
    examples: ['filter by category books', 'show items under $50', 'filter by price over 100'],
    slots: {
      category: {
        type: 'string'
      },
      maxPrice: {
        type: 'number'
      },
      minPrice: {
        type: 'number'
      }
    }
  },
  {
    name: 'checkout',
    patterns: ['checkout', 'proceed to checkout', 'go to checkout'],
    examples: ['checkout', 'proceed to checkout'],
  },
  {
    name: 'showCategories',
    patterns: ['show categories', 'list categories', 'what categories'],
    examples: ['show categories', 'what categories are available'],
  },
  {
    name: 'budgetHelp',
    patterns: ['help me shop with', 'what can i buy with', 'show items for'],
    examples: ['help me shop with $100', 'what can I buy with 50 dollars'],
    slots: {
      budget: {
        type: 'number'
      }
    }
  }
];

// Initialize Fuse for fuzzy matching
const fuse = new Fuse(commandRegistry, {
  keys: ['patterns', 'examples'],
  includeScore: true,
  threshold: 0.4,
  ignoreLocation: true
});

// Parse number values from text
const extractNumber = (text: string): number | null => {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0]) : null;
};

// Extract slot values based on command type
const extractSlots = (command: string, intent: CommandIntent) => {
  const slots: Record<string, any> = {};

  if (!intent.slots) return slots;

  Object.entries(intent.slots).forEach(([slotName, config]) => {
    if (config.type === 'number') {
      slots[slotName] = extractNumber(command);
    } else {
      // For string slots, extract text after the command pattern
      const pattern = intent.patterns.find(p => command.includes(p));
      if (pattern) {
        slots[slotName] = command.split(pattern)[1]?.trim() || '';
      }
    }
  });

  return slots;
};

export const matchCommand = (text: string) => {
  const results = fuse.search(text.toLowerCase());
  
  if (results.length === 0) return null;

  const bestMatch = results[0];
  if (!bestMatch || !bestMatch.item) return null;

  const slots = extractSlots(text, bestMatch.item);
  
  return {
    intent: bestMatch.item.name,
    confidence: 1 - (bestMatch.score || 0),
    slots
  };
};

export const getExamplesForIntent = (intent: string) => {
  const command = commandRegistry.find(cmd => cmd.name === intent);
  return command?.examples || [];
};

export default commandRegistry;
