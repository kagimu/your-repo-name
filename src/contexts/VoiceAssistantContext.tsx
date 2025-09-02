import * as React from 'react';

// Action types
type VoiceAction =
  | { type: 'START_LISTENING' }
  | { type: 'STOP_LISTENING' }
  | { type: 'SET_TRANSCRIPT'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_STATE'; payload: Partial<VoiceState> };

// State interface
interface VoiceState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isProcessing: boolean;
  status: 'idle' | 'listening' | 'processing' | 'error';
  command?: string;
  args?: any;
  handlers?: any;
}

interface VoiceAssistantContextType extends VoiceState {
  updateContext: (updates: Partial<VoiceState>) => void;
  startListening: () => void;
  stopListening: () => void;
}

const initialState: VoiceState = {
  isListening: false,
  transcript: '',
  error: null,
  isProcessing: false,
  status: 'idle'
};

const initialContext: VoiceAssistantContextType = {
  ...initialState,
  updateContext: () => {},
  startListening: () => {},
  stopListening: () => {},
};

// Reducer function
function voiceReducer(state: VoiceState, action: VoiceAction): VoiceState {
  switch (action.type) {
    case 'START_LISTENING':
      return {
        ...state,
        isListening: true,
        error: null,
        status: 'listening'
      };
    case 'STOP_LISTENING':
      return {
        ...state,
        isListening: false,
        status: 'idle'
      };
    case 'SET_TRANSCRIPT':
      return {
        ...state,
        transcript: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        status: action.payload ? 'error' : state.status
      };
    case 'UPDATE_STATE':
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
}

export const VoiceAssistantContext = React.createContext<VoiceAssistantContextType>(initialContext);

export const VoiceAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = React.useReducer(voiceReducer, initialState);
  const stateRef = React.useRef(state);
  const isInitialMount = React.useRef(true);
  
  // Update ref whenever state changes
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    stateRef.current = state;
  }, [state]);

  const updateContext = React.useCallback((updates: Partial<VoiceState>) => {
    requestAnimationFrame(() => {
      const hasChanges = Object.entries(updates).some(([key, value]) => 
        stateRef.current[key as keyof VoiceState] !== value
      );
      
      if (hasChanges) {
        dispatch({ type: 'UPDATE_STATE', payload: updates });
      }
    });
  }, []);

  const startListening = React.useCallback(() => {
    requestAnimationFrame(() => {
      if (!stateRef.current.isListening) {
        dispatch({ type: 'START_LISTENING' });
      }
    });
  }, []);

  const stopListening = React.useCallback(() => {
    requestAnimationFrame(() => {
      if (stateRef.current.isListening) {
        dispatch({ type: 'STOP_LISTENING' });
      }
    });
  }, []);

  const contextValue = React.useMemo(() => ({
    ...state,
    updateContext,
    startListening,
    stopListening,
  }), [state, updateContext, startListening, stopListening]);

  return (
    <VoiceAssistantContext.Provider value={contextValue}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};

// Custom hook to use the voice assistant context
export const useVoiceAssistant = () => {
  const context = React.useContext(VoiceAssistantContext);
  if (!context) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }
  return context;
};

// Utility hook for components that only need to update the context
export const useVoiceAssistantUpdater = () => {
  const { updateContext, startListening, stopListening } = useVoiceAssistant();
  return { updateContext, startListening, stopListening };
};
