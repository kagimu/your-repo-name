import * as React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { VoiceAssistantProvider } from "./contexts/VoiceAssistantContext";
import { AppStartupLoader } from "./components/ui/AppStartupLoader";
import { AnimatePresence } from 'framer-motion';
import { routes } from './router';
import { useAIInitialization } from './hooks/useAIInitialization';

const queryClient = new QueryClient();

// Wrap the app content in a component that will be rendered inside the router
const AppContent = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const { isInitialized } = useAIInitialization();

  React.useEffect(() => {
    if (!isInitialized) return;
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isInitialized]);

  if (isLoading) {
    return (
      <AnimatePresence>
        <AppStartupLoader key="loader" onComplete={() => setIsLoading(false)} />
      </AnimatePresence>
    );
  }

  return (
    <>
      <Outlet />
      <Toaster />
      <Sonner />
    </>
  );
};

// Create a root layout that provides all the context providers
const RootLayout = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <VoiceAssistantProvider>
              <AppContent />
            </VoiceAssistantProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Create the router with the wrapped component
const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: routes
  }
]);

// Main App component that provides the router
const App = () => {
  return <RouterProvider router={browserRouter} />;
};

export default App;