import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AppStartupLoader } from "./components/ui/AppStartupLoader";
//import { FloatingChatIcon } from "./components/chat/FloatingChatIcon";
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
import AboutUs from "./pages/AboutUs";
import RoleGuard from "./components/layout/RoleGuard";
import PaymentSuccess from './components/checkout/PaymentSuccess';

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
                    <Route path="/courier" element={<RoleGuard allowedRoles={["courier"]}><Courier /></RoleGuard>} />
                    <Route path="/supplier" element={<RoleGuard allowedRoles={["supplier"]}><Supplier /></RoleGuard>} />
                    {/* All other routes are blocked for courier/supplier */}
                    <Route path="/" element={<RoleGuard allowedRoles={["institution","individual","guest"]}><Index /></RoleGuard>} />
                    <Route path="/categories" element={<RoleGuard allowedRoles={["institution","individual","guest"]}><Categories /></RoleGuard>} />
                    <Route path="/product/:id" element={<RoleGuard allowedRoles={["institution","individual","guest"]}><ProductDetail /></RoleGuard>} />
                    <Route path="/cart" element={<RoleGuard allowedRoles={["institution","individual","guest"]}><Cart /></RoleGuard>} />
                    <Route path="/checkout" element={<RoleGuard allowedRoles={["institution","individual","guest"]}><Checkout /></RoleGuard>} />
                    <Route path="/e-library" element={<RoleGuard allowedRoles={["institution","individual","guest"]}><ELibrary /></RoleGuard>} />
                    <Route path="/research" element={<RoleGuard allowedRoles={["institution","individual","guest"]}><Research /></RoleGuard>} />
                    <Route path="/notifications" element={<RoleGuard allowedRoles={["institution","individual","guest"]}><Notifications /></RoleGuard>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />

                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<RoleGuard allowedRoles={["institution","individual","guest"]}><Dashboard /></RoleGuard>} />
                    <Route path="/about-us" element={<AboutUs />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  {/* <FloatingChatIcon /> */}
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
