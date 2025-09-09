import { createBrowserRouter } from "react-router-dom";
import { PublicRoute } from "./components/layout/RouteGuards";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import VoiceAssistantWrapper from "./components/VoiceAssistant/VoiceAssistantWrapper";
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
import PaymentSuccess from './components/checkout/PaymentSuccess';
import { VoiceAssistantTester } from './components/VoiceAssistant/VoiceAssistantTester';
import LabInventory from './pages/LabInventory';

export const routes = [
  {
    element: <VoiceAssistantWrapper />,
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
          {
            path: "voice-test",
            element: <VoiceAssistantTester />
          }
        ]
      }
    ]
  },
  {
    path: "*",
    element: <NotFound />
  }
];
