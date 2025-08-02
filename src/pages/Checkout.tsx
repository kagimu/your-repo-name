import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Package } from 'lucide-react';
import { Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { CustomCursor } from '@/components/CustomCursor';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { GuestCheckout } from '@/components/checkout/GuestCheckout';
import PaymentOptions from '@/components/checkout/PaymentOptions';
import { DeliveryFormWithMaps } from '@/components/checkout/DeliveryFormWithMaps';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import axios from 'axios';

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [deliveryDetails, setDeliveryDetails] = useState<any>(null);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmingPayOnDelivery, setConfirmingPayOnDelivery] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<any>(null);

  const { items, clearCart } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();


  if (!state?.subtotal) return <Navigate to="/cart" replace />;

 
  const waitForGoogleMaps = () => {
    return new Promise<void>((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      let attempts = 0;
      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(interval);
          resolve();
        } else if (attempts > 50) {
          clearInterval(interval);
          reject(new Error('Google Maps API failed to load.'));
        }
        attempts++;
      }, 100);
    });
  };

  const getDistanceInKm = async (destination: { lat: number; lng: number }) => {
    await waitForGoogleMaps();

    return new Promise<number>((resolve, reject) => {
      const service = new window.google.maps.DistanceMatrixService();

      const origin = new window.google.maps.LatLng(0.3476, 32.5825); // Kampala city center
      const dest = new window.google.maps.LatLng(destination.lat, destination.lng);

      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [dest],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === 'OK' && response.rows.length > 0) {
            const element = response.rows[0].elements[0];
            if (element.status === 'OK') {
              const distanceMeters = element.distance.value;
              resolve(distanceMeters / 1000); // km
            } else {
              reject(new Error('DistanceMatrix element status: ' + element.status));
            }
          } else {
            reject(new Error('DistanceMatrix status: ' + status));
          }
        }
      );
    });
  };

  const calculateDeliveryFee = (distanceKm: number) => {
    if (distanceKm <= 5) return 40000;
    if (distanceKm <= 10) return 70000;
    if (distanceKm <= 20) return 100000;
    return 15000 + (distanceKm - 20) * 500;
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + deliveryFee;

  useEffect(() => {
    const checkPending = async () => {
      try {
        const res = await axios.get('https://edumallug.com/api/orders/pending', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.pending) {
          setPendingOrder({
            orderId: res.data.order_id,
            message: 'You have a pending order. Please confirm receipt before placing a new one.',
          });
        }
      } catch (error) {
        console.error('Pending check failed:', error);
      }
    };

    if (isAuthenticated) checkPending();
  }, [isAuthenticated, token]);

  const handleDetailsSubmit = async (details: any) => {
  setDeliveryDetails(details);

  try {
   // const distance = await getDistanceInKm(details.coordinates);
   // const fee = calculateDeliveryFee(distance);
    setDeliveryFee(10000);
  } catch (err) {
    console.error('Distance fetch failed:', err);
    alert('Google Maps distance check failed. Using default delivery fee.');
    setDeliveryFee(10000); // Fallback fee
  } finally {
    // Always move to payment step, even if distance fails
    setCurrentStep('payment');
  }
};


  const handlePaymentComplete = async (paymentData: any) => {
    if (pendingOrder) {
      alert('You have a pending order. Please confirm it before placing a new one.');
      return;
    }

    setIsProcessing(true);
    setPaymentDetails(paymentData);

    try {
      const orderPayload = {
        customer_name: deliveryDetails.fullName,
        customer_email: deliveryDetails.email,
        customer_phone: deliveryDetails.phone,
        address: deliveryDetails,
        items: items.map(item => ({ product_id: item.id, quantity: item.quantity, price: item.price })),
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: paymentData.method,
        payment_status: paymentData.status === 'success' ? 'paid' : 'pending',
      };

      const response = await axios.post('https://edumallug.com/api/orders', orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newOrderId = response.data.order_id || `EDU${Date.now()}`;
      setOrderId(newOrderId);

      clearCart();
      

      if (paymentData.status === 'success' && paymentData.method === 'flutterwave') { 
        navigate('/dashboard');
      } else {
        navigate('/dashboard');

        if (paymentData.status !== 'success') {
          localStorage.setItem('pendingPayment', JSON.stringify({
            orderId: newOrderId,
            method: paymentData.method,
            amount: paymentData.amount,
          }));
        }
      }
    } catch (error) {
      console.error('Order failed:', error);
      alert('Your Order placement has failed. Please Refresh and try placing the order again.');
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                {currentStep === 'details' && <DeliveryFormWithMaps onDetailsSubmit={handleDetailsSubmit} user={user} />}
                {currentStep === 'payment' && (
                  isAuthenticated ? (
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
                  ) : (
                    <GuestCheckout
                      onPaymentComplete={handlePaymentComplete}
                      total={total}
                    />
                  )
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
