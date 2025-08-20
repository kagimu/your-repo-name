const safeGetEnvVar = (key: string): string | undefined => {
  try {
    if (import.meta.env?.[key]) {
      return import.meta.env[key];
    }
    return undefined;
  } catch {
    return undefined;
  }
};

// Only use this for non-sensitive environment variables
export const getPublicEnvVar = (key: string): string | undefined => {
  return safeGetEnvVar(key);
};

// Use this for sensitive API keys - it only returns existence
export const hasEnvVar = (key: string): boolean => {
  return !!safeGetEnvVar(key);
};

// Get the API key only when actually making the API call
export const getApiKey = (key: string): string | undefined => {
  const value = safeGetEnvVar(key);
  if (!value) {
    console.warn(`API key not found: ${key}`);
  }
  return value;
};
