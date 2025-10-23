import * as React from 'react';
import { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AppStartupLoader } from "./components/ui/AppStartupLoader";
import { AnimatePresence } from 'framer-motion';
import { routes } from './router';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Wrap the app content in a component that will be rendered inside the router
const AppContent = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    }>
      <Outlet />
      <Toaster />
      <Sonner />
    </Suspense>
  );
};

// Create a root layout that provides all the context providers
const RootLayout = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
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
  return (
    <ErrorBoundary>
      <RouterProvider router={browserRouter} />
    </ErrorBoundary>
  );
};

export default App;