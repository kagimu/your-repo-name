import { Product } from '@/types/product';

export type SlotType = 
  | 'product'
  | 'category'
  | 'number'
  | 'price'
  | 'action'
  | 'sort'
  | 'filter'
  | 'timeframe'
  | 'reference'
  | 'quantity';

export type IntentSlot = {
  name: string;
  type: SlotType;
  required: boolean;
  validation?: (value: any) => boolean;
  transform?: (value: string, context?: any) => any;
  examples?: string[];
};

export type Intent = {
  name: string;
  patterns: string[];
  slots: IntentSlot[];
  examples: string[];
  contextual?: boolean; // Requires previous context
  priority?: number; // Higher numbers take precedence
};

// Slot transformers and validators
const transformers = {
  price: (value: string): number => {
    const number = value.replace(/[^0-9.]/g, '');
    return parseFloat(number);
  },
  quantity: (value: string): number => {
    const numbers = value.match(/\d+/);
    return numbers ? parseInt(numbers[0]) : 1;
  },
  category: (value: string): string => {
    return value.toLowerCase().trim();
  },
  product: (value: string, context: any): string => {
    // Try to match with known products in context
    if (context?.searchResults) {
      const products = context.searchResults as Product[];
      const match = products.find(p => 
        p.name.toLowerCase().includes(value.toLowerCase())
      );
      if (match) return match.name;
    }
    return value.toLowerCase().trim();
  }
};

const validators = {
  price: (value: number): boolean => !isNaN(value) && value >= 0,
  quantity: (value: number): boolean => !isNaN(value) && value > 0 && value <= 100,
  category: (value: string): boolean => {
    const validCategories = ['books', 'stationery', 'electronics', 'uniforms', 'sports'];
    return validCategories.includes(value.toLowerCase());
  }
};

// Intent patterns with improved natural language understanding
export const intents: Intent[] = [
  {
    name: 'search',
    patterns: [
      'search for {product}',
      'find {product}',
      'show me {product}',
      'look for {product}',
      'i need {product}',
      'do you have {product}',
      'search {category} category',
      'show {category} items'
    ],
    slots: [
      {
        name: 'product',
        type: 'product',
        required: false,
        transform: transformers.product,
        examples: ['mathematics textbooks', 'pencils', 'school bags']
      },
      {
        name: 'category',
        type: 'category',
        required: false,
        transform: transformers.category,
        validation: validators.category,
        examples: ['books', 'stationery', 'electronics']
      }
    ],
    examples: [
      'search for mathematics textbooks',
      'find blue pens',
      'show me stationery items',
      'do you have school bags'
    ],
    priority: 1
  },
  {
    name: 'addToCart',
    patterns: [
      'add {product} to cart',
      'add {quantity} {product} to cart',
      'put {product} in cart',
      'buy {product}',
      'i want to buy {product}',
      'purchase {quantity} {product}'
    ],
    slots: [
      {
        name: 'product',
        type: 'product',
        required: true,
        transform: transformers.product
      },
      {
        name: 'quantity',
        type: 'quantity',
        required: false,
        transform: transformers.quantity,
        validation: validators.quantity
      }
    ],
    examples: [
      'add mathematics textbook to cart',
      'add 2 notebooks to cart',
      'buy scientific calculator'
    ],
    priority: 2
  },
  {
    name: 'filter',
    patterns: [
      'filter by {filter}',
      'show {filter} items',
      'find {filter} products',
      'items under {price}',
      'products between {price} and {price}',
      'show {category} items under {price}'
    ],
    slots: [
      {
        name: 'filter',
        type: 'filter',
        required: false
      },
      {
        name: 'price',
        type: 'price',
        required: false,
        transform: transformers.price,
        validation: validators.price
      },
      {
        name: 'category',
        type: 'category',
        required: false,
        transform: transformers.category,
        validation: validators.category
      }
    ],
    examples: [
      'filter by price',
      'show items under 5000',
      'find products between 1000 and 5000',
      'show stationery items under 2000'
    ],
    priority: 1
  },
  {
    name: 'compareProducts',
    patterns: [
      'compare {product} and {product}',
      'what is the difference between {product} and {product}',
      'which is better {product} or {product}',
      'compare these items',
      'show me the differences'
    ],
    slots: [
      {
        name: 'product1',
        type: 'product',
        required: false,
        transform: transformers.product
      },
      {
        name: 'product2',
        type: 'product',
        required: false,
        transform: transformers.product
      }
    ],
    examples: [
      'compare these notebooks',
      'what is the difference between these calculators',
      'which is better HP or Dell laptop'
    ],
    contextual: true,
    priority: 2
  },
  {
    name: 'productInfo',
    patterns: [
      'tell me about {product}',
      'describe {product}',
      'what are the features of {product}',
      'specifications of {product}',
      'more information about {product}',
      'details of this product'
    ],
    slots: [
      {
        name: 'product',
        type: 'product',
        required: false,
        transform: transformers.product
      }
    ],
    examples: [
      'tell me about this calculator',
      'what are the features of this laptop',
      'specifications of the scientific calculator'
    ],
    contextual: true,
    priority: 1
  },
  {
    name: 'checkout',
    patterns: [
      'checkout',
      'complete purchase',
      'finish order',
      'buy now',
      'proceed to payment',
      'go to checkout'
    ],
    slots: [],
    examples: [
      'checkout',
      'complete my purchase',
      'proceed to payment'
    ],
    priority: 3
  }
];

// Fuzzy matching for product names and categories
export const fuzzyMatch = (input: string, target: string): number => {
  input = input.toLowerCase();
  target = target.toLowerCase();
  
  if (input === target) return 1;
  if (target.includes(input)) return 0.9;
  if (input.includes(target)) return 0.8;
  
  // Calculate word overlap
  const inputWords = input.split(' ');
  const targetWords = target.split(' ');
  const commonWords = inputWords.filter(word => targetWords.includes(word));
  
  if (commonWords.length > 0) {
    return commonWords.length / Math.max(inputWords.length, targetWords.length);
  }
  
  return 0;
};

// Intent matching with context awareness
export const matchIntent = (
  input: string,
  context: any
): { intent: Intent; slots: Record<string, any>; confidence: number } | null => {
  let bestMatch = { intent: null as Intent | null, slots: {}, confidence: 0 };
  
  for (const intent of intents) {
    // Skip contextual intents if no context is available
    if (intent.contextual && !context) continue;

    for (const pattern of intent.patterns) {
      const patternParts = pattern.split(' ');
      const inputParts = input.toLowerCase().split(' ');
      let confidence = 0;
      const slots: Record<string, any> = {};

      // Match pattern parts with input
      let matchedParts = 0;
      let i = 0, j = 0;

      while (i < patternParts.length && j < inputParts.length) {
        const patternPart = patternParts[i];
        const inputPart = inputParts[j];

        if (patternPart.startsWith('{') && patternPart.endsWith('}')) {
          // Extract slot name and find corresponding slot definition
          const slotName = patternPart.slice(1, -1);
          const slotDef = intent.slots.find(s => s.name === slotName);

          if (slotDef) {
            // Collect all words until next pattern part or end
            let slotValue = inputPart;
            let nextPatternPart = patternParts[i + 1];
            let k = j + 1;

            while (k < inputParts.length && 
                   (!nextPatternPart || !inputParts[k].includes(nextPatternPart.toLowerCase()))) {
              slotValue += ' ' + inputParts[k];
              k++;
            }

            // Transform and validate slot value
            if (slotDef.transform) {
              slotValue = slotDef.transform(slotValue, context);
            }
            if (!slotDef.validation || slotDef.validation(slotValue)) {
              slots[slotName] = slotValue;
              matchedParts++;
              j = k;
            }
          }
        } else if (patternPart.toLowerCase() === inputPart) {
          matchedParts++;
          j++;
        }
        i++;
      }

      // Calculate confidence score
      confidence = matchedParts / patternParts.length;

      // Adjust confidence based on slot validation and context
      if (Object.keys(slots).length > 0 && intent.slots.length > 0) {
        const validSlots = intent.slots.filter(slot =>
          slot.required ? slots[slot.name] !== undefined : true
        ).length;
        confidence *= validSlots / intent.slots.length;
      }

      // Boost confidence for contextual matches
      if (intent.contextual && context) {
        confidence *= 1.2;
      }

      // Update best match if confidence is higher
      if (confidence > bestMatch.confidence) {
        bestMatch = { intent, slots, confidence };
      }
    }
  }

  return bestMatch.confidence > 0.6 && bestMatch.intent ? bestMatch : null;
};
