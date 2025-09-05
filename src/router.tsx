import React, { lazy, Suspense } from "react";
import { PublicRoute } from "./components/layout/RouteGuards";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import VoiceAssistantWrapper from "./components/VoiceAssistant/VoiceAssistantWrapper";

// Use React.lazy for code splitting
const Index = lazy(() => import("./pages/Index"));
const Categories = lazy(() => import("./pages/Categories"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ELibrary = lazy(() => import("./pages/ELibrary"));
const Research = lazy(() => import("./pages/Research"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Courier = lazy(() => import("./pages/Courier"));
const Supplier = lazy(() => import("./pages/Supplier"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const PaymentSuccess = lazy(() => import("./components/checkout/PaymentSuccess"));
const LabInventory = lazy(() => import("./pages/LabInventory"));

// Fallback loader component
const Loader = () => (
  <div className="flex items-center justify-center h-screen">
    <span className="text-lg font-semibold">Loading...</span>
  </div>
);

// Helper to wrap lazy-loaded components with Suspense
const withSuspense = (Component: React.ReactNode) => (
  <Suspense fallback={<Loader />}>{Component}</Suspense>
);

export const routes = [
  {
    element: <VoiceAssistantWrapper />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          {
            index: true,
            element: withSuspense(<Index />)
          },
          {
            path: "categories",
            element: withSuspense(<Categories />)
          },
          {
            path: "product/:id",
            element: withSuspense(<ProductDetail />)
          },
          {
            path: "about",
            element: withSuspense(<AboutUs />)
          },
          {
            path: "cart",
            element: withSuspense(<Cart />)
          },
          {
            path: "checkout",
            element: withSuspense(<Checkout />)
          },
          {
            path: "login",
            element: withSuspense(<Login />)
          },
          {
            path: "register",
            element: withSuspense(<Register />)
          },
          {
            path: "payment/success",
            element: withSuspense(<PaymentSuccess />)
          }
        ]
      },
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: "dashboard",
            element: withSuspense(<Dashboard />),
          },
          {
            path: "elibrary",
            element: withSuspense(<ELibrary />)
          },
          {
            path: "research",
            element: withSuspense(<Research />)
          },
          {
            path: "notifications",
            element: withSuspense(<Notifications />)
          },
          {
            path: "courier",
            element: withSuspense(<Courier />)
          },
          {
            path: "supplier",
            element: withSuspense(<Supplier />)
          },
          {
            path: "inventory",
            element: withSuspense(<LabInventory />)
          }
        ]
      }
    ]
  },
  {
    path: "*",
    element: withSuspense(<NotFound />)
  }
];
