import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { CustomCursor } from '@/components/CustomCursor';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import PaymentOptions from '@/components/checkout/PaymentOptions';
import { DeliveryFormWithMaps } from '@/components/checkout/DeliveryFormWithMaps';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { DeliveryDetails } from '@/contexts/cart-types';
import axios from 'axios';
import { toast } from 'sonner';

interface PaymentDetails {
  method: string;
  status: string;
  amount?: number;
  transactionId?: string;
  reference?: string;
}

interface OrderResponse {
  order_id: string;
}

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { items: cartItems, clearCart, mergeGuestCart, pendingCheckoutDetails, savePendingCheckout, clearPendingCheckout } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState(cartItems || []);

  // Format prices for display
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(price);

  // Initialize cart and pending checkout
  useEffect(() => {
    const initCart = async () => {
      if (state?.items?.length) {
        setItems(state.items);
      } else if (isAuthenticated && pendingCheckoutDetails) {
        setItems(pendingCheckoutDetails.items || []);
        setDeliveryDetails(pendingCheckoutDetails.deliveryDetails || null);
        setCurrentStep('payment');
        await mergeGuestCart();
        clearPendingCheckout();
      } else if (!isAuthenticated && pendingCheckoutDetails?.items?.length) {
        setItems(pendingCheckoutDetails.items);
        setDeliveryDetails(pendingCheckoutDetails.deliveryDetails || null);
      }
    };

    initCart();

    // Cleanup after confirmation
    return () => {
      if (currentStep === 'confirmation') {
        clearCart();
        localStorage.removeItem('guest_cart');
        localStorage.removeItem('pendingCheckoutDetails');
        clearPendingCheckout();
        setItems([]);
      }
    };
  }, [state, isAuthenticated, pendingCheckoutDetails, mergeGuestCart, clearPendingCheckout, currentStep, clearCart]);

  if (!items || !items.length) return <Navigate to="/cart" replace />;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + deliveryFee;

  /** Step 1: Delivery Details */
  const handleDetailsSubmit = (details: any) => {
    // Save sanitized delivery info
    setDeliveryDetails(details);
    setDeliveryFee(details.deliveryFee);
    setDistanceKm(details.distanceKm);

    if (!isAuthenticated) {
      savePendingCheckout({ items, deliveryDetails: details });
    }

    setCurrentStep('payment');
  };

  /** Step 2: Payment */
  const handlePaymentComplete = async (paymentData: PaymentDetails) => {
    if (!deliveryDetails) {
      alert('Delivery details missing.');
      return;
    }

    setIsProcessing(true);
    setPaymentDetails(paymentData);

    try {
    const payload = {
        customer_name: deliveryDetails.fullName,
        customer_email: deliveryDetails.email,
        customer_phone: deliveryDetails.phone,
        address: [
          {
            street: deliveryDetails.address,
            city: deliveryDetails.city,
            district: deliveryDetails.district,
            postal_code: deliveryDetails.postalCode || '',
            coordinates: `${deliveryDetails.coordinates.lat},${deliveryDetails.coordinates.lng}`, // lat,lng as string
            instructions: deliveryDetails.instructions || '',
          },
        ],
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        subtotal: Number(subtotal),
        distance_km: Number(distanceKm),
        delivery_fee: Number(deliveryFee),
        total: Number(total),
        payment_method: 'cod',
        payment_status: 'pending',
      };


      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post<OrderResponse>('https://backend-main.laravel.cloud/api/orders', payload, { headers });

      const generatedOrderId = response.data.order_id || `EDU${Date.now()}`;
      setOrderId(generatedOrderId);

      setCurrentStep('confirmation');
      await clearCart();
      setItems([]);
      clearPendingCheckout();

      toast.success('Order placed successfully!');
      navigate('/Dashboard?section=orders', {
        state: { orderId: generatedOrderId, orderStatus: paymentData.method === 'pay_on_delivery' ? 'pending' : 'paid', activeSection: 'orders' },
        replace: true,
      });
    } catch (err) {
      console.error('Order or cart clearing failed:', err);
      toast.error('There was an issue processing your order. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative">
      <Navbar />

      <main className="pt-28 px-4 sm:px-6 lg:px-8 pb-32 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <Link to="/cart" className="text-blue-600 hover:underline flex items-center mb-4 sm:mb-0">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cart
              </Link>
              <div className="flex items-center justify-center space-x-4 md:hidden">
                {['details', 'payment', 'confirmation'].map((step) => (
                  <div key={step} className={`w-3 h-3 rounded-full ${currentStep === step ? 'bg-teal-500' : 'bg-gray-300'}`} />
                ))}
              </div>
            </div>

            {!isAuthenticated && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-yellow-50 border border-yellow-300 rounded-xl mb-6 text-yellow-700 text-sm md:text-base">
                You are checking out as a guest. Your order will not be saved to an account.
              </motion.div>
            )}

            {/* Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                {currentStep === 'details' && (
                  <DeliveryFormWithMaps
                    onDetailsSubmit={handleDetailsSubmit}
                    user={user}
                    defaultValues={deliveryDetails}
                    openCageApiKey="d4e8d976350b449abd4e4988c364748d"
                  />
                )}

                {currentStep === 'payment' && (
                  <PaymentOptions
                    onPaymentComplete={handlePaymentComplete}
                    subtotal={subtotal}
                    deliveryFee={deliveryFee}
                    customer={{
                      name: deliveryDetails?.fullName || '',
                      email: deliveryDetails?.email || '',
                      phone: deliveryDetails?.phone || '',
                    }}
                    items={items}
                  />
                )}

                {currentStep === 'confirmation' && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-6 bg-white rounded-xl shadow-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-green-600 mb-2">Order Confirmed!</h2>
                    <p className="text-gray-700 mb-4">Your order has been placed successfully.</p>
                    <p className="text-sm text-gray-600 mb-6">Order ID: {orderId}</p>
                    <Link to="/categories">
                      <EdumallButton className="w-full sm:w-auto">Continue Shopping</EdumallButton>
                    </Link>
                  </motion.div>
                )}
              </div>

              <div className="hidden md:block">
                <OrderSummary items={items} subtotal={subtotal} deliveryFee={deliveryFee} total={total} deliveryDetails={deliveryDetails} />
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
