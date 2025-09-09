export const SILENCE_TIMEOUT = 5000; // 5 seconds
export const RESTART_DELAY = 1000; // 1 second
export const RETRY_DELAY_BASE = 500; // 500ms

export enum VoiceIntent {
  Navigate = 'navigate',
  Auth = 'auth',
  Search = 'search',
  AddToCart = 'addToCart',
  Checkout = 'checkout',
  ShowCategories = 'showCategories',
  BudgetHelp = 'budgetHelp',
  Filter = 'filter'
}

export interface MatchResult {
  intent: VoiceIntent;
  confidence: number;
  slots: Record<string, any>;
}
