import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { ReceiptModal } from '@/components/ReceiptModal';

const LabInventory = lazy(() => import(/* webpackChunkName: "lab-inventory" */ './LabInventory'));
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ShoppingBag,
  TrendingUp,
  Award,
  Bell,
  Settings,
  User,
  CreditCard,
  LogOut,
  X,
  Download,
  Eye,
  Beaker,
  Camera,
  Building2,
  CheckCircle,
  ChevronDown,
  Lock,
  ShieldCheck,
  ChevronRight,
  History,
  Trash2
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import LabMenuItem from '@/components/layout/LabMenuItem';
import { toast } from 'react-toastify';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { DashboardLoading } from '@/components/ui/DashboardLoading';

// Types and Interfaces
interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  created_at: string;
  payment_status: string;
  total: number;
  items: OrderItem[];
}

interface DashboardStats {
  total_orders: number;
  orders_change: number;
  pending_deliveries: number;
  deliveries_change: number;
  badges_earned: number;
  badges_change: number;
  notifications: number;
  notifications_change: number;
}

interface ApiResponse {
  orders?: Order[];
  data?: Order[];
  status: number;
  message: string;
  order?: {
    payment_status: string;
  };
}

interface DashboardStat {
  label: string;
  value: number;
  change: number | string;
  positive: boolean;
  icon: LucideIcon;
}

type LucideIcon = React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement> & { title?: string, size?: number | string }>;

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Initialize the active section from URL search params or location state
  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [activeSection, setActiveSection] = useState<'overview' | 'orders'>('overview');

  // Set active section immediately when component mounts or URL/state changes
  useEffect(() => {
    const section = location.state?.activeSection || urlParams.get('section');

    if (section === 'orders') {
      setActiveSection('orders');
      // Ensure URL reflects the active section
      if (urlParams.get('section') !== 'orders') {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('section', 'orders');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }

    // Debug log
    console.log('Setting active section:', section);
  }, [location, urlParams]);

  // Effect to handle order redirects
  useEffect(() => {
    if (location.state?.orderId) {
      setActiveSection('orders');
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('section', 'orders');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [location.state?.orderId]);

  // Debug logging to track section changes
  useEffect(() => {
    console.log('Active Section Changed:', activeSection);
    console.log('Location State:', location.state);
    console.log('URL Params:', Object.fromEntries(urlParams));
  }, [activeSection, location.state, urlParams]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // All your existing state declarations
  const [stats, setStats] = useState<DashboardStat[]>([
    {
      label: 'Total Orders',
      value: 0,
      change: '0%',
      positive: true,
      icon: ShoppingBag
    },
    {
      label: 'Pending Deliveries',
      value: 0,
      change: '0',
      positive: true,
      icon: TrendingUp
    },
    {
      label: 'Badges Earned',
      value: 0,
      change: '0',
      positive: true,
      icon: Award
    },
    {
      label: 'Notifications',
      value: 0,
      change: '0',
      positive: false,
      icon: Bell
    }
  ]);

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [shoppingHistory, setShoppingHistory] = useState<Order[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastStatsUpdate, setLastStatsUpdate] = useState<number>(0);
  const [cachedStats, setCachedStats] = useState<ApiResponse | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [confirmingPayOnDelivery, setConfirmingPayOnDelivery] = useState(false);

  // Function to get sidebar items
  const getSidebarItems = useCallback((hasHistory: boolean) => {
    // Debug logs
    console.log('User Account Type:', user?.accountType);
    console.log('Feature Flags:', user?.featureFlags);
    console.log('Is Institution?:', user?.accountType === 'institution');
    console.log('Lab Management Enabled?:', user?.featureFlags?.labManagementEnabled);

    const items = [
      { id: 'overview', label: 'Overview', icon: TrendingUp },
      { id: 'orders', label: 'Orders', icon: ShoppingBag },
      { id: 'badges', label: 'Badges', icon: Award },
      ...(user?.accountType === 'institution'  // Temporarily remove feature flag check
        ? [{ id: 'labs', label: 'Lab Management', icon: Beaker }] 
        : []),
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'billing', label: 'Billing', icon: CreditCard }
    ];

    // Insert Shopping History after Orders if there are items in history
    if (hasHistory) {
      items.splice(2, 0, { id: 'history', label: 'Shopping History', icon: History });
    }

    return items;
  }, [user]);

  // Memoized sidebar items that update when shopping history changes
  const sidebarItems = useMemo(() => getSidebarItems(shoppingHistory.length > 0), [shoppingHistory.length, getSidebarItems]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsOrdersLoading(true);
        setOrdersError(null);
        const token = localStorage.getItem('token');
        
        // If we're coming from checkout with an orderId, ensure we show orders section
        if (location.state?.orderId) {
          setActiveSection('orders');
        }
        
        const response = await axios.get<ApiResponse>(
          'https://backend-main.laravel.cloud/api/orders',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.orders || response.data.data) {
          const orders = response.data.orders || response.data.data || [];
          setAllOrders(orders);
          setRecentOrders(orders);
          
          // Update stats
          const totalOrders = orders.length;
          const pendingDeliveries = orders.filter(order => order.payment_status === 'pending').length;
          
          setStats(prev => prev.map(stat => {
            if (stat.label === 'Total Orders') {
              return { ...stat, value: totalOrders };
            }
            if (stat.label === 'Pending Deliveries') {
              return { ...stat, value: pendingDeliveries };
            }
            return stat;
          }));
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrdersError('Failed to load orders. Please try again later.');
      } finally {
        setIsOrdersLoading(false);
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []); // Empty dependency array means this runs once when component mounts

  // Helper functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const clearAllOrders = () => {
    // Store current orders in history before clearing
    setShoppingHistory(prev => [...prev, ...allOrders]);
    // Clear orders from display
    setAllOrders([]);
    setRecentOrders([]);
    toast.success('Orders cleared! You can view them in Shopping History.');
  };

  const deleteOrder = (orderId: number) => {
    // Add the order to history before removing
    const orderToDelete = allOrders.find(order => order.id === orderId);
    if (orderToDelete) {
      // Only allow deletion of paid orders
      if (orderToDelete.payment_status !== 'paid') {
        toast.error('Only paid orders can be deleted');
        return;
      }
      
      setShoppingHistory(prev => [...prev, orderToDelete]);
      
      // Remove order from display
      setAllOrders(prev => prev.filter(order => order.id !== orderId));
      setRecentOrders(prev => prev.filter(order => order.id !== orderId));
      toast.success('Order removed! You can view it in Shopping History.');
    }
  };

  // Cleanup receipt URL when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (receiptUrl) {
        URL.revokeObjectURL(receiptUrl);
      }
    };
  }, [receiptUrl]);

  // Base64 encoded small Edumall logo as fallback
  const fallbackLogoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAPCAYAAABzyUiPAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF4WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzEzLTIyOjAxOjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuMCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjMtMDgtMjhUMTM6NTA6MjktMDc6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjMtMDgtMjhUMTM6NTA6MjktMDc6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIzLTA4LTI4VDEzOjUwOjI5LTA3OjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjQ5ZTczY2Y1LTJiOGEtNDFiYS05ZGQ1LTJiOGE0MWJhOWRkNSIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjQ5ZTczY2Y1LTJiOGEtNDFiYS05ZGQ1LTJiOGE0MWJhOWRkNSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjQ5ZTczY2Y1LTJiOGEtNDFiYS05ZGQ1LTJiOGE0MWJhOWRkNSIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjQ5ZTczY2Y1LTJiOGEtNDFiYS05ZGQ1LTJiOGE0MWJhOWRkNSIgc3RFdnQ6d2hlbj0iMjAyMy0wOC0yOFQxMzo1MDoyOS0wNzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+vwdKRwAAAYBJREFUWIXt179LQlEUB/CvGhQEQUs0NQQN/QENNbQ0NDQ1NDQ0NDQ0NDQ0NDS0NkZENLQ0NDQ0NDQ0NDQ0NDQ0NETQEBFBEARBEATdfueFR6F5z3v+eHo+cMbL5X7vuYfDOfeaCoWCBWEwGNBoNNBsNtFut9Hr9TCZTGBZFhKJBOLxOKLRKMLhMBzHQSqVWty3bcRiMQSDQXi9XqTTaXg8nkU7nU4xHA7R7XbRarXQ6XQwGo0wm81gWRYCgQDS6TQikQhCoRAcxwEAOI4Dv9+/VG9V31qtFr1eD91uF/1+H+PxGPP5HLZtw+fzIZPJIBwOw+/3w3VdpNPppc8jLcsK2rYd93g8SCaTcF0XhmHA7/evvHwwGKDf72MymWA2m8GyLLiui0gkglAoBJ/PB9M0YRgGDMOA67rw+/1Lz1wsFphOp2i32+h0OhiPx5jP57AsC47jIBqNIhaLwXEcGIYB0zRhmiYMw4Bt20vPXKVSqaDRaGA4HGI6ncKyLCSTScTjcYRCIbiui0wmg1wut5Zn/gJ6ulnU05l4lgAAAABJRU5ErkJggg==';

  const generateReceiptPDF = (order: Order, shouldDownload: boolean = false) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Set PDF properties for better browser compatibility
    pdf.setProperties({
      title: `Edumall Receipt #${order.id}`,
      subject: 'Order Receipt',
      creator: 'Edumall',
      author: 'Edumall System'
    });

    // Set PDF properties for better browser compatibility
    pdf.setProperties({
      title: `Edumall Receipt #${order.id}`,
      subject: 'Order Receipt',
      creator: 'Edumall',
      author: 'Edumall System'
    });

    // Function to center text
    const centerText = (text: string, y: number) => {
      const textWidth = pdf.getStringUnitWidth(text) * pdf.getFontSize() / pdf.internal.scaleFactor;
      return (pageWidth - textWidth) / 2;
    };

    // Add Logo with fallbacks
    try {
      const logoWidth = 40;
      const logoHeight = 10;
      const logoX = (pageWidth - logoWidth) / 2;
      
      // Try to add the fallback base64 logo
      try {
        pdf.addImage(fallbackLogoBase64, 'PNG', logoX, yPos, logoWidth, logoHeight);
      } catch (logoError) {
        console.warn('Logo loading failed, using text fallback:', logoError);
        // If even the base64 fails, use text
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        const text = 'EDUMALL';
        const textWidth = pdf.getStringUnitWidth(text) * pdf.getFontSize() / pdf.internal.scaleFactor;
        pdf.text(text, (pageWidth - textWidth) / 2, yPos + 8);
      }
      yPos += logoHeight + 10;
    } catch (error) {
      console.warn('Logo section failed completely:', error);
      // Skip logo section and continue with the rest of the receipt
      yPos += 20;
    }

    pdf.setFontSize(12);
    pdf.setTextColor(128, 128, 128);
    const tagline = 'Your trusted education partner';
    pdf.text(tagline, centerText(tagline, yPos), yPos);
    yPos += 10;

    // Reset text color to black
    pdf.setTextColor(0, 0, 0);

    // Customer and Order Details section
    pdf.setFillColor(247, 247, 247);
    pdf.rect(margin, yPos, pageWidth - (margin * 2), 55, 'F');
    yPos += 10;

    pdf.setFontSize(11);
    const orderNumber = `Order #ED${order.id.toString().padStart(5, '0')}`;
    pdf.text(orderNumber, margin + 5, yPos);

    // Add user name (if available)
    let userName = '';
    if (user && user.name) {
      userName = user.name;
      pdf.text(`Customer: ${userName}`, margin + 5, yPos + 10);
    }

    const dateStr = new Date(order.created_at).toLocaleDateString('en-UG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    pdf.text(dateStr, pageWidth - margin - 5 - pdf.getStringUnitWidth(dateStr) * pdf.getFontSize() / pdf.internal.scaleFactor, yPos);
    yPos += 20;

    // Payment Status with colored background
    const status = order.payment_status.toUpperCase();
    const statusColor = order.payment_status === 'paid' ? [0, 170, 0] : [255, 170, 0];
    pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    const statusWidth = pdf.getStringUnitWidth(status) * pdf.getFontSize() / pdf.internal.scaleFactor + 10;
    pdf.roundedRect(margin + 5, yPos - 6, statusWidth, 10, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.text(status, margin + 10, yPos);
    pdf.setTextColor(0, 0, 0);
    yPos += 20;

    // Items table
    yPos += 10;
    const tableData = order.items.map(item => [
      item.product.name,
      item.quantity.toString(),
      formatPrice(item.price),
      formatPrice(item.price * item.quantity)
    ]);

    autoTable(pdf, {
      startY: yPos,
      head: [['Item', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [0, 128, 128],
        fontSize: 11,
        fontStyle: 'bold',
        textColor: [255, 255, 255],
        halign: 'center',
        cellPadding: 8
      },
      styles: { 
        fontSize: 10,
        cellPadding: 6,
        font: 'helvetica',
        lineWidth: 0.5,
        lineColor: [220, 220, 220]
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'normal' },
        1: { cellWidth: 30, halign: 'center', fontStyle: 'normal' },
        2: { cellWidth: 40, halign: 'right', fontStyle: 'normal' },
        3: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: [249, 249, 249]
      },
      margin: { top: 10, bottom: 10 }
    });

    const finalY = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    yPos = finalY + 20;

    // Totals section with improved styling
    const subTotal = order.total;
    
    // Add a subtle line above totals
    pdf.setDrawColor(220, 220, 220);
    pdf.line(pageWidth - margin - 150, yPos - 5, pageWidth - margin, yPos - 5);
    
    // Subtotal
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Subtotal:', pageWidth - margin - 100, yPos);
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatPrice(subTotal), pageWidth - margin - 5, yPos, { align: 'right' });
    yPos += 12;

    // Delivery fee line (to be confirmed)
    pdf.setFont('helvetica', 'normal');
    pdf.text('Delivery Fee:', pageWidth - margin - 100, yPos);
    pdf.setTextColor(128, 128, 128); // Gray color for 'to be confirmed'
    pdf.text('To be confirmed by courier', pageWidth - margin - 5, yPos, { align: 'right' });
    pdf.setTextColor(0, 0, 0); // Reset to black
    yPos += 12;

    // Total amount with enhanced styling
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total (excl. delivery):', pageWidth - margin - 100, yPos);
    pdf.setTextColor(0, 128, 128); // Teal color for total amount
    pdf.text(formatPrice(order.total), pageWidth - margin - 5, yPos, { align: 'right' });
    pdf.setTextColor(0, 0, 0); // Reset to black
    yPos += 20;

    // Professional Footer - Moved up by reducing yPos increment and margins
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    const thankYouMsg = 'Thank you for shopping with Edumall!';
    pdf.text(thankYouMsg, centerText(thankYouMsg, pageHeight - margin - 40), pageHeight - margin - 40);

    // Add policy and contact details - Moved up with the rest of the footer
    const policyMsg = 'All sales are subject to our return & refund policy. For support, contact us:';
    pdf.text(policyMsg, centerText(policyMsg, pageHeight - margin - 30), pageHeight - margin - 30);
    const contactMsg = 'Email: support@edumall.co.ug | Tel: +256 781 978 910';
    pdf.text(contactMsg, centerText(contactMsg, pageHeight - margin - 20), pageHeight - margin - 20);

    if (shouldDownload) {
      pdf.save(`receipt-order-${order.id}.pdf`);
      toast.success('Receipt downloaded successfully!');
    } else {
      try {
        // Clean up previous URL if it exists
        if (receiptUrl) {
          URL.revokeObjectURL(receiptUrl);
        }
        // Create blob with explicit MIME type
        const pdfBlob = new Blob([pdf.output('blob')], { type: 'application/pdf' });
        // Create URL with explicit MIME type
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setReceiptUrl(pdfUrl);
        setSelectedOrder(order);
        setShowReceiptModal(true);
      } catch (error) {
        console.error('Error creating PDF preview:', error);
        toast.error('Could not generate preview. Try downloading instead.');
      }
    }
  };

  const confirmDeliveryReceived = async (orderId: number) => {
    try {
      setConfirmingPayOnDelivery(true);
      const token = localStorage.getItem('token');
      const response = await axios.post<ApiResponse>(
        `https://backend-main.laravel.cloud/api/checkout/confirm-pay-on-delivery`,
        { order_id: orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.order?.payment_status === 'paid') {
        toast.success('Payment confirmed successfully! ✅');
        
        setAllOrders(prev =>
          prev.map(order =>
            order.id === orderId
              ? { ...order, payment_status: 'paid' }
              : order
          )
        );

        setRecentOrders(prev =>
          prev.map(order =>
            order.id === orderId
              ? { ...order, payment_status: 'paid' }
              : order
          )
        );
      } else {
        toast.error('Failed to confirm payment. Please try again.');
      }
    } catch (error) {
      console.error('Confirmation failed:', error);
      toast.error('Something went wrong while confirming payment.');
    } finally {
      setConfirmingPayOnDelivery(false);
    }
  };

  // Render Orders section
  const renderOrders = () => (
    <div className="glass-strong rounded-2xl p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-6">All Orders</h2>
      <div className="space-y-4 sm:space-y-6">
        {/* Order filters */}
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
          <select 
            className="px-4 py-2 glass-medium rounded-xl text-sm w-full lg:w-auto"
            onChange={(e) => {
              const filtered = allOrders.filter(order => 
                e.target.value === 'all' ? true : order.payment_status === e.target.value
              );
              setRecentOrders(filtered);
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Payment</option>
            <option value="paid">Paid</option>
          </select>

          <input
            type="text"
            placeholder="Search orders..."
            className="px-4 py-2 glass-medium rounded-xl text-sm w-full sm:flex-1"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              const filtered = allOrders.filter(order => 
                order.id.toString().includes(searchTerm) ||
                order.payment_status.toLowerCase().includes(searchTerm) ||
                order.items.some(item => item.product.name.toLowerCase().includes(searchTerm))
              );
              setRecentOrders(filtered);
            }}
          />
        </div>

        {/* Mobile View (Hidden on large screens) */}
        <div className="space-y-3 lg:hidden">
          {isOrdersLoading ? (
            // Loading skeletons
            Array(3).fill(null).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-medium rounded-xl p-4 animate-pulse"
              >
                <div className="flex justify-between mb-3">
                  <div className="h-5 w-24 bg-gray-200 rounded"></div>
                  <div className="h-5 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                </div>
              </motion.div>
            ))
          ) : recentOrders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 glass-medium rounded-xl"
            >
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No orders found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
            </motion.div>
          ) : (
            (showHistory ? shoppingHistory : recentOrders)
              .slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage)
              .map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-xl p-4 space-y-3 border border-gray-100/50 shadow-sm hover:shadow-md transition-all relative overflow-hidden
                    ${index % 4 === 0 ? 'from-gray-50/80 to-white/90' : 
                      index % 4 === 1 ? 'from-blue-50/80 to-white/90' : 
                      index % 4 === 2 ? 'from-teal-50/80 to-white/90' : 
                      'from-indigo-50/80 to-white/90'} 
                    bg-gradient-to-br backdrop-blur-sm`}
                >
                  {/* Order Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Order #{order.id.toString().padStart(5, '0')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm
                      ${order.payment_status === 'paid'
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                        : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700'
                      } backdrop-blur-sm`}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className={`bg-white/40 backdrop-blur-sm rounded-lg p-4 space-y-2 shadow-sm
                    ${index % 4 === 0 ? 'bg-gradient-to-br from-gray-50/30 to-white/50' : 
                      index % 4 === 1 ? 'bg-gradient-to-br from-blue-50/30 to-white/50' : 
                      index % 4 === 2 ? 'bg-gradient-to-br from-teal-50/30 to-white/50' : 
                      'bg-gradient-to-br from-indigo-50/30 to-white/50'}`}>
                    {order.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 + itemIndex * 0.03 }}
                        className="flex justify-between items-center text-sm py-2 border-b border-gray-100/70 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-teal-50 text-teal-600 rounded-md font-medium">{item.quantity}x</span>
                          <span className="text-gray-900 font-medium">{item.product.name}</span>
                        </div>
                        <span className="text-gray-900 font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-wrap gap-3 items-center justify-between pt-3 mt-2 border-t border-gray-100/70">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className={`text-base font-semibold ${
                        index % 4 === 0 ? 'text-gray-900' :
                        index % 4 === 1 ? 'text-blue-900' :
                        index % 4 === 2 ? 'text-teal-900' :
                        'text-indigo-900'
                      }`}>{formatPrice(order.total)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => generateReceiptPDF(order)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-sm backdrop-blur-sm
                          ${index % 4 === 0 ? 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80' :
                            index % 4 === 1 ? 'bg-blue-100/80 text-blue-700 hover:bg-blue-200/80' :
                            index % 4 === 2 ? 'bg-teal-100/80 text-teal-700 hover:bg-teal-200/80' :
                            'bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200/80'}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => generateReceiptPDF(order, true)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-sm backdrop-blur-sm
                          ${index % 4 === 0 ? 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80' :
                            index % 4 === 1 ? 'bg-blue-100/80 text-blue-700 hover:bg-blue-200/80' :
                            index % 4 === 2 ? 'bg-teal-100/80 text-teal-700 hover:bg-teal-200/80' :
                            'bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200/80'}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </motion.button>
                      {order.payment_status === 'paid' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this order? It will be moved to Shopping History.')) {
                              deleteOrder(order.id);
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-sm backdrop-blur-sm bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </motion.button>
                      )}
                      {order.payment_status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => confirmDeliveryReceived(order.id)}
                          disabled={confirmingPayOnDelivery}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-sm backdrop-blur-sm disabled:opacity-50
                            ${index % 4 === 0 ? 'bg-green-100/80 text-green-700 hover:bg-green-200/80' :
                              index % 4 === 1 ? 'bg-emerald-100/80 text-emerald-700 hover:bg-emerald-200/80' :
                              index % 4 === 2 ? 'bg-teal-100/80 text-teal-700 hover:bg-teal-200/80' :
                              'bg-cyan-100/80 text-cyan-700 hover:bg-cyan-200/80'}`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {confirmingPayOnDelivery ? 'Confirming...' : 'Confirm'}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
          )}
        </div>

        {/* Desktop Table View (Hidden on mobile) */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto rounded-xl border border-gray-100/50 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50/90 to-white/90 backdrop-blur-sm border-b border-gray-200">
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Order ID</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isOrdersLoading ? (
                  // Loading skeletons for table
                  Array(3).fill(null).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                    </tr>
                  ))
                ) : (
                  recentOrders
                    .slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage)
                    .map((order) => (
                      <tr 
                        key={order.id} 
                        className={`border-b border-gray-100/70 transition-colors
                          ${order.id % 4 === 0 ? 'hover:bg-gray-50/80 from-gray-50/40 to-white/60' :
                            order.id % 4 === 1 ? 'hover:bg-blue-50/80 from-blue-50/40 to-white/60' :
                            order.id % 4 === 2 ? 'hover:bg-teal-50/80 from-teal-50/40 to-white/60' :
                            'hover:bg-indigo-50/80 from-indigo-50/40 to-white/60'}
                          bg-gradient-to-r backdrop-blur-sm`}
                      >
                        <td className="px-4 py-4">
                          <div className={`font-medium ${
                            order.id % 4 === 0 ? 'text-gray-900' :
                            order.id % 4 === 1 ? 'text-blue-900' :
                            order.id % 4 === 2 ? 'text-teal-900' :
                            'text-indigo-900'
                          }`}>#{order.id.toString().padStart(5, '0')}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className={`text-sm font-medium ${
                            order.id % 4 === 0 ? 'text-gray-800' :
                            order.id % 4 === 1 ? 'text-blue-800' :
                            order.id % 4 === 2 ? 'text-teal-800' :
                            'text-indigo-800'
                          }`}>{order.items.length} items</div>
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {order.items.map(item => `${item.product.name} (${item.quantity})`).join(', ')}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className={`font-medium ${
                            order.id % 4 === 0 ? 'text-gray-900' :
                            order.id % 4 === 1 ? 'text-blue-900' :
                            order.id % 4 === 2 ? 'text-teal-900' :
                            'text-indigo-900'
                          }`}>{formatPrice(order.total)}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm ${
                            order.payment_status === 'paid' 
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' 
                              : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700'
                          }`}>
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {/* View Receipt */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => generateReceiptPDF(order)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </motion.button>

                            {/* Receive (for pending orders) */}
                            {order.payment_status === 'pending' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => confirmDeliveryReceived(order.id)}
                                disabled={confirmingPayOnDelivery}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-white bg-teal-500 hover:bg-teal-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                              >
                                {confirmingPayOnDelivery ? 'Confirming...' : 'Receive'}
                              </motion.button>
                            )}

                            {/* Download PDF */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => generateReceiptPDF(order, true)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-all"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </motion.button>

                            {/* Delete (for paid orders) */}
                            {order.payment_status === 'paid' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this order? It will be moved to Shopping History.')) {
                                    deleteOrder(order.id);
                                  }
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination - Made more touch-friendly */}
        {recentOrders.length > ordersPerPage && (
          <div className="flex justify-center gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 glass-medium rounded-xl text-sm disabled:opacity-50"
            >
              Previous
            </motion.button>
            <span className="px-4 py-2 glass-strong rounded-xl text-sm">
              Page {currentPage} of {Math.ceil(recentOrders.length / ordersPerPage)}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => 
                Math.min(prev + 1, Math.ceil(recentOrders.length / ordersPerPage))
              )}
              disabled={currentPage === Math.ceil(recentOrders.length / ordersPerPage)}
              className="px-4 py-2 glass-medium rounded-xl text-sm disabled:opacity-50"
            >
              Next
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );

  // Let's also add the badges and other missing render functions
  const renderBadges = () => (
    <div className="glass-strong rounded-2xl p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Your Achievements</h2>
      
      {/* Coming Soon Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-medium rounded-xl p-6 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5" />
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Award className="w-16 h-16 text-teal-500 mx-auto mb-4" />
        </motion.div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Badges Coming Soon!</h3>
        <p className="text-gray-600 mb-6">Track your achievements and unlock special rewards</p>
        
        {/* Preview Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-md mx-auto">
          {[
            { name: 'Quick Learner', icon: '🎯', color: 'from-green-500/10 to-emerald-500/10' },
            { name: 'Top Buyer', icon: '🏆', color: 'from-yellow-500/10 to-orange-500/10' },
            { name: 'Early Bird', icon: '🌟', color: 'from-blue-500/10 to-indigo-500/10' },
            { name: 'Loyal Customer', icon: '💎', color: 'from-purple-500/10 to-pink-500/10' }
          ].map((badge, index) => (
            <motion.div
              key={badge.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`glass-medium rounded-lg p-4 text-center bg-gradient-to-br ${badge.color}`}
            >
              <div className="text-2xl mb-2">{badge.icon}</div>
              <div className="text-xs font-medium text-gray-700">{badge.name}</div>
              <div className="text-xs text-gray-500 mt-1">Coming soon</div>
            </motion.div>
          ))}
        </div>
        
        {/* Notification Sign Up */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 glass-medium rounded-lg p-4 max-w-sm mx-auto"
        >
          <p className="text-sm text-gray-600 mb-3">Get notified when badges are available!</p>
          <button className="w-full py-2 px-4 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors">
            Enable Notifications
          </button>
        </motion.div>
      </motion.div>
    </div>
  );

  const renderProfile = () => (
    <div className="glass-strong rounded-2xl p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Profile Information</h2>
      <div className="space-y-4 sm:space-y-6">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 glass-medium rounded-xl p-4"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <div className="w-24 h-24 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-3xl sm:text-2xl font-bold text-white">{user?.firstName?.charAt(0) || 'U'}</span>
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.div whileHover={{ rotate: 180 }}>
                <Camera size={16} className="text-teal-600" />
              </motion.div>
            </button>
          </motion.div>
          
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{user?.firstName || 'User'}</h3>
            <p className="text-gray-600 text-sm">{user?.email || 'user@example.com'}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
              <span className="inline-flex items-center text-xs font-medium text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">
                <Building2 size={12} className="mr-1" />
                {user?.type || 'institution'}
              </span>
              <span className="inline-flex items-center text-xs font-medium text-green-600 bg-green-100 px-2.5 py-1 rounded-full">
                <CheckCircle size={12} className="mr-1" />
                Verified
              </span>
            </div>
          </div>
        </motion.div>
        
        {/* Profile Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-medium rounded-xl p-4"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input 
                type="text" 
                defaultValue={user?.firstName || ''}
                className="w-full px-4 py-2.5 glass-medium rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-shadow"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input 
                type="email" 
                defaultValue={user?.email || ''}
                className="w-full px-4 py-2.5 glass-medium rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-shadow"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Type</label>
              <select 
                defaultValue={user?.type || 'institution'}
                className="w-full px-4 py-2.5 glass-medium rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-shadow"
              >
                <option value="institution">Institution</option>
                <option value="individual">Individual</option>
                <option value="guest">Guest</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input 
                type="tel" 
                className="w-full px-4 py-2.5 glass-medium rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-shadow"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        </motion.div>

        {/* Additional Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-medium rounded-xl p-4"
        >
          <h4 className="text-sm font-medium text-gray-900 mb-3">Account Security</h4>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 glass-medium rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-teal-600" />
                <span className="text-sm">Change Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 glass-medium rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span className="text-sm">Two-Factor Authentication</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>
        
        {/* Save Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end"
        >
          <EdumallButton 
            variant="primary" 
            size="lg"
            className="w-full sm:w-auto"
          >
            Save Changes
          </EdumallButton>
        </motion.div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="glass-strong rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
            <input 
              type="text" 
              defaultValue="Kampala International School"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Centre Number</label>
            <input 
              type="text" 
              defaultValue="U0001"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
          <input 
            type="email" 
            defaultValue="admin@kampalaschool.ac.ug"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        
        <div className="flex justify-end">
          <EdumallButton variant="primary" size="md">
            Save Changes
          </EdumallButton>
        </div>
      </div>
    </div>
  );

  // Shopping History section
  const renderHistory = () => (
    <div className="glass-strong rounded-2xl p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Shopping History</h2>
      <div className="space-y-4 sm:space-y-6">
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search history..."
          className="px-4 py-2 glass-medium rounded-xl text-sm w-full sm:flex-1"
          onChange={(e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = shoppingHistory.filter(order => 
              order.id.toString().includes(searchTerm) ||
              order.items.some(item => item.product.name.toLowerCase().includes(searchTerm))
            );
            setRecentOrders(filtered);
          }}
        />

        {/* Mobile View (Hidden on large screens) */}
        <div className="space-y-3 lg:hidden">
          {shoppingHistory.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 glass-medium rounded-xl"
            >
              <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No items in history</p>
            </motion.div>
          ) : (
            shoppingHistory.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl p-4 space-y-3 border border-gray-100/50 shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-gray-50/80 to-white/90"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
                <div className="glass-medium rounded-lg p-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm py-1">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-medium">Total: {formatPrice(order.total)}</span>
                  <button
                    onClick={() => generateReceiptPDF(order, false)}
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                  >
                    View Receipt
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Desktop Table View (Hidden on mobile) */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto rounded-xl border border-gray-100/50 shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {shoppingHistory.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">#{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {order.items.map(item => item.product.name).join(', ')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.payment_status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => generateReceiptPDF(order, false)}
                        className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="glass-strong rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing & Payments</h2>
      <div className="space-y-6">
        <div className="glass-medium rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          
          <div className="flex gap-4 mb-6">
            <button className="flex items-center gap-2 px-4 py-2 border-2 border-teal-500 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors">
              <CreditCard size={20} />
              Add Payment Method
            </button>
          </div>

          <p className="text-gray-600">No payment methods added yet.</p>
        </div>

        <div className="glass-medium rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
          <p className="text-gray-600">Your billing history will appear here once you make your first purchase.</p>
        </div>

        <div className="glass-medium rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
              <input 
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter your street address"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Postal code"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <EdumallButton variant="primary" size="md">
                Save Address
              </EdumallButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Receipt Preview Modal component
  const ReceiptPreviewModal: React.FC = () => {
    if (!showReceiptModal || !receiptUrl || !selectedOrder) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4"
        style={{ overflowY: 'auto' }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[95vh] flex flex-col"
          style={{ minWidth: '0', width: '100%', maxWidth: '480px', margin: '0 auto' }}
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
            <span className="font-semibold text-lg">Receipt Preview</span>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowReceiptModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          {/* PDF Preview */}
          <div className="flex-1 overflow-auto p-2 sm:p-4 bg-gray-50 flex items-center justify-center">
            <iframe
              src={receiptUrl}
              title="Receipt Preview"
              style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '8px', background: '#fff' }}
            />
          </div>
          {/* Actions */}
          <div className="p-2 sm:p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              onClick={() => generateReceiptPDF(selectedOrder!, true)}
            >
              Download PDF
            </button>
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              onClick={() => setShowReceiptModal(false)}
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Render sections
  const renderOverview = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Cards */}
      {error || ordersError || statsError ? (
        <div className="glass-strong rounded-2xl p-6 space-y-2">
          {error && <p className="text-red-600">{error}</p>}
          {ordersError && <p className="text-orange-600">{ordersError}</p>}
          {statsError && <p className="text-orange-600">{statsError}</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {isLoading ? (
            // Loading skeletons for stats
            Array(4).fill(null).map((_, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-medium rounded-2xl p-4 sm:p-6 animate-pulse"
              >
                <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </motion.div>
            ))
          ) : (
            stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-medium rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 bg-teal-50 rounded-xl">
                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                  </div>
                  <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
                    stat.positive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            ))
          )}
        </div>
      )}
      {/* Recent Orders */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {showHistory ? 'Shopping History' : 'Recent Orders'}
            </h2>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl transition-all whitespace-nowrap"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">{showHistory ? 'View Current Orders' : 'View Past Orders'}</span>
                <span className="sm:hidden">History</span>
              </motion.button>

              {!showHistory && allOrders.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (window.confirm('Clear all orders? They will be moved to Shopping History.')) {
                      clearAllOrders();
                    }
                  }}
                  className="flex items-center gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all whitespace-nowrap"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Archive All</span>
                  <span className="sm:hidden">Archive</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Order filters */}
          <div className="flex gap-2 mb-4">
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              onChange={(e) => {
                const filtered = allOrders.filter(order => 
                  e.target.value === 'all' ? true : order.payment_status === e.target.value
                );
                setRecentOrders(filtered);
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {isLoading ? (
            // Loading skeletons
            Array(3).fill(null).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 glass-medium rounded-xl animate-pulse">
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-5 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            recentOrders.map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-xl border border-gray-100/50 shadow-sm hover:shadow-md transition-all relative overflow-hidden
                  ${order.id % 4 === 0 ? 'from-gray-50/80 to-white/90' : 
                    order.id % 4 === 1 ? 'from-blue-50/80 to-white/90' : 
                    order.id % 4 === 2 ? 'from-teal-50/80 to-white/90' : 
                    'from-indigo-50/80 to-white/90'} 
                  bg-gradient-to-br backdrop-blur-sm`}
              >
                <div className="flex flex-col space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${
                      order.id % 4 === 0 ? 'text-gray-900' :
                      order.id % 4 === 1 ? 'text-blue-900' :
                      order.id % 4 === 2 ? 'text-teal-900' :
                      'text-indigo-900'
                    }`}>
                      #{order.id.toString().padStart(3, '0')}
                    </h3>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm ${
                      order.payment_status === 'paid' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' 
                        : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700'
                    }`}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()} • {order.items.length} items
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {order.items.map(item => item.product.name).join(', ')}
                    </p>
                  </div>

                  {/* Price Section */}
                  <div className="mt-2 pt-2 border-t border-gray-100/70">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Total Amount</span>
                        <span className={`text-lg font-bold ${
                          order.id % 4 === 0 ? 'text-gray-900' :
                          order.id % 4 === 1 ? 'text-blue-900' :
                          order.id % 4 === 2 ? 'text-teal-900' :
                          'text-indigo-900'
                        }`}>
                          {formatPrice(order.total)}
                        </span>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => generateReceiptPDF(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-auto justify-center sm:justify-start"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </motion.button>
                        {order.payment_status === 'paid' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this order? It will be moved to Shopping History.')) {
                                deleteOrder(order.id)
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-auto justify-center sm:justify-start"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      {showReceiptModal && receiptUrl && selectedOrder && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => {
            if (receiptUrl) {
              URL.revokeObjectURL(receiptUrl);
            }
            setShowReceiptModal(false);
            setSelectedOrder(null);
            setReceiptUrl(null);
          }}
          receiptUrl={receiptUrl}
          order={selectedOrder}
          onDownload={() => generateReceiptPDF(selectedOrder, true)}
        />
      )}
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center max-w-2xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Welcome back, {user?.firstName || 'User'}
            </h1>
            <p className="text-lg text-gray-600 mx-auto max-w-xl leading-relaxed">
              Manage your orders, track deliveries, and discover new products
            </p>
          </motion.div>
          
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden mb-4 px-4">
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full flex items-center justify-between px-5 py-3.5 glass-strong rounded-xl text-gray-900 hover:shadow-lg transition-all relative overflow-hidden group bg-white/80 backdrop-blur-lg border border-gray-100/50"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <motion.div
                    className="absolute w-6 h-0.5 bg-gray-900 rounded-full"
                    animate={{
                      rotate: isMobileMenuOpen ? 45 : 0,
                      y: isMobileMenuOpen ? 0 : -4
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  />
                  <motion.div
                    className="absolute w-6 h-0.5 bg-gray-900 rounded-full"
                    animate={{
                      opacity: isMobileMenuOpen ? 0 : 1,
                      x: isMobileMenuOpen ? 20 : 0
                    }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.div
                    className="absolute w-6 h-0.5 bg-gray-900 rounded-full"
                    animate={{
                      rotate: isMobileMenuOpen ? -45 : 0,
                      y: isMobileMenuOpen ? 0 : 4
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  />
                </div>
                <span className="font-medium text-base">Menu</span>
              </div>
              <motion.div
                className="flex items-center gap-2"
                animate={{ 
                  rotate: isMobileMenuOpen ? 180 : 0,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                <span className="text-sm text-gray-500">
                  {isMobileMenuOpen ? 'Close' : 'Open'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </motion.div>
              {/* Hover effect background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-teal-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ zIndex: -1 }}
                initial={false}
                animate={{
                  opacity: isMobileMenuOpen ? 1 : 0
                }}
              />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Desktop Menu - Always visible on large screens */}
              <div className="hidden lg:block">
                <div className="glass-strong rounded-2xl p-6 sticky top-24 backdrop-blur-lg">
                  <nav className="space-y-3">
                    {sidebarItems.map((item, index) => (
                      <motion.button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all ${
                          activeTab === item.id
                            ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                            : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'
                        }`}
                        whileHover={{ 
                          scale: 1.02,
                          transition: { type: "spring", stiffness: 400 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <item.icon size={22} />
                        <span className="font-medium">{item.label}</span>
                        {activeTab === item.id && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-400 rounded-xl -z-10"
                            layoutId="activeTab"
                            transition={{ type: "spring", bounce: 0.2 }}
                          />
                        )}
                      </motion.button>
                    ))}
                    <motion.button 
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-5 py-4 rounded-xl text-left text-red-600 hover:bg-red-50 hover:shadow-md transition-all mt-6"
                      whileHover={{ 
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 400 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut size={22} />
                      <span className="font-medium">Sign Out</span>
                    </motion.button>
                  </nav>
                </div>
              </div>

              {/* Mobile Menu */}
              <div className="lg:hidden">
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="glass-strong rounded-2xl p-4 mb-6 backdrop-blur-lg"
                  >
                    <nav className="flex flex-col items-center space-y-2">
                      {/* Sidebar navigation */}
                      {sidebarItems.map((item, index) => (
                        <motion.button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all ${
                            activeTab === item.id
                              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                              : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <item.icon size={22} />
                          <span className="font-medium">{item.label}</span>
                        </motion.button>
                      ))}
                      <motion.button 
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-5 py-4 rounded-xl text-left text-red-600 hover:bg-red-50 hover:shadow-md transition-all mt-6"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <LogOut size={22} />
                        <span className="font-medium">Sign Out</span>
                      </motion.button>
                    </nav>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'badges' && renderBadges()}
              {activeTab === 'profile' && renderProfile()}
              {activeTab === 'settings' && renderSettings()}
              {activeTab === 'orders' && renderOrders()}
              {activeTab === 'history' && renderHistory()}
              {activeTab === 'billing' && renderBilling()}
              {activeTab === 'labs' && (
                <Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                  </div>
                }>
                  <LabInventory />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;