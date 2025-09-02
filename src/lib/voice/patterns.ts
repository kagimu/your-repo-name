import { NavigateFunction } from 'react-router-dom';
import { SUBJECTS, EDUCATION_LEVELS, LAB_EQUIPMENT, LAB_CATEGORIES } from './constants';
import { educationIntents } from './educationIntents';
import { labEquipmentIntents } from './labEquipmentIntents';

// Core type definitions
interface RegexUtils {
  optional: (pattern: string) => string;
  oneOf: (...patterns: string[]) => string;
  capture: (name: string, pattern: string) => string;
  repeated: (pattern: string, min?: number, max?: number) => string;
  followedBy: (...patterns: string[]) => string;
  prefixedBy: (prefix: string, pattern: string) => string;
  product: string;
}

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

export interface VoiceSlot {
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

export interface VoiceIntent {
  name: string;
  patterns: RegExp[];
  slots?: Record<string, VoiceSlot>;
  priority?: number;
  contextual?: boolean;
  examples: string[];
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

// RegEx utilities
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

// Extract utilities for pattern building
const { oneOf, capture, product: productPattern } = regexUtils;

// Core pattern collections
export const patterns: VoicePatterns = {
  number: '\\d+(?:\\.\\d+)?',
  currency: `\\$?\\d+(?:\\.\\d+)?`,
  quantity: '(?:\\d+(?:\\.\\d+)?|a|an|one|two|three|four|five|six|seven|eight|nine|ten)',
  date: '(?:\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4}|today|tomorrow|next week)',
  time: '\\d{1,2}(?::\\d{2})?(?:am|pm)?',
  category: '[\\w\\s&-]+',
  navigation: ['go', 'take me', 'navigate', 'show', 'open', 'view', 'display'],
  search: ['search', 'find', 'look for', 'show me'],
  cart: ['add', 'put', 'place', 'remove', 'delete'],
  filter: ['filter', 'sort', 'show only', 'display only'],
  articles: ['the', 'a', 'an', 'some', 'this', 'that'],
  prepositions: ['to', 'from', 'in', 'on', 'at', 'by'],
  education: {
    verbs: ['study', 'learn', 'practice', 'review', 'teach'],
    resources: ['textbook', 'note', 'tutorial', 'guide', 'paper', 'exam'],
    subjects: SUBJECTS,
    levels: EDUCATION_LEVELS
  },
  lab: {
    verbs: ['experiment', 'measure', 'analyze', 'test', 'observe'],
    equipment: LAB_EQUIPMENT,
    categories: LAB_CATEGORIES
  }
};

// Combined intents
export const intents = [...educationIntents, ...labEquipmentIntents];

// Voice command patterns
export const commandPatterns: CommandPatterns = {
  // Navigation patterns
  showMe: 'show\\s+(?:me\\s+)?',
  findMe: 'find\\s+(?:me\\s+)?',
  searchFor: 'search\\s+(?:for\\s+)?',
  lookFor: 'look\\s+(?:for\\s+)?',
  addTo: 'add\\s+(?:to\\s+)?(?:my\\s+)?(?:the\\s+)?',
  goTo: 'go\\s+(?:to\\s+)?',
  takeMeTo: 'take\\s+(?:me\\s+)?(?:to\\s+)?',
  openThe: 'open\\s+(?:the\\s+)?',
  
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
};

// Utility functions
export const createSearchPattern = (prefix: string): RegExp => 
  new RegExp(`^${prefix}${capture('query', productPattern)}$`, 'i');

export const combinePatterns = (patterns: RegExp[]): RegExp[] => 
  patterns.map(p => new RegExp(p.source, p.flags));
