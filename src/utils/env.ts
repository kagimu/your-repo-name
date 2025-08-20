export function getEnvVar(key: keyof ImportMetaEnv): string | undefined {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
    return undefined;
  } catch (error) {
    console.warn(`Error accessing environment variable ${key}:`, error);
    return undefined;
  }
}

export function validateEnvVars() {
  const requiredVars = [
    'VITE_GEMINI_API_KEY',
    'VITE_OPENAI_API_KEY',
    'VITE_HUGGINGFACE_API_KEY'
  ] as const;

  const missingVars = requiredVars.filter(key => !getEnvVar(key));

  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars.join(', '));
    return false;
  }

  return true;
}
