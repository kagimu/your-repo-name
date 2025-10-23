import { createBrowserRouter } from "react-router-dom";
import { PublicRoute } from "./components/layout/RouteGuards";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import { lazy } from "react";

// Lazy load pages for better performance with error boundaries
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
const PaymentSuccess = lazy(() => import('./components/checkout/PaymentSuccess'));
const LabInventory = lazy(() => import('./pages/LabInventory'));

export const routes = [
  {
    children: [
      {
        element: <PublicRoute />,
        children: [
          {
            index: true,
            element: <Index />
          },
          {
            path: "categories",
            element: <Categories />
          },
          {
            path: "product/:id",
            element: <ProductDetail />
          },
          {
            path: "about",
            element: <AboutUs />
          },
          {
            path: "cart",
            element: <Cart />
          },
          {
            path: "checkout",
            element: <Checkout />
          },
          {
            path: "login",
            element: <Login />
          },
          {
            path: "register",
            element: <Register />
          },
          {
            path: "payment/success",
            element: <PaymentSuccess />
          }
        ]
      },
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "elibrary",
            element: <ELibrary />
          },
          {
            path: "research",
            element: <Research />
          },
          {
            path: "notifications",
            element: <Notifications />
          },
          {
            path: "courier",
            element: <Courier />
          },
          {
            path: "supplier",
            element: <Supplier />
          },
          {
            path: "inventory",
            element: <LabInventory />
          },
        ]
      }
    ]
  },
  {
    path: "*",
    element: <NotFound />
  }
];
