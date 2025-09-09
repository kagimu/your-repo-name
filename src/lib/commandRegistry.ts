import {
  VoiceIntent,
  VoiceContext,
  patterns
} from './voiceIntents';

// Match a voice command to an intent and extract slots
export const matchCommand = (command: string): { intent: VoiceIntent; slots: Record<string, any> } | null => {
  // Clean up the command
  const cleanCommand = command.trim().toLowerCase();
  console.log('[CommandRegistry] Matching command:', cleanCommand);

  // Try to match against each intent
  for (const intent of intents) {
    console.log('[CommandRegistry] Testing intent:', intent.name);
    for (const pattern of intent.patterns) {
      console.log('[CommandRegistry] Testing pattern:', pattern);
      const match = cleanCommand.match(pattern);
      if (match) {
        console.log('[CommandRegistry] Pattern matched:', pattern);
        const slots: Record<string, any> = {};

        // Extract named groups from regex match
        if (match.groups) {
          console.log('[CommandRegistry] Found named groups:', match.groups);
          // Process each slot according to its definition
          Object.entries(match.groups).forEach(([name, value]) => {
            const slotDef = intent.slots?.[name];
            if (slotDef && value) {
              // Transform the value if a transform function exists
              slots[name] = slotDef.transform ? 
                slotDef.transform(value) : 
                value;
              console.log(`[CommandRegistry] Processed slot ${name}:`, slots[name]);
            }
          });
        }

        // Validate extracted slots
        const invalidSlot = Object.entries(intent.slots || {})
          .find(([name, def]) => 
            def.required && !slots[name] || 
            (slots[name] && def.validation && !def.validation(slots[name]))
          );

        if (invalidSlot) {
          console.log('[CommandRegistry] Invalid slot:', invalidSlot[0]);
        } else {
          console.log('[CommandRegistry] All slots valid, returning intent:', intent.name);
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
};

// Create RegExp patterns
function createPattern(pattern: string): RegExp {
 return new RegExp(pattern, 'i');
}

export const intents: VoiceIntent[] = [
  // Help Intent
  {
    name: 'Help',
    patterns: [
      /^(?:show|display|tell me|what are|give me)?\s*(?:the\s+)?(?:help|commands|available commands|what can you do|what can i say)$/i,
      /^help(?:\s+me)?$/i,
      /^what\s+can\s+(?:you\s+)?do$/i
    ],
    priority: 3,
    examples: [
      'help',
      'show help',
      'what can you do',
      'what can I say',
      'available commands',
      'tell me what you can do'
    ],
    action: async (_, { navigate }) => {
      // For now, just navigate to a help page or show help modal
      // This can be enhanced to show a help modal
      return true;
    }
  },

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
    name: 'ShowProducts',
    patterns: [
      /^(?:show|display|list|view)\s+(?:me\s+)?(?:all\s+)?(?:the\s+)?(?:products|items)$/i,
      /^(?:what|which)\s+(?:products|items)\s+(?:do\s+you\s+have|are\s+available)$/i,
      /^browse\s+(?:products|items)$/i,
      /^products?$/i,
      /^items?$/i,
      /^show\s+(?:me\s+)?(?:what\s+)?(?:you\s+)?(?:have|got)$/i,
      /^(?:take|bring)\s+me\s+to\s+(?:the\s+)?(?:products|items)$/i,
      /^open\s+(?:the\s+)?(?:products|items)$/i,
      /^go\s+to\s+(?:the\s+)?(?:products|items)$/i
    ],
    priority: 2,
    examples: [
      'show products',
      'show items', 
      'display products',
      'what products do you have',
      'products',
      'items',
      'show me what you have',
      'take me to products',
      'go to items'
    ],
    action: async (_, { navigate }) => {
      console.log('[VoiceAssistant] Navigating to categories from ShowProducts intent');
      try {
        if (!navigate) {
          console.error('[ShowProducts] Navigation function not available in context');
          return false;
        }
        navigate('/categories');
        console.log('[ShowProducts] Successfully navigated to /categories');
        return true;
      } catch (error) {
        console.error('[ShowProducts] Error during navigation:', error);
        return false;
      }
    }
  },
  {
    name: 'Search',
    patterns: [
      /^(?:search|find|look) for (?<query>[a-z0-9\s-]+)$/i,
      /^(?:search|browse|find)(?: for)? (?<query>[a-z0-9\s-]+)$/i,
      /^(?:where can i find|i need to find|looking for) (?<query>[a-z0-9\s-]+)$/i,
      /^search$/i,
      /^browse$/i,
      /^find me$/i,
      /^where can i find$/i,
      /^i need to find$/i,
      /^looking for$/i
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
        name: 'query',
        type: 'string'
      }
    },
    action: async (slots, { navigate, searchProducts }) => {
      try {
        await searchProducts({ query: slots.query });
      } catch (e) {
        // ignore
      }
      navigate(`/categories?search=${encodeURIComponent(slots.query)}`);
      return true;
    }
  },
  {
    name: 'ShowProductDetail',
    patterns: [
      /^(?:show|open|view|display)\s+(?:the\s+)?(?:product|item)\s+(?<name>[a-z0-9\s\-'"&,.]+)$/i,
      /^(?:tell\s+me\s+about|details?\s+(?:for|of)|what\s+are\s+the\s+details\s+(?:for|of))\s+(?<name>[a-z0-9\s\-'"&,.]+)$/i
    ],
    slots: {
      name: {
        name: 'name',
        type: 'product',
        transform: (value: string) => value.trim().toLowerCase()
      }
    },
    priority: 3,
    examples: [
      'show product ammeter',
      'open item microscope',
      'tell me about microscope',
      'details for ammeter'
    ],
    action: async (slots, { navigate }) => {
      const q = (slots.name || '').toString();
      navigate(`/categories?search=${encodeURIComponent(q)}&open=1`);
      return true;
    }
  },
  {
    name: 'AddToCartByName',
    patterns: [
      /^(?:add|put|place)\s+(?:an?\s+)?(?<name>[a-z0-9\s\-'"&,.]+)\s+(?:to|into)\s+(?:my\s+)?cart$/i,
      /^(?:buy|purchase)\s+(?:an?\s+)?(?<name>[a-z0-9\s\-'"&,.]+)$/i
    ],
    slots: {
      name: {
        name: 'name',
        type: 'product',
        transform: (value: string) => value.trim().toLowerCase()
      }
    },
    priority: 4,
    examples: [
      'add ammeter to cart',
      'put microscope into cart',
      'buy microscope',
      'purchase ammeter'
    ],
    action: async (slots, { searchProducts, addToCart, navigate }) => {
      const q = (slots.name || '').toString();
      try {
        const results = await searchProducts({ query: q });
        if (Array.isArray(results) && results.length > 0) {
          const product = results[0];
          if (product?.id != null) {
            await addToCart(product.id, 1);
            return true;
          }
        }
      } catch (e) {
        // ignore and fallback to navigation
      }
      // Fallback: navigate to categories with the search applied so user can add manually
      navigate(`/categories?search=${encodeURIComponent(q)}`);
      return false;
    }
  },
  {
    name: 'addToCart',
    patterns: [/add to cart/i, /buy/i, /purchase/i],
    examples: ['add to cart', 'buy this item', 'add first one to cart'],
    slots: {
      item: {
        name: 'item',
        type: 'string'
      }
    },
    action: async (slots, { currentProduct, addToCart }) => {
      if (!currentProduct?.id) return false;
      await addToCart(currentProduct.id, 1);
      return true;
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
    action: async (slots, { filterProducts }) => {
      await filterProducts({ maxPrice: slots.budget });
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
  console.log('[CommandRegistry] Executing intent:', {
    name: intent.name,
    slots: slots,
    hasNavigate: !!context.navigate
  });
  
  try {
    const result = await intent.action(slots, context);
    console.log('[CommandRegistry] Intent execution result:', result);
    return result;
  } catch (error) {
    console.error('[CommandRegistry] Error executing intent:', error);
    return false;
  }
};
