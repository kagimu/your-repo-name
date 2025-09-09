import { NavigateFunction } from 'react-router-dom';

export interface VoiceContext {
  currentPage: string;
  navigate: NavigateFunction;
  searchProducts: (query: Record<string, any>) => Promise<any[]>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  onHelp?: () => Promise<void>;
  currentProduct?: { id: number; name: string; };
}

export interface VoiceIntent {
  name: string;
  patterns: RegExp[];
  slots?: {
    [key: string]: {
      name: string;
      type: string;
      required?: boolean;
      transform?: (value: string) => any;
      validation?: (value: any) => boolean;
    }
  };
  priority?: number;
  contextual?: boolean;
  examples: string[];
  action: (slots: Record<string, any>, context: VoiceContext) => Promise<boolean>;
}

// Match a voice command to an intent
export const matchCommand = (command: string): { intent: VoiceIntent; slots: Record<string, any> } | null => {
  // Clean up the command
  const cleanCommand = command.trim().toLowerCase();

  // Try to match against each intent
  for (const intent of intents) {
    for (const pattern of intent.patterns) {
      const match = cleanCommand.match(pattern);
      if (match) {
        const slots: Record<string, any> = {};

        // Extract capture groups that map to slot names
        if (match.length > 1 && intent.slots) {
          const slotNames = Object.keys(intent.slots);
          for (let i = 1; i < match.length && i <= slotNames.length; i++) {
            const name = slotNames[i - 1];
            const value = match[i];
            const slotDef = intent.slots[name];
            if (slotDef && value) {
              slots[name] = slotDef.transform ?
                slotDef.transform(value) :
                value;
            }
          }
        }

        // Validate the slots
        const invalidSlot = Object.entries(intent.slots || {})
          .find(([name, def]) => 
            def.required && !slots[name] || 
            (slots[name] && def.validation && !def.validation(slots[name]))
          );

        if (!invalidSlot) {
          return { intent, slots };
        }
      }
    }
  }

  // Try fuzzy matching
  const words = cleanCommand.split(/\s+/);
  const similarIntents = intents.filter(intent => 
    intent.examples.some(example => 
      example.toLowerCase().split(/\s+/).some(word => 
        words.includes(word)
      )
    )
  );

  if (similarIntents.length > 0) {
    const bestMatch = similarIntents.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
    return { intent: bestMatch, slots: {} };
  }

  return null;
};

// Define core intents
export const intents: VoiceIntent[] = [
  // Help Intent
  {
    name: 'Help',
    patterns: [
      /^(?:show|display|tell me|what are|give me)?\s*(?:the\s+)?(?:help|commands|available commands|what can you do|what can i say)$/i,
      /^help(?:\s+me)?$/i,
      /^what\s+can\s+(?:you\s+)?do$/i
    ],
    examples: [
      'help',
      'show help',
      'what can you do',
      'what can I say',
      'available commands',
      'tell me what you can do'
    ],
    priority: 1,
    action: async (_, context) => {
      if (context.onHelp) {
        await context.onHelp();
        return true;
      }
      return false;
    }
  },

  // Navigation Intent
  {
    name: 'NavigateHome',
    patterns: [
      /^(?:go|take me|navigate|show|open) (?:to )?home$/i,
      /^(?:show|open) (?:the )?homepage$/i,
      /^(?:return|back) (?:to )?home$/i
    ],
    priority: 1,
    examples: ['go home', 'take me home', 'show homepage', 'back home'],
    action: async (_, { navigate }) => {
      navigate('/');
      return true;
    }
  },

  // Show Products Intent
  {
    name: 'ShowProducts',
    patterns: [
      /^(?:show|display|list|view)\s+(?:me\s+)?(?:all\s+)?(?:the\s+)?(?:products|items)$/i,
      /^(?:what|which)\s+(?:products|items)\s+(?:do\s+you\s+have|are\s+available)$/i,
      /^browse\s+(?:products|items)$/i,
      /^hello$/i,  // Add greeting that shows products
      /^hi$/i      // Add greeting that shows products
    ],
    examples: [
      'show products',
      'show items',
      'display products',
      'what products do you have',
      'hello',
      'hi'
    ],
    priority: 1,
    action: async (_, { searchProducts }) => {
      const results = await searchProducts({ query: '' });  // Empty query to get all products
      return results.length > 0;
    }
  },

  // Search Intent
  {
    name: 'Search',
    patterns: [
      /^search(?:\s+for)?\s+(.+)$/i,
      /^browse(?:\s+for)?\s+(.+)$/i,
      /^find(?:\s+me)?\s+(.+)$/i,
      /^where\s+can\s+i\s+find\s+(.+)$/i,
      /^i\s+need\s+to\s+find\s+(.+)$/i,
      /^looking\s+for\s+(.+)$/i,
      /^(?:show|display|list|view)\s+(?:me\s+)?(.+)$/i
    ],
    slots: {
      query: {
        name: 'query',
        type: 'string',
        required: true,
        transform: (value: string) => value.trim().toLowerCase()
      }
    },
    examples: [
      'search for microscopes',
      'find biology textbooks',
      'looking for lab equipment'
    ],
    priority: 1,
    action: async (slots, { searchProducts }) => {
      const results = await searchProducts({ query: slots.query });
      return results.length > 0;
    }
  },

  // Add to Cart Intent
  {
    name: 'AddToCart',
    patterns: [
      /^add(?:\s+(?:this|that|it))?\s+to\s+(?:my\s+)?cart$/i,
      /^buy(?:\s+(?:this|that|it))?$/i,
      /^purchase(?:\s+(?:this|that|it))?$/i
    ],
    slots: {
      quantity: {
        name: 'quantity',
        type: 'number',
        transform: (value: string) => parseInt(value, 10) || 1
      }
    },
    examples: [
      'add to cart',
      'buy this',
      'purchase it'
    ],
    priority: 2,
    action: async (slots, { currentProduct, addToCart }) => {
      if (!currentProduct?.id) return false;
      await addToCart(currentProduct.id, slots.quantity || 1);
      return true;
    }
  }
];

// Execute an intent
export const executeIntent = async (
  intent: VoiceIntent,
  slots: Record<string, any>,
  context: VoiceContext
): Promise<boolean> => {
  return intent.action(slots, context);
};
