// Voice Assistant Types and Context Management
interface VoiceSlot {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'currency' | 'date' | 'category' | 'product';
  values?: string[];
  required?: boolean;
  fallback?: any;
  validation?: (value: any) => boolean;
  transform?: (value: string, context?: VoiceContext) => any;
  synonyms?: string[];
  contextual?: boolean;
  dependencies?: string[];
  prompts?: {
    missing?: string;
    invalid?: string;
  };
}

interface VoiceContext {
  currentPage: string;
  lastCommand?: string;
  lastResult?: any;
  currentProduct?: {
    id: number;
    name: string;
    price: number;
    category: string;
  };
  currentCategory?: {
    id: number;
    name: string;
  };
  searchResults?: Array<{
    id: number;
    name: string;
    category: string;
  }>;
  voiceState: {
    isListening: boolean;
    isProcessing: boolean;
    isSpeaking: boolean;
    lastUtterance?: string;
    error?: string;
  };
  navigate: NavigateFunction;
  actions: {
    addToCart: (productId: number, quantity?: number) => Promise<void>;
    searchProducts: (query: string) => Promise<any[]>;
    filterProducts: (filters: Record<string, any>) => void;
    speak: (text: string, options?: SpeechSynthesisUtterance) => Promise<void>;
  };
  user?: {
    isAuthenticated: boolean;
    name?: string;
    id?: string;
    email?: string;
  };
  lastInteraction: {
    timestamp: number;
    type: 'search' | 'filter' | 'navigation' | 'cart' | 'auth';
    data?: any;
  };
  confidence: number;
}

// Speech Recognition Enhancements
const createGrammarList = (context: VoiceContext): string => {
  const commands = [
    // Navigation commands
    'go to', 'show me', 'open', 'navigate to',
    // Product commands
    'search for', 'find', 'add to cart', 'remove from cart',
    // Filter commands
    'filter by', 'sort by', 'show only',
    // Cart commands
    'checkout', 'view cart', 'clear cart',
    // Auth commands
    'sign in', 'log out', 'show profile'
  ];

  // Add dynamic content from context
  if (context.searchResults) {
    commands.push(...context.searchResults.map(p => p.name));
  }
  if (context.currentProduct) {
    commands.push(context.currentProduct.name);
  }
  if (context.currentCategory) {
    commands.push(context.currentCategory.name);
  }

  return `#JSGF V1.0;
    grammar commands;
    public <command> = ${commands.join(' | ')};
  `;
};

// Enhanced Intent Matching
export const findBestMatch = (
  utterance: string,
  context: VoiceContext,
  intents: VoiceIntent[]
): { intent: VoiceIntent; slots: Record<string, any>; confidence: number } | null => {
  let bestMatch = null;
  let highestConfidence = 0;

  for (const intent of intents) {
    // Skip contextual intents if context doesn't match
    if (intent.contextual && !isContextValid(intent, context)) {
      continue;
    }

    for (const pattern of intent.patterns) {
      const match = pattern.exec(utterance);
      if (!match) continue;

      const slots = extractAndValidateSlots(match, intent.slots || {}, context);
      if (!slots) continue;

      const confidence = calculateMatchConfidence(
        match[0],
        utterance,
        intent,
        context,
        slots
      );

      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        bestMatch = { intent, slots, confidence };
      }
    }
  }

  return bestMatch;
};

const isContextValid = (intent: VoiceIntent, context: VoiceContext): boolean => {
  switch (intent.name) {
    case 'AddToCart':
      return !!context.currentProduct || !!context.searchResults?.length;
    case 'ApplyFilter':
      return context.currentPage.includes('products') || context.currentPage.includes('categories');
    case 'Checkout':
      return context.currentPage === '/cart';
    default:
      return true;
  }
};

const extractAndValidateSlots = (
  match: RegExpExecArray,
  slotDefinitions: Record<string, VoiceSlot>,
  context: VoiceContext
): Record<string, any> | null => {
  const slots: Record<string, any> = {};

  for (const [name, slot] of Object.entries(slotDefinitions)) {
    let value = match.groups?.[name];

    // Try to fill from context if missing
    if (!value && slot.contextual) {
      value = getSlotFromContext(name, slot, context);
    }

    // Apply transformation
    if (value && slot.transform) {
      value = slot.transform(value, context);
    }

    // Validate
    if (slot.required && !value) return null;
    if (value && slot.validation && !slot.validation(value)) return null;

    slots[name] = value ?? slot.fallback;
  }

  return slots;
};

const getSlotFromContext = (
  name: string,
  slot: VoiceSlot,
  context: VoiceContext
): string | undefined => {
  switch (name) {
    case 'productName':
      return context.currentProduct?.name;
    case 'category':
      return context.currentCategory?.name;
    case 'quantity':
      return '1';
    default:
      return undefined;
  }
};

const calculateMatchConfidence = (
  matched: string,
  original: string,
  intent: VoiceIntent,
  context: VoiceContext,
  slots: Record<string, any>
): number => {
  let confidence = matched.length / original.length;

  // Boost confidence based on various factors
  if (intent.priority) {
    confidence *= (1 + intent.priority * 0.1);
  }

  // Context relevance boost
  if (intent.contextual && isContextValid(intent, context)) {
    confidence *= 1.2;
  }

  // Slot completeness boost
  const requiredSlots = Object.values(intent.slots || {})
    .filter(slot => slot.required).length;
  const filledRequiredSlots = Object.values(slots)
    .filter(value => value !== undefined).length;
  
  if (requiredSlots > 0) {
    confidence *= filledRequiredSlots / requiredSlots;
  }

  // Recent interaction boost
  if (context.lastInteraction) {
    const timeSinceLastInteraction = Date.now() - context.lastInteraction.timestamp;
    if (timeSinceLastInteraction < 5000) { // Within 5 seconds
      confidence *= 1.1;
    }
  }

  return Math.min(confidence, 1);
};

export const generateVoiceResponse = (
  intent: VoiceIntent,
  slots: Record<string, any>,
  success: boolean
): string => {
  if (!success) {
    return intent.slots?.[Object.keys(slots)[0]]?.prompts?.invalid || 
           "I couldn't complete that action. Could you try again?";
  }

  switch (intent.name) {
    case 'AddToCart':
      return `Added ${slots.quantity || 1} ${slots.productName || 'item(s)'} to your cart.`;
    case 'SearchProducts':
      return `Searching for ${slots.query || 'products'}...`;
    case 'ApplyFilter':
      return `Filtering products by ${slots.filterType}: ${slots.filterValue}`;
    case 'NavigateToPage':
      return `Taking you to ${slots.pageName}`;
    default:
      return "Done!";
  }
};
