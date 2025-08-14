import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
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
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { items: cartItems, clearCart, mergeGuestCart, pendingCheckoutDetails, savePendingCheckout, clearPendingCheckout } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState(cartItems || []);

  // Effect to handle cart initialization and cleanup
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

    // Cleanup function to ensure cart is cleared
    return () => {
      const cleanup = async () => {
        try {
          if (currentStep === 'confirmation') {
            // Clear everything
            await clearCart();
            localStorage.removeItem('guest_cart');
            localStorage.removeItem('pendingCheckoutDetails');
            clearPendingCheckout();
            setItems([]);
          }
        } catch (err) {
          console.error('Cleanup error:', err);
        }
      };
      cleanup();
    };
  }, [state, isAuthenticated, pendingCheckoutDetails, mergeGuestCart, clearPendingCheckout, currentStep, clearCart]);

  // Prevent checkout if no items
  if (!items || !items.length) return <Navigate to="/cart" replace />;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + deliveryFee;

  /** Step 1: Delivery Details */
  const handleDetailsSubmit = (details: DeliveryDetails) => {
    const sanitized: DeliveryDetails = {
      ...details,
      fullName: details.fullName?.trim() || '',
      email: details.email?.trim() || '',
      phone: details.phone?.trim() || '',
      address: details.address?.trim() || '',
      city: details.city?.trim() || '',
      district: details.district?.trim() || '',
      postalCode: details.postalCode?.trim() || '',
      instructions: details.instructions?.trim() || '',
    };

    setDeliveryDetails(sanitized);
    setDeliveryFee(90000); // placeholder fee

    if (!isAuthenticated) {
      savePendingCheckout({ items, deliveryDetails: sanitized });
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
      // 1. First create the order
      const orderPayload = {
        customer_name: deliveryDetails.fullName,
        customer_email: deliveryDetails.email,
        customer_phone: deliveryDetails.phone,
        address: [
          {
            street: deliveryDetails.address,
            city: deliveryDetails.city,
            district: deliveryDetails.district,
            postal_code: deliveryDetails.postalCode,
            coordinates: deliveryDetails.coordinates,
            instructions: deliveryDetails.instructions,
          },
        ],
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: paymentData.method,
        payment_status: paymentData.status === 'success' ? 'paid' : 'pending',
      };

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post<OrderResponse>(
        'https://edumall-main-khkttx.laravel.cloud/api/orders',
        orderPayload,
        { headers }
      );

      const generatedOrderId = response.data.order_id || `EDU${Date.now()}`;
      setOrderId(generatedOrderId);

      // Clear the cart and navigate
      try {
        // Set order confirmation first
        setCurrentStep('confirmation');
        
        // Clear cart using the context method (which now handles both backend and local)
        await clearCart();
        
        // Clear all local state
        setItems([]);
        clearPendingCheckout();

        // Show success message and navigate
        toast.success('Order placed successfully! Your cart has been cleared.');
        
        // Navigate after a short delay to ensure state updates
        setTimeout(() => {
          navigate('/Dashboard', { 
            state: { 
              orderId: generatedOrderId,
              orderStatus: paymentData.method === 'pay_on_delivery' ? 'pending' : 'paid'
            },
            replace: true
          });
        }, 500);
      } catch (err) {
        console.error('Error during cart clearing:', err);
        // Even if cart clearing fails, still navigate but show warning
        toast.warning('Order placed but cart clearing had issues. Please refresh the page.');
        navigate('/Dashboard', { 
          state: { 
            orderId: generatedOrderId,
            orderStatus: paymentData.method === 'pay_on_delivery' ? 'pending' : 'paid'
          },
          replace: true
        });
      }
      toast.success('Order placed successfully! Your cart has been cleared.');
      
      // Use setTimeout to ensure state updates have propagated
      setTimeout(() => {
        navigate('/Dashboard', { 
          state: { 
            orderId: generatedOrderId,
            orderStatus: paymentData.method === 'pay_on_delivery' ? 'pending' : 'paid'
          },
          replace: true
        });
      }, 100);
    } catch (err) {
      console.error('Order or cart clearing failed:', err);
      toast.error('There was an issue processing your order. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative">
      <CustomCursor />
      <Navbar />

      <main className="pt-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <Link to="/cart" className="text-blue-600 hover:underline flex items-center mb-6">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cart
            </Link>

            {!isAuthenticated && (
              <div className="p-4 bg-yellow-50 border border-yellow-300 rounded mb-4 text-yellow-700">
                You are checking out as a guest. Your order will be processed, but your cart will not be saved.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                {currentStep === 'details' && (
                  <DeliveryFormWithMaps
                    onDetailsSubmit={handleDetailsSubmit}
                    user={user}
                    defaultValues={deliveryDetails}
                     openCageApiKey="be6ffe3a1191428ba1127565d1b9f62c"
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
                  <div className="text-center p-6 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-bold text-green-600 mb-2">Order Confirmed</h2>
                    <p className="text-gray-700 mb-4">Your order has been placed successfully.</p>
                    <p className="text-sm text-gray-600">Order ID: {orderId}</p>
                    <Link to="/categories">
                      <EdumallButton className="mt-6">Continue Shopping</EdumallButton>
                    </Link>
                  </div>
                )}
              </div>

              <OrderSummary
                items={items}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                total={total}
                deliveryDetails={deliveryDetails}
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
