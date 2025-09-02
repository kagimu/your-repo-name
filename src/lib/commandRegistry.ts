import { 
  VoiceIntent, 
  VoiceContext, 
  patterns
} from './voiceIntents';

// Helper function to }: Promise<boolean> => {
  return intent.action(slots, context);
};

// Match a voice command to an intent and extract slots
export const matchCommand = (command: string): { intent: VoiceIntent; slots: Record<string, any> } | null => {
  // Clean up the command
  const cleanCommand = command.trim().toLowerCase();

  // Try to match against each intent
  for (const intent of intents) {
    for (const pattern of intent.patterns) {
      const match = cleanCommand.match(pattern);
      if (match) {
        const slots: Record<string, any> = {};

        // Extract named groups from regex match
        if (match.groups) {
          // Process each slot according to its definition
          Object.entries(match.groups).forEach(([name, value]) => {
            const slotDef = intent.slots?.[name];
            if (slotDef && value) {
              // Transform the value if a transform function exists
              slots[name] = slotDef.transform ? 
                slotDef.transform(value) : 
                value;
            }
          });
        }

        // Validate extracted slots
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

  // Try to find similar intents for fuzzy matching
  const words = cleanCommand.split(/\s+/);
  const similarIntents = intents.filter(intent => 
    intent.examples.some(example => 
      example.toLowerCase().split(/\s+/).some(word => 
        words.includes(word)
      )
    )
  );

  if (similarIntents.length > 0) {
    // Return the highest priority similar intent
    const bestMatch = similarIntents.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
    return { intent: bestMatch, slots: {} };
  }

  return null;
};ate RegExp patterns
function createPattern(pattern: string): RegExp {
  return new RegExp(pattern, 'i');
}

export const intents: VoiceIntent[] = [
  // Navigation Intents
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
  {
    name: 'NavigateTo',
    patterns: [
      /^(?:go|take me|navigate|show|open) (?:to )?(?:the )?([a-z\s-]+?)$/i,
      /^(?:back|return) (?:to )?(?:the )?([a-z\s-]+?)$/i
    ],
    slots: {
      page: {
        name: 'page',
        type: 'string',
        transform: (value: string) => {
          const pageMap: Record<string, string> = {
            'home': '/',
            'dashboard': '/dashboard',
            'cart': '/cart',
            'profile': '/profile',
            'categories': '/categories',
            'orders': '/orders',
            'account': '/account'
          };
          return pageMap[value.toLowerCase()] || value;
        }
      }
    },
    priority: 1,
    contextual: false,
    examples: [
      'go to dashboard',
      'navigate to cart',
      'show me categories',
      'back to profile',
      'return to orders'
    ],
    action: async (slots, { navigate }) => {
      navigate(slots.page);
      return true;
    }
  },
  {
    name: 'Auth',
    patterns: [
      /^(?:sign|log) (?<action>in|out)$/i,
      /^log(?<action>in|out)$/i,
      /^(?:sign|log) (?<action>in|out)(?: (?:to|from|of) my account)?$/i
    ],
    slots: {
      action: {
        name: 'action',
        type: 'string',
        values: ['in', 'out']
      }
    },
    priority: 1,
    examples: [
      'sign in',
      'login',
      'log in',
      'sign out',
      'logout',
      'log out',
      'sign in to my account',
      'log out of my account'
    ],
    action: async (slots, { user, navigate }) => {
      if (slots.action === 'in' && !user.isAuthenticated) {
        navigate('/login');
      } else if (slots.action === 'out' && user.isAuthenticated) {
        navigate('/logout');
      }
      return true;
    }
  },
  {
    name: 'Search',
    patterns: [
      /^(?:search|find|look) for (?<query>[a-z0-9\s-]+)$/i,
      /^(?:search|browse|find)(?: for)? (?<query>[a-z0-9\s-]+)$/i,
      /^(?:where can i find|i need to find|looking for) (?<query>[a-z0-9\s-]+)$/i,
      'search',
      'browse',
      'find me',
      'where can i find',
      'i need to find',
      'looking for'
    ],
    examples: [
      'search for books',
      'find laptops',
      'show me science kits',
      'display products',
      'show bags',
      'view toads',
      'take me to rats'
    ],
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
    name: 'Filter',
    patterns: [
      /^filter by (?:category )?(?<category>[a-z\s-]+)$/i,
      /^show (?:items|products) in (?<category>[a-z\s-]+)$/i,
      /^(?<category>[a-z\s-]+) (?:products|items)$/i,
      /^(?:show|find) (?:items|products) (?:priced )?(?<priceRange>under|over|between) (?<price>\d+(?:\s*-\s*\d+)?)(?:\s*(?:UGX|shillings?))?$/i,
      /^(?:items?|products?) (?<priceRange>cheaper than|less than|more than|above|below) (?<price>\d+)(?:\s*(?:UGX|shillings?))?$/i
    ],
    slots: {
      category: {
        name: 'category',
        type: 'category',
        transform: (value: string) => value.toLowerCase().trim(),
        validation: (value: string) => value.length >= 2,
        prompts: {
          missing: "Which category would you like to filter by?",
          invalid: "I couldn't find that category. Would you like me to list available categories?"
        }
      },
      priceRange: {
        name: 'priceRange',
        type: 'string',
        values: ['under', 'over', 'between', 'cheaper than', 'less than', 'more than', 'above', 'below'],
        transform: (value: string) => {
          const rangeMap: Record<string, string> = {
            'cheaper than': 'under',
            'less than': 'under',
            'above': 'over',
            'more than': 'over',
            'below': 'under'
          };
          return rangeMap[value] || value;
        }
      },
      price: {
        name: 'price',
        type: 'currency',
        transform: (value: string) => {
          if (value.includes('-')) {
            const [min, max] = value.split('-').map(p => parseInt(p.trim(), 10));
            return { min, max };
          }
          const price = parseInt(value, 10);
          return { min: 0, max: price };
        },
        validation: (value: { min: number, max: number }) => 
          value.min >= 0 && value.max > value.min,
        prompts: {
          invalid: "Please specify a valid price range in UGX (e.g., 'under 50000' or 'between 10000 and 50000')"
        }
      }
    },
    examples: [
      'filter by category books',
      'show items under 50000 UGX',
      'filter by price over 100000 shillings',
      'products between 50000 and 200000',
      'items cheaper than 75000 UGX',
      'show products in stationery',
      'sports equipment items'
    ],
    action: async (slots, { filterProducts }) => {
      const filters: Record<string, any> = {};
      if (slots.category) {
        filters.category = slots.category;
      }
      if (slots.price) {
        filters.priceRange = {
          min: slots.price.min,
          max: slots.price.max
        };
      }
      await filterProducts(filters);
      return true;
    }
  },
  {
    name: 'Checkout',
    patterns: [
      /^(?:proceed to |go to )?checkout$/i,
      /^(?:complete|finish|finalize) (?:my )?(?:order|purchase)$/i
    ],
    examples: [
      'checkout', 
      'proceed to checkout',
      'complete my order',
      'finalize purchase'
    ],
    action: async (_, { navigate, user }) => {
      if (!user.isAuthenticated) {
        navigate('/login?redirect=checkout');
      } else {
        navigate('/checkout');
      }
      return true;
    }
  },
  {
    name: 'ShowCategories',
    patterns: [
      /^(?:show|list|display|what) categories(?: are available)?$/i,
      /^what (?:types of )?(?:items|products) do you have\??$/i
    ],
    examples: [
      'show categories',
      'what categories are available',
      'list categories',
      'what types of items do you have'
    ],
    action: async (_, { navigate }) => {
      navigate('/categories');
      return true;
    }
  },
  {
    name: 'BudgetHelp',
    patterns: [
      /^(?:help me |what can i |show items? )(?:shop|buy) with (?<budget>\d+)(?:\s*(?:UGX|shillings?))?$/i,
      /^what can i get for (?<budget>\d+)(?:\s*(?:UGX|shillings?))?$/i
    ],
    slots: {
      budget: {
        name: 'budget',
        type: 'currency',
        transform: (value: string) => parseInt(value.replace(/[^\d]/g, ''), 10),
        validation: (value: number) => value > 0,
        prompts: {
          missing: "What's your budget in UGX?",
          invalid: "Please specify a valid budget amount in UGX."
        }
      }
    },
    examples: [
      'help me shop with 50000 UGX',
      'what can I buy with 100000 shillings',
      'show items for 75000'
    ],
    action: async (slots, { filterProducts, setState }) => {
      await filterProducts({ maxPrice: slots.budget });
      setState({
        feedback: `Here are items within your budget of ${slots.budget} UGX`
      });
      return true;
    }
  }
];

// Pattern matching and intent resolution
const matchPattern = (text: string, intent: VoiceIntent): { matched: boolean; slots?: Record<string, any> } => {
  for (const pattern of intent.patterns) {
    const match = text.match(pattern);
    if (match) {
      // Extract named groups as slots
      const slots: Record<string, any> = {};
      if (match.groups) {
        Object.entries(match.groups).forEach(([name, value]) => {
          if (intent.slots?.[name]?.transform) {
            slots[name] = intent.slots[name].transform!(value);
          } else {
            slots[name] = value;
          }
        });
      }
      return { matched: true, slots };
    }
  }
  return { matched: false };
};

export const findIntent = (text: string, context: VoiceContext): { intent: VoiceIntent; slots: Record<string, any> } | null => {
  // First try exact pattern matches
  for (const intent of intents) {
    const { matched, slots } = matchPattern(text.toLowerCase(), intent);
    if (matched) {
      // Validate slots if they exist
      if (intent.slots) {
        const isValid = Object.entries(intent.slots).every(([name, config]) => {
          if (!config.required && !slots[name]) return true;
          return !config.validation || config.validation(slots[name]);
        });
        if (!isValid) continue;
      }
      return { intent, slots: slots || {} };
    }
  }

  // No exact match, try fuzzy matching for similar commands
  const similarIntents = intents.filter(intent =>
    intent.examples.some(example =>
      example.toLowerCase().includes(text.toLowerCase()) ||
      text.toLowerCase().includes(example.toLowerCase())
    )
  );

  if (similarIntents.length > 0) {
    // Return the highest priority similar intent
    const bestMatch = similarIntents.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
    return { intent: bestMatch, slots: {} };
  }

  return null;
};

export const executeIntent = async (
  intent: VoiceIntent,
  slots: Record<string, any>,
  context: VoiceContext
): Promise<boolean> => {
  return intent.action(slots, context);
};
