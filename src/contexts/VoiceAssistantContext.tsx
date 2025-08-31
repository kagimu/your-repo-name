import React, { createContext, useContext, useState } from 'react';

interface VoiceAssistantContextType {
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  userName: string;
  setUserName: (name: string) => void;
  lastSearchResults: any[];
  setLastSearchResults: (results: any[]) => void;
  conversationContext: {
    lastCommand?: string;
    lastResults?: any[];
    lastAction?: string;
  };
  setConversationContext: (context: any) => void;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export const VoiceAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [userName, setUserName] = useState('');
  const [lastSearchResults, setLastSearchResults] = useState([]);
  const [conversationContext, setConversationContext] = useState({});

  return (
    <VoiceAssistantContext.Provider
      value={{
        isEnabled,
        setIsEnabled,
        userName,
        setUserName,
        lastSearchResults,
        setLastSearchResults,
        conversationContext,
        setConversationContext,
      }}
    >
      {children}
    </VoiceAssistantContext.Provider>
  );
};

export const useVoiceAssistant = () => {
  const context = useContext(VoiceAssistantContext);
  if (context === undefined) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }
  return context;
};
