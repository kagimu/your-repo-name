import { NavigateFunction } from 'react-router-dom';
import { educationIntents } from './educationIntents';
import { labEquipmentIntents } from './labEquipmentIntents';
import { 
  SUBJECTS, 
  EDUCATION_LEVELS, 
  LAB_EQUIPMENT, 
  LAB_CATEGORIES 
} from './constants';

// Core interfaces
export interface VoiceSlot {
  /** Name of the slot */
  name: string;
  /** Type of the value */
  type: 'string' | 'number' | 'boolean' | 'currency' | 'date' | 'category' | 'product';
  /** Valid values for enumerated slots */
  values?: string[];
  /** Whether this slot must be filled */
  required?: boolean;
  /** Default value if not provided */
  fallback?: any;
  /** Validation function */
  validation?: (value: any) => boolean;
  /** Transform raw input to slot value */
  transform?: (value: string, context?: VoiceContext) => any;
  /** Alternative terms for this slot */
  synonyms?: string[];
  /** Whether this slot can use context */
  contextual?: boolean;
  /** Slots that must be filled first */
  dependencies?: string[];
  /** User prompts */
  prompts?: {
    /** When slot is missing */
    missing?: string;
    /** When value is invalid */
    invalid?: string;
  };
}

export interface VoiceIntent {
  name: string;
  patterns: RegExp[];
  slots?: Record<string, VoiceSlot>;
  priority?: number;
  contextual?: boolean;  // Whether this intent requires specific page/state context
  examples: string[];    // For help and documentation
  action: (slots: Record<string, any>, context: VoiceContext) => Promise<boolean>;
}

export interface VoiceContext {
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
  navigate: NavigateFunction;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  searchProducts: (query: Record<string, any>) => Promise<any[]>;
  filterProducts: (filters: Record<string, any>) => void;
  getProductSpecifications?: (query: Record<string, any>) => Promise<any>;
  getLabRecommendations?: (query: Record<string, any>) => Promise<any[]>;
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

// Response type definition
export interface VoiceResponse {
  text: string;
  ssml?: string;
  visualHints?: {
    highlight?: string[];
    focus?: string;
    show?: string[];
    hide?: string[];
  };
  actions?: Array<{
    type: string;
    payload: any;
  }>;
}

// Utility function exports
// Type definitions
interface RegexUtils {
  optional: (pattern: string) => string;
  oneOf: (...patterns: string[]) => string;
  capture: (name: string, pattern: string) => string;
  repeated: (pattern: string, min?: number, max?: number) => string;
  followedBy: (...patterns: string[]) => string;
  prefixedBy: (prefix: string, pattern: string) => string;
  product: string;
}

// Common RegExp patterns and utilities
const regexUtils: RegexUtils = {
  optional: (pattern: string) => `(?:${pattern})?`,
  oneOf: (...patterns: string[]) => `(?:${patterns.join('|')})`,
  capture: (name: string, pattern: string) => `(?<${name}>${pattern})`,
  repeated: (pattern: string, min = 0, max?: number) => 
    `(?:${pattern}){${min},${max || ''}}`,
  followedBy: (...patterns: string[]) => patterns.join('\\s+'),
  prefixedBy: (prefix: string, pattern: string) => 
    `${prefix}\\s+${pattern}`,
  product: '[\\w\\s-\'",]+?'
};

// Extract needed regex utilities
const { 
  oneOf, 
  capture, 
  product: productPattern,
  optional,
  repeated,
  followedBy,
  prefixedBy
} = regexUtils;

// Base patterns
// Define pattern interface
interface VoicePatterns {
  number: string;
  currency: string;
  quantity: string;
  date: string;
  time: string;
  category: string;
  navigation: string[];
  search: string[];
  cart: string[];
  filter: string[];
  articles: string[];
  prepositions: string[];
  education: {
    verbs: string[];
    resources: string[];
    subjects: readonly string[];
    levels: readonly string[];
  };
  lab: {
    verbs: string[];
    equipment: readonly string[];
    categories: readonly string[];
  };
}

// Common pattern collections
export const patterns: VoicePatterns = {
  // Common patterns
  number: '\\d+(?:\\.\\d+)?',
  currency: `\\$?\\d+(?:\\.\\d+)?`,
  quantity: '(?:\\d+(?:\\.\\d+)?|a|an|one|two|three|four|five|six|seven|eight|nine|ten)',
  date: '(?:\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4}|today|tomorrow|next week)',
  time: '\\d{1,2}(?::\\d{2})?(?:am|pm)?',
  category: '[\\w\\s&-]+',

  // Action verbs
  navigation: ['go', 'take me', 'navigate', 'show', 'open', 'view', 'display'],
  search: ['search', 'find', 'look for', 'show me'],
  cart: ['add', 'put', 'place', 'remove', 'delete'],
  filter: ['filter', 'sort', 'show only', 'display only'],

  // Common words
  articles: ['the', 'a', 'an', 'some', 'this', 'that'],
  prepositions: ['to', 'from', 'in', 'on', 'at', 'by'],

  // Education patterns
  education: {
    verbs: ['study', 'learn', 'practice', 'review', 'teach'],
    resources: ['textbook', 'note', 'tutorial', 'guide', 'paper', 'exam'],
    subjects: SUBJECTS,
    levels: EDUCATION_LEVELS
  },

  // Lab patterns
  lab: {
    verbs: ['experiment', 'measure', 'analyze', 'test', 'observe'],
    equipment: LAB_EQUIPMENT,
    categories: LAB_CATEGORIES
  }
};
} as const;

// Combined intents
export const intents = [...educationIntents, ...labEquipmentIntents];

// Common slot types for voice intents
export const slots: Record<string, VoiceSlot> = {
  subject: {
    name: 'subject',
    type: 'string',
    values: ['mathematics', 'physics', 'chemistry', 'biology', 'english', 'literature', 'history', 'geography'],
    transform: (value: string) => value.toLowerCase().trim(),
    validation: (value: string) => value.length >= 2,
    prompts: {
      missing: "Which subject are you interested in?",
      invalid: "I don't recognize that subject. Would you like me to list available subjects?"
    }
  },
  level: {
    name: 'level',
    type: 'string',
    values: ['primary', 'secondary', 'university', 'vocational'],
    transform: (value: string) => value.toLowerCase().trim(),
    validation: (value: string) => ['primary', 'secondary', 'university', 'vocational'].includes(value),
    prompts: {
      missing: "Which education level?",
      invalid: "Please specify: primary, secondary, university, or vocational"
    }
  },
  examBoard: {
    name: 'examBoard',
    type: 'string',
    values: ['UNEB', 'Cambridge', 'Edexcel'],
    transform: (value: string) => value.toUpperCase().trim(),
    validation: (value: string) => ['UNEB', 'CAMBRIDGE', 'EDEXCEL'].includes(value.toUpperCase()),
    prompts: {
      missing: "Which exam board?",
      invalid: "Please specify: UNEB, Cambridge, or Edexcel"
    }
  },
  resourceType: {
    name: 'resourceType',
    type: 'string',
    values: ['textbook', 'notes', 'past papers', 'tutorial', 'practical guide'],
    transform: (value: string) => value.toLowerCase().trim(),
    validation: (value: string) => value.length >= 2,
    prompts: {
      missing: "What type of resource are you looking for?",
      invalid: "Please specify the type of educational resource you need"
    }
  }
};

// Equipment-specific slot types
export const equipmentSlots: Record<string, VoiceSlot> = {
  equipmentType: {
    name: 'equipmentType',
    type: 'string',
    values: ['microscope', 'beaker', 'chemical', 'specimen', 'safety gear', 'measuring tool'],
    transform: (value: string) => value.toLowerCase().trim(),
    validation: (value: string) => value.length >= 2,
    prompts: {
      missing: "What type of equipment are you looking for?",
      invalid: "I don't recognize that equipment type. Would you like me to list available categories?"
    }
  },
  precision: {
    name: 'precision',
    type: 'string',
    values: ['high', 'standard', 'basic'],
    transform: (value: string) => value.toLowerCase().trim(),
    validation: (value: string) => ['high', 'standard', 'basic'].includes(value),
    prompts: {
      missing: "What precision level do you need?",
      invalid: "Please specify: high, standard, or basic precision"
    }
  },
  experimentType: {
    name: 'experimentType',
    type: 'string',
    values: ['dissection', 'chemical reaction', 'measurement', 'observation'],
    transform: (value: string) => value.toLowerCase().trim(),
    contextual: true,
    prompts: {
      missing: "What type of experiment is this for?",
      invalid: "Could you specify the type of experiment you're planning?"
    }
  },
  maintenanceType: {
    name: 'maintenanceType',
    type: 'string',
    values: ['cleaning', 'calibration', 'storage', 'repair'],
    transform: (value: string) => value.toLowerCase().trim(),
    prompts: {
      missing: "What kind of maintenance information do you need?",
      invalid: "Please specify: cleaning, calibration, storage, or repair"
    }
  }
};

// Comprehensive slot definitions
export const commonSlots: Record<string, VoiceSlot> = {
  productName: {
    name: 'productName',
    type: 'product',
    transform: (value: string) => value.toLowerCase().trim(),
    validation: (value: string) => value.length >= 2,
    contextual: true,
    prompts: {
      missing: "Which product are you interested in?",
      invalid: "I couldn't find that product. Could you try describing it differently?"
    }
  },
  quantity: {
    name: 'quantity',
    type: 'number',
    transform: (value: string) => {
      const numberWords: Record<string, number> = {
        'a': 1, 'an': 1, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
        'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
      };
      return numberWords[value.toLowerCase()] || parseInt(value, 10);
    },
    fallback: 1,
    validation: (value: number) => value > 0 && value <= 99,
    prompts: {
      invalid: "Please specify a quantity between 1 and 99."
    }
  },
  category: {
    name: 'category',
    type: 'category',
    transform: (value: string) => value.toLowerCase().trim(),
    contextual: true,
    prompts: {
      missing: "Which category would you like to browse?",
      invalid: "I couldn't find that category. Would you like me to list available categories?"
    }
  },
  priceRange: {
    name: 'priceRange',
    type: 'currency',
    transform: (value: string) => {
      const [min, max] = value.split('-').map(v => parseFloat(v.replace('$', '')));
      return { min, max: max || Infinity };
    },
    validation: (value: { min: number, max: number }) => value.min <= value.max,
    prompts: {
      invalid: "Please specify a valid price range, for example '$10 to $50'."
    }
  },
  sortOrder: {
    name: 'sortOrder',
    type: 'string',
    values: ['price low to high', 'price high to low', 'newest', 'popular', 'rating'],
    transform: (value: string) => value.toLowerCase(),
    synonyms: [
      'cheapest first', 'lowest price', 'least expensive',
      'most expensive first', 'highest price',
      'latest', 'recent', 'new arrivals',
      'best selling', 'top rated', 'trending'
    ]
  }
}};

// Define command pattern interface
interface CommandPatterns {
  educationCommands: string;
  equipmentCommands: string;
  showMe: string;
  findMe: string;
  searchFor: string;
  lookFor: string;
  addTo: string;
  goTo: string;
  takeMeTo: string;
  openThe: string;
  labCommands: string;
  viewProduct: string;
  cartCommands: string;
  filterCommands: string;
  purchaseTypeCommands: string;
  authCommands: string;
  checkoutCommands: string;
}

// Export voice command patterns
export const commandPatterns: CommandPatterns = {
  // Education-specific patterns
  educationCommands: oneOf(
    'show\\s+(?:me\\s+)?(?:the\\s+)?(?:available\\s+)?(?:study\\s+)?materials?',
    'find\\s+(?:study\\s+)?materials?\\s+for\\s+(?<subject>[\\w\\s]+)',
    'what\\s+(?:do\\s+)?you\\s+have\\s+for\\s+(?<subject>[\\w\\s]+)\\s+(?:class|course|study)',
    'search\\s+(?:for\\s+)?(?<level>primary|secondary|university)\\s+(?:materials?|resources?)',
    'show\\s+(?:me\\s+)?(?:the\\s+)?(?<type>textbooks|notes|past\\s+papers|tutorials)\\s+(?:for\\s+)?(?<subject>[\\w\\s]+)?',
    'find\\s+(?<examBoard>UNEB|Cambridge|Edexcel)\\s+(?:past\\s+)?papers?',
    'what\\s+(?:educational\\s+)?resources?\\s+(?:do\\s+)?you\\s+have',
    'list\\s+(?:all\\s+)?(?<category>lab|practical|theory)\\s+materials?',
    'show\\s+(?:me\\s+)?(?:the\\s+)?curriculum\\s+for\\s+(?<level>[\\w\\s]+)',
    'find\\s+(?:study\\s+)?guides?\\s+for\\s+(?<subject>[\\w\\s]+)'
  ),

  // Scientific equipment patterns
  equipmentCommands: oneOf(
    'show\\s+(?:me\\s+)?(?:the\\s+)?(?:available\\s+)?(?<type>lab|measurement|safety|dissection)\\s+equipment',
    'what\\s+(?<type>microscopes|beakers|chemicals|specimens|tools)\\s+(?:do\\s+)?you\\s+have',
    'find\\s+(?<precision>high|standard)\\s+precision\\s+(?<type>[\\w\\s]+)\\s+equipment',
    'show\\s+(?:me\\s+)?(?:the\\s+)?specifications?\\s+(?:for\\s+)?(?<equipment>[\\w\\s]+)',
    'list\\s+(?:all\\s+)?(?<category>biology|chemistry|physics)\\s+equipment',
    'what\\s+(?:safety\\s+)?gear\\s+(?:do\\s+I\\s+)?need\\s+for\\s+(?<experiment>[\\w\\s]+)',
    'find\\s+compatible\\s+(?:equipment|tools)\\s+for\\s+(?<equipment>[\\w\\s]+)',
    'show\\s+maintenance\\s+(?:info|guide)\\s+for\\s+(?<equipment>[\\w\\s]+)',
    'calibration\\s+(?:guide|instructions?)\\s+for\\s+(?<equipment>[\\w\\s]+)',
    'how\\s+to\\s+use\\s+(?:the\\s+)?(?<equipment>[\\w\\s]+)'
  ),

  // Navigation patterns
  showMe: 'show\\s+(?:me\\s+)?',
  findMe: 'find\\s+(?:me\\s+)?',
  searchFor: 'search\\s+(?:for\\s+)?',
  lookFor: 'look\\s+(?:for\\s+)?',
  addTo: 'add\\s+(?:to\\s+)?(?:my\\s+)?(?:the\\s+)?',
  goTo: 'go\\s+(?:to\\s+)?',
  takeMeTo: 'take\\s+(?:me\\s+)?(?:to\\s+)?',
  openThe: 'open\\s+(?:the\\s+)?',
  
  // Lab-specific patterns
  labCommands: oneOf(
    'show\\s+lab\\s+items?',
    'list\\s+specimens?',
    'show\\s+chemicals?',
    'show\\s+apparatus',
    'check\\s+stock\\s+(?:level|status)',
    'what\\s+specimens?\\s+(?:do\\s+)?(?:we|you)\\s+have'
  ),
  
  // Product browsing patterns
  viewProduct: oneOf(
    'show\\s+(?:me\\s+)?(?:more\\s+)?(?:details?\\s+)?(?:about\\s+)?',
    'tell\\s+(?:me\\s+)?(?:more\\s+)?(?:about\\s+)?',
    'what\\s+(?:are|is)\\s+the\\s+(?:details?|specs?|specifications?)\\s+(?:of|for|about)?',
    'open\\s+(?:the\\s+)?(?:product|item)\\s+(?:details?|page)?\\s+(?:for|of)?'
  ),
  
  // Shopping cart patterns
  cartCommands: oneOf(
    'add\\s+(?:this|that|it)\\s+to\\s+(?:my\\s+)?cart',
    'remove\\s+(?:this|that|it)\\s+from\\s+(?:my\\s+)?cart',
    'update\\s+(?:the\\s+)?quantity',
    'change\\s+(?:the\\s+)?quantity',
    'increase\\s+(?:the\\s+)?quantity',
    'decrease\\s+(?:the\\s+)?quantity',
    'make\\s+it\\s+(?<quantity>\\d+)',
    'set\\s+quantity\\s+to\\s+(?<quantity>\\d+)',
    'clear\\s+(?:my\\s+)?cart',
    'empty\\s+(?:my\\s+)?cart'
  ),

  // Filter and sort patterns
  filterCommands: oneOf(
    'filter\\s+by\\s+(?<filterType>price|category|availability|rating)',
    'sort\\s+by\\s+(?<sortType>price|name|popularity|rating)\\s+(?<sortOrder>asc(?:ending)?|desc(?:ending)?)',
    'show\\s+(?:only\\s+)?(?<category>lab|education|sports|library|stationery)\\s+items?',
    'show\\s+(?:items?\\s+)?(?:between|from)\\s+(?<minPrice>\\d+)\\s+(?:to|and)\\s+(?<maxPrice>\\d+)',
    'show\\s+(?:only\\s+)?in\\s+stock\\s+items?',
    'hide\\s+out\\s+of\\s+stock\\s+items?'
  ),

  // Purchase type patterns
  purchaseTypeCommands: oneOf(
    'show\\s+(?:items?\\s+)?(?:for\\s+)?(?<purchaseType>purchase|hire)',
    'filter\\s+by\\s+(?<purchaseType>purchase|hire)',
    'show\\s+(?:only\\s+)?(?<purchaseType>purchase|hire)\\s+items?'
  ),

  // Authentication patterns
  authCommands: oneOf(
    'sign\\s+(?:me\\s+)?in',
    'log\\s+(?:me\\s+)?in',
    'sign\\s+(?:me\\s+)?out',
    'log\\s+(?:me\\s+)?out',
    'show\\s+(?:my\\s+)?profile',
    'open\\s+(?:my\\s+)?account'
  ),

  // Checkout patterns
  checkoutCommands: oneOf(
    'proceed\\s+to\\s+checkout',
    'start\\s+checkout',
    'check\\s+out\\s+(?:now)?',
    'complete\\s+(?:my\\s+)?purchase',
    'finish\\s+(?:my\\s+)?order',
    'place\\s+(?:my\\s+)?order'
  )
} as const;

// Utility function to create product search pattern
export const createSearchPattern = (prefix: string) => 
  new RegExp(`^${prefix}${capture('query', productPattern)}$`, 'i');

// Utility function to combine patterns
export const combinePatterns = (patterns: RegExp[]): RegExp[] => 
  patterns.map(p => new RegExp(p.source, p.flags));

};

// Voice response patterns with variations
export const voiceResponses = {
  // Education-specific responses
  education: {
    materials: {
      available: (subject?: string, level?: string) => [
        subject && level 
          ? `Here are the ${subject} materials for ${level}`
          : subject 
          ? `Here are the available materials for ${subject}`
          : `Here are our educational materials`,
        `I found several resources${subject ? ` for ${subject}` : ''}${level ? ` at ${level} level` : ''}`,
        `These are the study materials${subject ? ` for ${subject}` : ''}${level ? ` (${level} level)` : ''}`
      ],
      notFound: (subject?: string, level?: string) => [
        `I couldn't find any materials${subject ? ` for ${subject}` : ''}${level ? ` at ${level} level` : ''}. Would you like to see related subjects?`,
        `No resources available${subject ? ` for ${subject}` : ''}${level ? ` at ${level} level` : ''}. Should I show you alternatives?`,
        `We don't have those materials yet. Would you like to explore other subjects?`
      ],
      suggestions: (relatedSubjects: string[]) => [
        `You might also be interested in: ${relatedSubjects.join(', ')}`,
        `Related subjects include: ${relatedSubjects.join(', ')}`,
        `Similar subjects you can explore: ${relatedSubjects.join(', ')}`
      ]
    },
    examPapers: {
      available: (board: string, subject?: string, year?: string) => [
        `Here are the ${board} past papers${subject ? ` for ${subject}` : ''}${year ? ` from ${year}` : ''}`,
        `I found these ${board} exam papers${subject ? ` in ${subject}` : ''}${year ? ` from ${year}` : ''}`,
        `Available ${board} papers${subject ? ` for ${subject}` : ''}${year ? ` (${year})` : ''}`
      ],
      notFound: (board: string, subject?: string) => [
        `No ${board} papers available${subject ? ` for ${subject}` : ''}. Would you like to see other exam boards?`,
        `I couldn't find ${board} papers${subject ? ` in ${subject}` : ''}. Should I show you alternatives?`,
        `We don't have those papers yet. Would you like to see what's available?`
      ]
    },
    curriculum: {
      overview: (level: string) => [
        `Here's the curriculum overview for ${level}`,
        `These are the subjects covered in ${level}`,
        `This is what students learn in ${level}`
      ],
      subjects: (subjects: string[]) => [
        `The main subjects are: ${subjects.join(', ')}`,
        `Students study: ${subjects.join(', ')}`,
        `The curriculum includes: ${subjects.join(', ')}`
      ]
    }
  },

  // Equipment-specific responses
  equipment: {
    available: {
      general: (category: string, count: number) => [
        `We have ${count} ${category} items available`,
        `There are ${count} pieces of ${category} equipment in stock`,
        `${count} ${category} items are ready for use`
      ],
      specific: (equipment: string, details: string) => [
        `The ${equipment} ${details}`,
        `Here are the details for the ${equipment}: ${details}`,
        `About the ${equipment}: ${details}`
      ]
    },
    usage: {
      instructions: (equipment: string) => [
        `Here's how to use the ${equipment}`,
        `Let me explain how the ${equipment} works`,
        `These are the operating instructions for the ${equipment}`
      ],
      safety: (equipment: string, precautions: string[]) => [
        `Important safety notes for ${equipment}: ${precautions.join('; ')}`,
        `When using the ${equipment}, remember: ${precautions.join('; ')}`,
        `Safety precautions for ${equipment}: ${precautions.join('; ')}`
      ],
      maintenance: (equipment: string) => [
        `Here's how to maintain the ${equipment}`,
        `Follow these steps to keep the ${equipment} in good condition`,
        `Maintenance guide for the ${equipment}`
      ]
    },
    compatibility: {
      match: (equipment: string, compatibleItems: string[]) => [
        `The ${equipment} works with: ${compatibleItems.join(', ')}`,
        `Compatible items for ${equipment}: ${compatibleItems.join(', ')}`,
        `You can use these with the ${equipment}: ${compatibleItems.join(', ')}`
      ],
      notCompatible: (equipment: string, alternative?: string) => [
        `This isn't compatible with ${equipment}${alternative ? `. Consider using ${alternative} instead` : ''}`,
        `The ${equipment} won't work with this${alternative ? `. Try ${alternative}` : ''}`,
        `Not compatible with ${equipment}${alternative ? `. ${alternative} would work better` : ''}`
      ]
    }
  },

  // Product browsing responses
  browse: {
    success: {
      search: (query: string) => [
        `Here are the products matching "${query}"`,
        `I found several items for "${query}"`,
        `Here's what we have for "${query}"`
      ],
      category: (category: string) => [
        `Showing ${category} products`,
        `Here are our ${category} items`,
        `Browsing the ${category} category`
      ],
      filter: (filterType: string, value: string) => [
        `Showing items filtered by ${filterType}: ${value}`,
        `Here are the items ${filterType} ${value}`,
        `Filtered results for ${filterType} ${value}`
      ]
    },
    empty: {
      search: (query: string) => [
        `I couldn't find any products matching "${query}". Would you like to try a different search?`,
        `No results found for "${query}". Should I search for something similar?`,
        `Sorry, I don't see any matches for "${query}". Would you like to see our popular items instead?`
      ],
      filter: (filterType: string) => [
        `No items match the ${filterType} filter. Would you like to try different criteria?`,
        `I couldn't find anything with those filter settings. Should I show you all items instead?`,
        `No results with the current filters. Would you like me to suggest alternatives?`
      ]
    }
  },

  // Cart operations
  cart: {
    add: {
      success: (product: string, quantity: number = 1) => [
        `Added ${quantity} ${product}${quantity > 1 ? 's' : ''} to your cart`,
        `${product} has been added to your cart${quantity > 1 ? ` (Quantity: ${quantity})` : ''}`,
        `Done! ${quantity} ${product}${quantity > 1 ? 's' : ''} added to cart`
      ],
      error: (product: string) => [
        `Sorry, I couldn't add ${product} to your cart. Would you like to try again?`,
        `There was a problem adding ${product}. Should I retry?`,
        `Failed to add ${product}. Would you like me to try again?`
      ]
    },
    remove: {
      success: (product: string) => [
        `Removed ${product} from your cart`,
        `${product} has been removed`,
        `Done! ${product} is no longer in your cart`
      ],
      error: (product: string) => [
        `Sorry, I couldn't remove ${product}. Would you like to try again?`,
        `There was a problem removing ${product}. Should I retry?`,
        `Failed to remove ${product}. Would you like me to try again?`
      ]
    },
    update: {
      success: (product: string, quantity: number) => [
        `Updated ${product} quantity to ${quantity}`,
        `Changed quantity of ${product} to ${quantity}`,
        `${product} quantity is now ${quantity}`
      ],
      error: (product: string) => [
        `Sorry, I couldn't update the quantity. Would you like to try again?`,
        `Failed to change the quantity. Should I retry?`,
        `There was a problem updating the quantity. Would you like me to try again?`
      ]
    },
    view: (count: number) => [
      `Your cart has ${count} item${count !== 1 ? 's' : ''}`,
      `There ${count === 1 ? 'is' : 'are'} ${count} item${count !== 1 ? 's' : ''} in your cart`,
      `You have ${count} item${count !== 1 ? 's' : ''} in your cart`
    ],
    empty: [
      "Your cart is empty. Would you like to browse our products?",
      "There are no items in your cart. Should I show you some popular items?",
      "The cart is empty. Would you like to see what's new?"
    ]
  },

  // Lab-specific responses
  lab: {
    stock: {
      check: (item: string, quantity: number) => [
        `We have ${quantity} ${item}${quantity !== 1 ? 's' : ''} in stock`,
        `Current stock of ${item}: ${quantity}`,
        `${item} availability: ${quantity} unit${quantity !== 1 ? 's' : ''}`
      ],
      low: (items: string[]) => [
        `Warning: Low stock for ${items.join(', ')}`,
        `The following items are running low: ${items.join(', ')}`,
        `Stock alert: Please reorder ${items.join(', ')}`
      ],
      none: (item: string) => [
        `${item} is currently out of stock`,
        `Sorry, we don't have any ${item} available right now`,
        `${item} needs to be restocked`
      ]
    },
    specimens: {
      available: (specimens: string[]) => [
        `Available specimens: ${specimens.join(', ')}`,
        `We have the following specimens: ${specimens.join(', ')}`,
        `Current specimen collection: ${specimens.join(', ')}`
      ]
    }
  },

  // Authentication responses
  auth: {
    login: {
      success: (name: string) => [
        `Welcome back, ${name}!`,
        `Hello ${name}, you're now signed in`,
        `You're logged in as ${name}`
      ],
      error: [
        "I couldn't sign you in. Would you like to try again?",
        "Login failed. Should I retry?",
        "There was a problem signing in. Would you like to try again?"
      ],
      needed: [
        "Please sign in to continue",
        "This action requires you to be logged in",
        "You'll need to sign in first"
      ]
    },
    logout: {
      success: [
        "You've been signed out",
        "You're now logged out",
        "Logout successful"
      ]
    }
  },

  // Contextual responses
  context: {
    clarification: {
      quantity: [
        "How many would you like?",
        "What quantity do you want?",
        "Please specify the quantity"
      ],
      product: [
        "Which product are you interested in?",
        "Which item would you like?",
        "Could you specify the product?"
      ],
      filter: [
        "How would you like to filter the items?",
        "What type of filter would you like to apply?",
        "Would you like to filter by category, price, or availability?"
      ]
    },
    confirmation: {
      general: [
        "Would you like me to do that?",
        "Should I proceed?",
        "Shall I continue?"
      ],
      specific: (action: string) => [
        `Would you like me to ${action}?`,
        `Should I ${action}?`,
        `Shall I ${action}?`
      ]
    },
    error: {
      general: [
        "I didn't quite catch that. Could you rephrase?",
        "I'm not sure what you mean. Could you try saying that differently?",
        "Sorry, I didn't understand. Can you please try again?"
      ],
      specific: (issue: string) => [
        `I'm having trouble with ${issue}. Could you try again?`,
        `There's an issue with ${issue}. Would you like to try another way?`,
        `I couldn't handle ${issue}. Should we try something else?`
      ]
    }
  }
};
