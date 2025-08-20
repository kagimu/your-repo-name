// API keys configuration
export const API_KEYS = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  HUGGINGFACE_API_KEY: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
  WOLFRAM_ALPHA_APPID: import.meta.env.VITE_WOLFRAM_ALPHA_APPID || '',
} as const;

// Validate required API keys
export const validateAPIKeys = () => {
  const missingKeys = Object.entries(API_KEYS)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.warn(
      `Warning: The following API keys are missing: ${missingKeys.join(', ')}. ` +
      'Some AI features may be unavailable.'
    );
  }
};

// Call validation on app startup
validateAPIKeys();
