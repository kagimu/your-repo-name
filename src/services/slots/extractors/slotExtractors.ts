export interface SlotExtractor<T> {
  extract(text: string): T | null;
  confidence(): number;
}

export interface Product {
  name: string;
  brand?: string;
  category?: string;
}

export interface QuantitySlot {
  value: number;
  unit?: string;
}

export interface AmountSlot {
  value: number;
  currency: string;
}

export class ProductExtractor implements SlotExtractor<Product> {
  private lastConfidence: number = 0;
  private patterns = [
    /(?:find|search for|look for|show me)\s+(?:a|an|the)?\s+([^.!?]+)/i,
    /(?:add|put)\s+(?:a|an|the)?\s+([^.!?]+)\s+(?:to cart|to basket)/i,
    /(?:buy|purchase|get)\s+(?:a|an|the)?\s+([^.!?]+)/i
  ];

  extract(text: string): Product | null {
    for (const pattern of this.patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const productText = match[1].trim();
        // Extract brand and category if present
        const brandMatch = productText.match(/by\s+([^\s]+)/i);
        const categoryMatch = productText.match(/in\s+([^\s]+)/i);

        this.lastConfidence = 0.8; // Base confidence
        return {
          name: productText.replace(/by\s+[^\s]+/i, '').replace(/in\s+[^\s]+/i, '').trim(),
          brand: brandMatch ? brandMatch[1] : undefined,
          category: categoryMatch ? categoryMatch[1] : undefined
        };
      }
    }
    this.lastConfidence = 0;
    return null;
  }

  confidence(): number {
    return this.lastConfidence;
  }
}

export class QuantityExtractor implements SlotExtractor<QuantitySlot> {
  private lastConfidence: number = 0;
  private numberWords: Record<string, number> = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
  };

  extract(text: string): QuantitySlot | null {
    // Match numeric values with optional units
    const numericPattern = /(\d+)\s*(piece|pc|pcs|items?|units?)?/i;
    const match = text.match(numericPattern);

    if (match) {
      this.lastConfidence = 0.9;
      return {
        value: parseInt(match[1]),
        unit: match[2]?.toLowerCase()
      };
    }

    // Match word numbers
    const words = text.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (this.numberWords[word]) {
        this.lastConfidence = 0.8;
        return {
          value: this.numberWords[word]
        };
      }
    }

    this.lastConfidence = 0;
    return null;
  }

  confidence(): number {
    return this.lastConfidence;
  }
}

export class AmountExtractor implements SlotExtractor<AmountSlot> {
  private lastConfidence: number = 0;
  private currencySymbols: Record<string, string> = {
    '$': 'USD',
    '£': 'GBP',
    '€': 'EUR',
    '¥': 'JPY'
  };

  extract(text: string): AmountSlot | null {
    // Match currency symbols or codes with numbers
    const pattern = /(?:[\$\£\€\¥]\s*(\d+(?:\.\d{2})?))|((\d+(?:\.\d{2})?)\s*(USD|EUR|GBP|JPY))/i;
    const match = text.match(pattern);

    if (match) {
      this.lastConfidence = 0.9;
      const amount = parseFloat(match[1] || match[3]);
      const currency = match[4] || this.currencySymbols[text[match.index!]];
      
      return {
        value: amount,
        currency: currency
      };
    }

    this.lastConfidence = 0;
    return null;
  }

  confidence(): number {
    return this.lastConfidence;
  }
}
