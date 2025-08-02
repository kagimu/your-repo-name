import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserData } from 'jspdf';




// Define jsPDF with autoTable extension
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: unknown) => void;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
    jsPDFAPI: {
      qrcode: (text: string, options?: { padding?: number }) => string;
    };
  }
}
import { 
  ShoppingBag, 
  TrendingUp, 
  Award, 
  Bell,
  Settings,
  User,
  CreditCard,
  LogOut
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { toast } from 'react-toastify';
import { CustomCursor } from '@/components/CustomCursor';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface DashboardStat {
  label: string;
  value: number;
  change: number | string;
  positive: boolean;
  icon: LucideIcon;
}

type LucideIcon = React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement> & { title?: string, size?: number | string }>;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [lastStatsUpdate, setLastStatsUpdate] = useState<number>(0);
  const [cachedStats, setCachedStats] = useState<ApiResponse<DashboardStats> | null>(null);
  const STATS_CACHE_DURATION = 60000; // Cache stats for 1 minute
  const [confirmingPayOnDelivery, setConfirmingPayOnDelivery] = useState(false);
   const [confirmMessage, setConfirmMessage] = useState<string | null>(null);
    const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);


  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your dashboard');
        logout();
        navigate('/');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      // Clear previous errors
      setOrdersError(null);
      setStatsError(null);
      setError(null);
      
      // Set loading states
      setIsOrdersLoading(true);
      setIsStatsLoading(true);
      setIsLoading(true);

      // Function to fetch orders with retry logic
      const fetchOrders = async (retries = 2): Promise<{ data: Order[] }> => {
        try {
          const response = await axios.get<{ data: Order[], status: number, message: string }>(
            `https://edumallug.com/api/orders`,
            { 
              timeout: 3000, 
              headers,
              params: { user_id: user.id }
            }
          );
          
          // Extract just the orders array from the response
          return { data: response.data.data };
        } catch (error) {
          if (retries > 0 && error.code === 'ECONNABORTED') {
            console.log(`Retrying orders fetch, ${retries} attempts remaining`);
            return fetchOrders(retries - 1);
          }
          throw error;
        }
      };

      // Fetch orders and calculate stats from it
      const fetchOrdersPromise = fetchOrders()
        .then(data => {
          console.log('Orders API Response:', {
            status: 'success',
            data: data,
            structure: data ? Object.keys(data) : null
          });
          setOrdersError(null);
          return data;
        })
        .catch(err => {
          console.error('Error fetching orders:', {
            error: err,
            status: err.response?.status,
            data: err.response?.data,
            message: err.message
          });
          setOrdersError(err.response?.data?.message || 'Failed to load orders. Please try again.');
          return null;
        })
        .finally(() => {
          setIsOrdersLoading(false);
          setIsStatsLoading(false); // Stats are derived from orders
        });

      try {
        const ordersResponse = await fetchOrdersPromise;
        
        console.log('Orders Response:', ordersResponse);
          
        // Process orders data and calculate statistics
        if (!ordersResponse) {
          console.error('No response received from orders API');
          setOrdersError('No response received from orders API');
          return;
        }

        // Backend returns { data: Order[], status: number, message: string }
        const ordersData = ordersResponse.data;
        if (!ordersData || !Array.isArray(ordersData)) {
          console.error('Invalid orders data format:', ordersData, 'Full response:', ordersResponse);
          setOrdersError('Invalid data format received from server');
          return;
        }

        console.log('Successfully parsed orders:', ordersData.length, 'orders found');
        setAllOrders(ordersData);
        setRecentOrders(ordersData); // Set all orders instead of just 3

        // Calculate accurate stats from orders
        const totalOrders = ordersData.length;
        const pendingOrders = ordersData.filter(o => o.payment_status === 'pending').length;
        
        // Calculate the percentage change in orders for the last 30 days
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        const recentOrders = ordersData.filter(order => 
          new Date(order.created_at) >= thirtyDaysAgo
        ).length;
        const previousOrders = ordersData.filter(order => 
          new Date(order.created_at) < thirtyDaysAgo
        ).length;
        
        const ordersChange = previousOrders 
          ? ((recentOrders - previousOrders) / previousOrders) * 100 
          : 0;

        setStats([
          {
            label: 'Total Orders',
            value: totalOrders,
            change: `${ordersChange >= 0 ? '+' : ''}${ordersChange.toFixed(0)}%`,
            positive: ordersChange >= 0,
            icon: ShoppingBag
          },
          {
            label: 'Pending Deliveries',
            value: pendingOrders,
            change: `${pendingOrders}`,
            positive: pendingOrders < totalOrders * 0.5,
            icon: TrendingUp
          },
          {
            label: 'Badges Earned',
            value: 0, // Placeholder for future feature
            change: '0',
            positive: true,
            icon: Award
          },
          {
            label: 'Notifications',
            value: 0, // Placeholder for future feature
            change: '0',
            positive: false,
            icon: Bell
          }
        ]);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          switch (err.response.status) {
            case 401:
              setError('Authentication failed. Please log in again.');
              logout();
              navigate('/');
              break;
            case 403:
              setError('You do not have permission to access this data.');
              break;
            case 404:
              setError('The requested data could not be found.');
              break;
            case 500:
              setError('Server error. Please try again later.');
              break;
            default:
              setError('Failed to load dashboard data. Please try again.');
          }
        } else if (err.request) {
          // The request was made but no response was received
          setError('Unable to connect to the server. Please check if the backend is running.');
        } else {
          // Something happened in setting up the request
          setError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id, logout, navigate, lastStatsUpdate, cachedStats]);

 const confirmDeliveryReceived = async (orderId: number) => {
  try {
    setConfirmingPayOnDelivery(true);
    const token = localStorage.getItem('token');

    const response = await axios.post(
      `https://edumallug.com/api/checkout/confirm-pay-on-delivery`,
      { order_id: orderId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.order?.payment_status === 'paid') {
      toast.success('Payment confirmed successfully! ✅');
      
      // Update UI
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


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  const generateReceiptPDF = async (order: Order) => {
  try {
    const doc = new jsPDF();
    let yPos = 20;
    const margin = 14;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);
    doc.text("EDUMALL RECEIPT", margin, yPos);

    // Logo
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = window.location.origin + '/edumall-logo.png';

      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
        if (logoImg.complete) resolve(null);
      });

      if (logoImg.complete) {
        doc.addImage(logoImg, 'PNG', 160, 10, 30, 15); // Better contained
      }
    } catch (logoError) {
      console.warn('Logo load failed:', logoError);
    }

    yPos += 15;
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Order #: ${order.id.toString().padStart(3, '0')}`, margin, yPos);
    yPos += 6;
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, margin, yPos);
    yPos += 6;
    doc.text(`Time: ${new Date(order.created_at).toLocaleTimeString()}`, margin, yPos);
    yPos += 10;

    // Customer Info box
    doc.setDrawColor(200);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPos, 180, 25, 'FD'); // F = fill, D = draw

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Customer Information`, margin + 2, yPos + 6);
    doc.setFontSize(9);
    doc.text(`Name: ${user?.firstName || 'Guest'} {${user?.lastName || ''}}`, margin + 2, yPos + 12);
    doc.text(`Email: ${user?.email || 'N/A'}`, margin + 2, yPos + 17);
    doc.text(`Account Type: ${user?.accountType || 'Standard'}`, margin + 2, yPos + 22);

    yPos += 35;

    // Items Table
    const tableData = order.items.map((item, i) => [
      i + 1,
      item.product.name,
      item.quantity.toString(),
      formatPrice(item.price),
      formatPrice(item.price * item.quantity)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Item', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 150, 136],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [40, 40, 40],
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 70 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
      },
      margin: { left: margin, right: margin },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 120;

    // Totals
    const total = order.total;
    doc.setFontSize(11);
    doc.setTextColor(0, 128, 128);
    doc.text(`Total Amount:`, 130, finalY + 10);
    doc.text(formatPrice(total), 200, finalY + 10, { align: 'right'});

    // Payment Status
    doc.setFontSize(10);
    doc.setTextColor(
      order.payment_status === 'paid' ? 34 : 240,
      order.payment_status === 'paid' ? 197 : 180,
      order.payment_status === 'paid' ? 94 : 54
    );
    doc.text(`Payment Status: ${order.payment_status.toUpperCase()}`, margin, finalY + 20);

    // Terms & Footer
    const termsY = finalY + 35;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Terms & Conditions:', margin, termsY);
    doc.text('1. All sales are final. No refunds after 2 days.', margin, termsY + 6);
    doc.text('2. Retain this receipt for warranty purposes.', margin, termsY + 12);

    doc.setTextColor(0, 128, 128);
    doc.setFontSize(10);
    doc.text('Thank you for your purchase!', doc.internal.pageSize.width / 2, termsY + 25, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Support: contact@edumall.com | Tel: +256 772 113800, +256 781 978910',
      doc.internal.pageSize.width / 2, termsY + 31, { align: 'center' });

    doc.save(`receipt-order-${order.id}.pdf`);
    toast.success('Receipt downloaded successfully! 🧾');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate receipt. Please try again.');
  }
};


  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      {error || ordersError || statsError ? (
        <div className="glass-strong rounded-2xl p-6 space-y-2">
          {error && <p className="text-red-600">{error}</p>}
          {ordersError && <p className="text-orange-600">{ordersError}</p>}
          {statsError && <p className="text-orange-600">{statsError}</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeletons for stats
            Array(4).fill(null).map((_, index) => (
              <div key={index} className="glass-medium rounded-2xl p-6 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : (
            // Actual stats data
            stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-medium rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8 text-teal-600" />
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    stat.positive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Recent Orders */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <EdumallButton 
            variant="ghost" 
            size="sm"
            onClick={() => setActiveTab('orders')}
          >
            View All
          </EdumallButton>
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
                setRecentOrders(filtered); // Show all filtered orders
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {isLoading ? (
            // Loading skeletons for orders
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
              <div key={order.id} className="flex items-center justify-between p-4 glass-medium rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">#{order.id.toString().padStart(3, '0')}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()} • {order.items.length} items
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items.map(item => item.product.name).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.payment_status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="glass-strong rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">All Orders</h2>
      
      <div className="space-y-6">
        {/* Order filters */}
        <div className="flex flex-wrap gap-4">
          <select 
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
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
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm flex-grow"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              const filtered = allOrders.filter(order => 
                order.id.toString().includes(searchTerm) ||
                order.status.toLowerCase().includes(searchTerm)
              );
              setRecentOrders(filtered);
            }}
          />
        </div>

        {/* Orders table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Items</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders
                .slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage)
                .map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">#{order.id.toString().padStart(3, '0')}</div>
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
                    <div className="text-sm text-gray-900">{order.items.length} items</div>
                    <div className="text-xs text-gray-500 max-w-xs truncate">
                      {order.items.map(item => `${item.product.name} (${item.quantity})`).join(', ')}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{formatPrice(order.total)}</div>
                    <div className="text-xs text-gray-500">
                      {order.items.reduce((acc, item) => acc + item.quantity, 0)} units
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-3">
                      {order.payment_status === 'pending' ? (
                        <button
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors"
                            onClick={() => confirmDeliveryReceived(order.id)}
                            disabled={confirmingPayOnDelivery}
                        >
                            {confirmingPayOnDelivery ? 'Confirming...' : 'Receive Order'}
                        </button>
                        ) : (
                        <button
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition-colors"
                            onClick={() => console.log('Mark as done:', order.id)}
                        >
                            Done
                        </button>
                        )}

                      <button
                        className="px-3 py-1 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowReceiptModal(true);
                        }}
                      >
                        Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Receipt Modal */}
        {showReceiptModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Order Receipt</h3>
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6 print:space-y-4">
                {/* Header with Logo */}
                <div className="flex justify-between items-start">
                  <div>
                    <img src="/edumall-logo.png" alt="Edumall Logo" className="h-12 mb-2" />
                    <p className="text-sm text-gray-600">Your Learning Partner</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-900">RECEIPT</h2>
                    <p className="text-sm text-gray-600">#{selectedOrder.id.toString().padStart(3, '0')}</p>
                  </div>
                </div>

                {/* Order and Customer Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Information</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>DATE: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                      <p>TIME: {new Date(selectedOrder.created_at).toLocaleTimeString()}</p>
                      <p>STATUS: {selectedOrder.payment_status.toUpperCase()}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>NAME: {user?.firstName || 'Guest'} {user?.lastName || 'User'}</p>
                      <p>EMAIL: {user?.email || 'N/A'}</p>
                      <p>ACCOUNT YPE: {user?.accountType || 'Standard'}</p>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Item</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Quantity</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Price</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.product.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{formatPrice(item.price)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={2} />
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">Subtotal</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatPrice(selectedOrder.total)}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} />
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">Delivery fee</td>
                        <td className="px-4 py-2 text-sm text-gray-900">To be confirmed by Courier</td>
                      </tr>
                      <tr className="bg-gray-100">
                        <td colSpan={2} />
                        <td className="px-4 py-2 text-sm font-bold text-gray-900">Total</td>
                        <td className="px-4 py-2 text-sm font-bold text-gray-900">{formatPrice(selectedOrder.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Terms and Support */}
                <div className="text-xs text-gray-600 space-y-2">
                  <p className="font-medium">Terms & Conditions:</p>
                  <p>1. All sales are final. No refunds after 30 days.</p>
                  <p>2. Please retain this receipt for warranty purposes.</p>
                  <div className="text-center mt-4">
                    <p>For support: support@edumall.com | Tel: +256 700 000000</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setShowReceiptModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setIsGeneratingPDF(true);
                      generateReceiptPDF(selectedOrder)
                        .finally(() => setIsGeneratingPDF(false));
                    }}
                    disabled={isGeneratingPDF}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50"
                  >
                    {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {recentOrders.length > ordersPerPage && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.ceil(recentOrders.length / ordersPerPage) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 border rounded-lg text-sm ${
                    currentPage === index + 1
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(recentOrders.length / ordersPerPage)))}
                disabled={currentPage === Math.ceil(recentOrders.length / ordersPerPage)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
  const renderBadges = () => (
    <div className="glass-strong rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Achievements</h2>
      <div className="text-center py-4">
        <p className="text-gray-600">Badges feature coming soon!</p>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="glass-strong rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{user?.name?.charAt(0) || 'U'}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{user?.name || 'User'}</h3>
            <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
            <span className="inline-block mt-1 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {user?.type || 'institution'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input 
              type="text" 
              defaultValue={user?.name || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              defaultValue={user?.email || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
          <select 
            defaultValue={user?.type || 'institution'}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="institution">Institution</option>
            <option value="individual">Individual</option>
            <option value="guest">Guest</option>
          </select>
        </div>
        
        <div className="flex justify-end">
          <EdumallButton variant="primary" size="md">
            Update Profile
          </EdumallButton>
        </div>
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

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <CustomCursor />
      <Navbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName || user?.lastName || 'User'}
            </h1>
            <p className="text-lg text-gray-600">
              Manage your orders, track deliveries, and discover new products
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-strong rounded-2xl p-6 sticky top-24">
                <nav className="space-y-2">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                        activeTab === item.id
                          ? 'bg-teal-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </button>
                  ))}
                  
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-colors mt-6"
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'badges' && renderBadges()}
              {activeTab === 'profile' && renderProfile()}
              {activeTab === 'settings' && renderSettings()}
              {activeTab === 'orders' && renderOrders()}
              {activeTab === 'billing' && renderBilling()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
