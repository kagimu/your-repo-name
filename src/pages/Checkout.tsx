import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Clock, AlertCircle } from 'lucide-react';
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

  const subtotal = Number(state.subtotal);
  const deliveryFee = Number(state.deliveryFee);
  const total = subtotal + deliveryFee;

  // Check for pending orders
  useEffect(() => {
    const checkPending = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/orders/pending', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.pending) {
          setPendingOrder({
            orderId: res.data.order_id,
            message: 'You have a pending order. Please complete it before placing a new one.',
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
      alert('You have a pending order. Complete payment before placing a new one.');
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

      setConfirmMessage(res.data.message || 'Pay on Delivery confirmed!');
      setOrderId(res.data.order?.id ?? orderId);
      setCurrentStep('confirmation');
      clearCart();
      localStorage.removeItem('pendingPayment');
    } catch (error: any) {
      setConfirmMessage(error.response?.data?.message || 'Confirmation failed.');
    } finally {
      setConfirmingPayOnDelivery(false);
    }
  };

  if (pendingOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navbar />
        <main className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center py-20 bg-white/80 rounded-xl shadow-xl border border-yellow-200">
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">Pending Payment</h2>
            <p className="text-gray-700 mb-6">{pendingOrder.message}</p>
            <p className="text-gray-600 mb-6">Order ID: #{pendingOrder.orderId}</p>
            <Link to="/categories">
              <EdumallButton variant="primary" size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                Continue Shopping Anyway
              </EdumallButton>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <CustomCursor />
        <Navbar />
        <main className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-white/80 p-8 border border-gray-200 shadow-xl rounded-3xl">
              <Package size={64} className="mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
              <Link to="/categories">
                <EdumallButton variant="primary" size="lg" className="bg-gradient-to-r from-teal-500 to-blue-600 text-white">
                  Continue Shopping
                </EdumallButton>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <CustomCursor />
      <Navbar />
      <PreLoader isLoading={isProcessing || confirmingPayOnDelivery} message="Processing your order..." />

      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Checkout</h1>

          {/* Stepper */}
          <div className="flex items-center space-x-4 mb-8">
            {['details', 'payment', 'confirmation'].map((step, i) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step || (step === 'details' && currentStep !== 'confirmation')
                    ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600'
                }`}>
                  {i + 1}
                </div>
                <span className={`ml-2 font-medium ${currentStep === step ? 'text-blue-600' : 'text-gray-600'}`}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
                {i < 2 && <div className="w-8 h-px bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {currentStep === 'details' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  {isAuthenticated
                    ? <DeliveryFormWithMaps user={user} onDetailsSubmit={handleDetailsSubmit} />
                    : <GuestCheckout onDetailsSubmit={handleDetailsSubmit} />}
                </motion.div>
              )}

              {currentStep === 'payment' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <button
                    onClick={() => setCurrentStep('details')}
                    className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
                  >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Details
                  </button>

                  <h2 className="text-2xl font-bold text-blue-600 mb-4">Payment Method</h2>

                  <PaymentOptions
                    onPaymentComplete={handlePaymentComplete}
                    subtotal={subtotal}
                    deliveryFee={deliveryFee}
                    customer={{
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                    }}
                  />

                  {isAuthenticated && (
                    <div className="mt-8 bg-yellow-100 border border-yellow-300 p-6 rounded-xl text-center">
                      <p className="mb-4 font-semibold text-yellow-800">
                        Have a pending order? Confirm Pay on Delivery here:
                      </p>
                      <EdumallButton
                        onClick={handleConfirmPayOnDelivery}
                        disabled={confirmingPayOnDelivery}
                        variant="secondary"
                        size="md"
                        className="w-full"
                      >
                        {confirmingPayOnDelivery ? 'Confirming...' : 'Confirm Pay on Delivery'}
                      </EdumallButton>
                      {confirmMessage && (
                        <p className="mt-4 text-sm font-medium text-yellow-900">{confirmMessage}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === 'confirmation' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-3xl text-center border shadow-xl">
                  <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span className="text-2xl text-white">✅</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Order Confirmed!</h2>
                  <p className="text-gray-600 mb-6">Your order #{orderId} has been placed.</p>
                  <div className="bg-blue-50 border border-blue-200 p-4 mb-6 rounded-xl">
                    <div className="flex items-center justify-center text-blue-700">
                      <Clock size={20} className="mr-2" />
                      <span className="font-medium">Estimated delivery: 2–3 business days</span>
                    </div>
                  </div>
                  <Link to="/categories">
                    <EdumallButton variant="primary" size="lg" className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white">
                      Continue Shopping
                    </EdumallButton>
                  </Link>
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-1">
              <OrderSummary items={items} total={total} deliveryDetails={deliveryDetails} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
