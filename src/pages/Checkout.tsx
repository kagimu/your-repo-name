// Checkout.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Package } from 'lucide-react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { CustomCursor } from '@/components/CustomCursor';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { GuestCheckout } from '@/components/checkout/GuestCheckout';
import PaymentOptions from '@/components/checkout/PaymentOptions';
import { DeliveryFormWithMaps } from '@/components/checkout/DeliveryFormWithMaps';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { PreLoader } from '@/components/ui/PreLoader';
import axios from 'axios';

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [deliveryDetails, setDeliveryDetails] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmingPayOnDelivery, setConfirmingPayOnDelivery] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<any>(null);

  const { items, clearCart } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const { state } = useLocation();

  if (!state?.subtotal) return <Navigate to="/cart" replace />;

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const total = subtotal; // Just show subtotal as total
  

  useEffect(() => {
    const checkPending = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/orders/pending', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.pending) {
          setPendingOrder({
            orderId: res.data.order_id,
            message: 'You have a pending order. Please confirm payment before proceeding.',
          });
        }
      } catch (error) {
        console.error('Pending check failed:', error);
      }
    };

    if (isAuthenticated) checkPending();
  }, [isAuthenticated, token]);

  const handleDetailsSubmit = (details: any) => {
    setDeliveryDetails(details);
    setCurrentStep('payment');
  };

  const handlePaymentComplete = async (paymentData: any) => {
    if (pendingOrder) {
      alert('You have a pending order. Please complete or confirm it before placing a new one.');
      return;
    }

    setIsProcessing(true);
    setPaymentDetails(paymentData);

    try {
      const orderPayload = {
        customer: {
          name: deliveryDetails.fullName,
          email: deliveryDetails.email,
          phone: deliveryDetails.phone,
        },
        address: {
          address: deliveryDetails.address,
          city: deliveryDetails.city,
          district: deliveryDetails.district,
          postal_code: deliveryDetails.postalCode,
          instructions: deliveryDetails.instructions,
          coordinates: deliveryDetails.coordinates,
        },
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: paymentData.method,
        payment_status: paymentData.status === 'success' ? 'paid' : 'pending',
      };

      const response = await axios.post('http://127.0.0.1:8000/api/orders', orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newOrderId = response.data.order_id || `EDU${Date.now()}`;
      setOrderId(newOrderId);
      setCurrentStep('confirmation');

      if (paymentData.status === 'success') {
        clearCart();
        localStorage.removeItem('pendingPayment');
      } else {
        localStorage.setItem('pendingPayment', JSON.stringify({
          orderId: newOrderId,
          method: paymentData.method,
          amount: paymentData.amount,
        }));
      }
    } catch (error) {
      console.error('Order failed:', error);
      alert('Order placement failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayOnDelivery = async () => {
    setConfirmingPayOnDelivery(true);
    setConfirmMessage(null);

    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/checkout/confirm-pay-on-delivery',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConfirmMessage(res.data.message || 'Payment confirmed!');
      setOrderId(res.data.order?.id ?? orderId);
      clearCart();
      localStorage.removeItem('pendingPayment');

      setTimeout(() => {
        window.location.href = '/categories';
      }, 1500);
    } catch (error: any) {
      setConfirmMessage(error.response?.data?.error || 'Confirmation failed.');
    } finally {
      setConfirmingPayOnDelivery(false);
    }
  };

  if (isProcessing) return <PreLoader />;

  if (pendingOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navbar />
        <main className="pt-20 px-8 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center py-20 px-8 bg-white/80 rounded-xl shadow-xl border border-yellow-200">
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">Pending Payment</h2>
            <p className="text-gray-700 mb-6">{pendingOrder.message}</p>
            <p className="text-gray-600 mb-6">Order ID: #{pendingOrder.orderId}</p>

            <EdumallButton
              onClick={handleConfirmPayOnDelivery}
              disabled={confirmingPayOnDelivery}
              variant="secondary"
              size="lg"
              className="w-full mb-4"
            >
              {confirmingPayOnDelivery ? 'Confirming...' : 'Confirm if you received your delivery on Cash on Delivery'}
            </EdumallButton>

            {confirmMessage && (
              <p className="text-sm text-green-700 mt-2">{confirmMessage}</p>
            )}

            <Link to="/categories">
              <EdumallButton
                variant="primary"
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-white w-full"
              >
                Continue Shopping Anyway
              </EdumallButton>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <CustomCursor />
      <Navbar />
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <Link to="/cart" className="text-blue-600 hover:underline flex items-center mb-6">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cart
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                {currentStep === 'details' && <DeliveryFormWithMaps onDetailsSubmit={handleDetailsSubmit} user={user} />
              }
                {currentStep === 'payment' && (
                  <>
                    {isAuthenticated ? (
                      <PaymentOptions onPaymentComplete={handlePaymentComplete} total={total} />
                    ) : (
                      <GuestCheckout onPaymentComplete={handlePaymentComplete} total={total} />
                    )}
                  </>
                )}
                {currentStep === 'confirmation' && (
                  <div className="text-center p-6 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-bold text-green-600 mb-2">Order Confirmed</h2>
                    <p className="text-gray-700 mb-4">Your order has been placed successfully.</p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>Order ID: #{orderId}</span>
                      <Clock className="w-4 h-4" />
                      <span>Status: Processing</span>
                    </div>
                    <Link to="/categories">
                      <EdumallButton className="mt-6">Continue Shopping</EdumallButton>
                    </Link>
                  </div>
                )}
              </div>
              <OrderSummary items={items} total={subtotal} deliveryDetails={deliveryDetails} />

            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
