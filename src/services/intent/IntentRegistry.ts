import { Product, QuantitySlot, AmountSlot } from '../slots/extractors/slotExtractors';

export interface Intent {
  name: string;
  patterns: RegExp[];
  requiredSlots: string[];
  action: (slots: Record<string, any>) => Promise<void>;
}

export interface IntentMatch {
  intent: Intent;
  confidence: number;
  slots: Record<string, any>;
}

export class IntentRegistry {
  private intents: Intent[];

  constructor(cartService: any, navigationService: any, orderService: any) {
    this.intents = [
      {
        name: 'addToCart',
        patterns: [
          /add .* to (?:my )?cart/i,
          /put .* in (?:my )?cart/i,
          /buy .* now/i
        ],
        requiredSlots: ['product', 'quantity'],
        action: async (slots) => {
          await cartService.addItem(slots.product, slots.quantity);
        }
      },
      {
        name: 'removeFromCart',
        patterns: [
          /remove .* from (?:my )?cart/i,
          /delete .* from (?:my )?cart/i
        ],
        requiredSlots: ['product'],
        action: async (slots) => {
          await cartService.removeItem(slots.product);
        }
      },
      {
        name: 'viewCart',
        patterns: [
          /(?:show|view|open|display) (?:my )?cart/i,
          /what(?:'s| is) in (?:my )?cart/i
        ],
        requiredSlots: [],
        action: async () => {
          await navigationService.navigateToCart();
        }
      },
      {
        name: 'checkout',
        patterns: [
          /checkout/i,
          /proceed to (?:payment|checkout)/i,
          /pay now/i
        ],
        requiredSlots: [],
        action: async () => {
          await navigationService.navigateToCheckout();
        }
      },
      {
        name: 'viewOrders',
        patterns: [
          /(?:show|view|display) (?:my )?orders/i,
          /order history/i
        ],
        requiredSlots: [],
        action: async () => {
          await navigationService.navigateToOrders();
        }
      },
      {
        name: 'suggestByBudget',
        patterns: [
          /show .* under .*/i,
          /what can i (?:buy|get) for .*/i,
          /products under .*/i
        ],
        requiredSlots: ['amount'],
        action: async (slots) => {
          await navigationService.navigateToSearch({
            maxPrice: slots.amount.value,
            currency: slots.amount.currency
          });
        }
      }
    ];
  }

  findIntent(text: string, slots: Record<string, any>): IntentMatch | null {
    let bestMatch: IntentMatch | null = null;
    let highestConfidence = 0;

    for (const intent of this.intents) {
      // Check if text matches any of the intent patterns
      const matchConfidence = this.calculateMatchConfidence(text, intent, slots);
      
      if (matchConfidence > highestConfidence) {
        // Verify required slots are present
        const hasRequiredSlots = intent.requiredSlots.every(slot => slots[slot] !== undefined);
        
        if (hasRequiredSlots) {
          highestConfidence = matchConfidence;
          bestMatch = {
            intent,
            confidence: matchConfidence,
            slots
          };
        }
      }
    }

    return bestMatch;
  }

  private calculateMatchConfidence(text: string, intent: Intent, slots: Record<string, any>): number {
    let maxConfidence = 0;

    for (const pattern of intent.patterns) {
      if (pattern.test(text)) {
        // Base confidence from pattern match
        let confidence = 0.7;

        // Boost confidence based on required slots presence
        const availableSlots = intent.requiredSlots.filter(slot => slots[slot] !== undefined);
        confidence += (availableSlots.length / intent.requiredSlots.length) * 0.3;

        maxConfidence = Math.max(maxConfidence, confidence);
      }
    }

    return maxConfidence;
  }

  async executeIntent(match: IntentMatch): Promise<void> {
    await match.intent.action(match.slots);
  }
}
