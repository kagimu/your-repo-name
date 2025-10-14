import * as React from 'react';

export function useStateWithCallback<T>(initialValue: T) {
  const [value, setValue] = React.useState(initialValue);
  const callbackRef = React.useRef<((value: T) => void) | null>(null);

  const setValueWithCallback = React.useCallback((newValue: T | ((prev: T) => T), callback?: (value: T) => void) => {
    callbackRef.current = callback || null;

    setValue((prev) => {
      const nextValue = typeof newValue === 'function' 
        ? (newValue as ((prev: T) => T))(prev)
        : newValue;

      if (callbackRef.current) {
        setTimeout(() => {
          if (callbackRef.current) {
            callbackRef.current(nextValue);
            callbackRef.current = null;
          }
        }, 0);
      }

      return nextValue;
    });
  }, []);

  return [value, setValueWithCallback] as const;
}
