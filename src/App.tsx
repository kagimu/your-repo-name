
import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AppStartupLoader } from "./components/ui/AppStartupLoader";
import { FloatingChatIcon } from "./components/chat/FloatingChatIcon";
import { AnimatePresence } from 'framer-motion';
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import ELibrary from "./pages/ELibrary";
import Research from "./pages/Research";
import Notifications from "./pages/Notifications";
import Courier from "./pages/Courier";
import Supplier from "./pages/Supplier";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <AnimatePresence mode="wait">
              {isLoading ? (
                <AppStartupLoader key="loader" onComplete={() => setIsLoading(false)} />
              ) : (
                <BrowserRouter key="app">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/e-library" element={<ELibrary />} />
                    <Route path="/research" element={<Research />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/courier" element={<Courier />} />
                    <Route path="/supplier" element={<Supplier />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <FloatingChatIcon />
                </BrowserRouter>
              )}
            </AnimatePresence>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
