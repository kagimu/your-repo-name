import * as React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AppStartupLoader } from "./components/ui/AppStartupLoader";
import { AnimatePresence } from 'framer-motion';
import { router } from './router';
import { useAIInitialization } from './hooks/useAIInitialization';

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const { isInitialized } = useAIInitialization();

  React.useEffect(() => {
    if (!isInitialized) return;
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isInitialized]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <AppStartupLoader key="loader" onComplete={() => setIsLoading(false)} />
              ) : (
                <RouterProvider 
                  router={router} 
                  fallbackElement={<AppStartupLoader onComplete={() => {}} />}
                />
              )}
            </AnimatePresence>
            <Toaster />
            <Sonner />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;