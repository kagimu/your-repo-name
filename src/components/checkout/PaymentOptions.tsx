import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, CheckCircle, Smartphone, HandCoins } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface PaymentOptionsProps {
  onPaymentComplete: (paymentData: any) => void;
  subtotal: number;
  deliveryFee: number;
  customer: CustomerInfo;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  onPaymentComplete,
  subtotal,
  deliveryFee,
  customer,
}) => {
  const safeSubtotal = Number(subtotal) || 0;
  const safeDeliveryFee = Number(deliveryFee) || 0;
  const total = safeSubtotal + safeDeliveryFee;

  const [selectedMethod, setSelectedMethod] = useState<string>('airtel');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPendingMessage, setShowPendingMessage] = useState(false);

  const paymentMethods = [
    
   
    {
      id: 'cod',
      name: 'Pay on Delivery',
      icon: HandCoins,
      color: 'from-gray-600 to-gray-800',
      description: 'Pay cash when the order is delivered',
    },
  ];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);

  const loadFlutterwaveScript = () =>
    new Promise<void>((resolve, reject) => {
      if (document.getElementById('flutterwave-script')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'flutterwave-script';
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Flutterwave SDK failed to load'));
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    if (!selectedMethod) return;

    // Handle Pay on Delivery
    if (selectedMethod === 'cod') {
      setShowPendingMessage(true); // Show the pending message
      onPaymentComplete({
        method: selectedMethod,
        amount: total,
        status: 'pending',
        note: 'Payment will be collected upon delivery',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Handle Flutterwave payments
    setIsProcessing(true);
    try {
      await loadFlutterwaveScript();
      const FlutterwaveCheckout = (window as any).FlutterwaveCheckout;

      if (!FlutterwaveCheckout) throw new Error('Flutterwave not loaded');

      FlutterwaveCheckout({
        public_key: 'FLWPUBK_TEST-d6243ebe0ede1b800000af4bfcae6dc0-X',
        tx_ref: `txref-${Date.now()}`,
        amount: total,
        currency: 'UGX',
        payment_options: 'mobilemoneyuganda',
        customer: {
          name: customer.name,
          email: customer.email,
          phonenumber: customer.phone,
          
        },
        customizations: {
          title: 'Edumall Payment',
          description: `Payment for your order of ${formatPrice(total)}`,
          logo: 'http://localhost:8080/img/logo.png',
        },
        callback: (response: any) => {
          setIsProcessing(false);
          if (response.status === 'successful') {
            onPaymentComplete({
              method: selectedMethod,
              amount: total,
              transactionId: response.transaction_id,
              status: 'success',
              timestamp: new Date().toISOString(),
            });
          } else {
            alert('Payment was not successful.');
          }
        },
        onclose: () => {
          setIsProcessing(false);
        },
      });
    } catch (error) {
      setIsProcessing(false);
      alert('Failed to initiate payment.');
      console.error(error);
    }
  };

  const isFormValid = () => selectedMethod !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl"
    >
      <h2 className="text-2xl font-bold text-blue-600 mb-6">Payment Method</h2>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center text-blue-700">
          <Banknote size={20} className="mr-2" />
          <span className="font-medium">Total Amount: {formatPrice(total)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <motion.button
              key={method.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedMethod === method.id
                  ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${method.color}`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{method.name}</h3>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
                {selectedMethod === method.id && (
                  <CheckCircle size={20} className="text-green-500 ml-auto" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <EdumallButton
        onClick={handlePayment}
        variant="primary"
        size="lg"
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        disabled={!isFormValid() || isProcessing}
      >
        {isProcessing
          ? 'Processing...'
          : selectedMethod === 'cod'
          ? 'Place Order (Pay on Delivery)'
          : `Pay ${formatPrice(total)}`}
      </EdumallButton>

      {/* Pending Payment Message */}
      {showPendingMessage && (
        <div className="mt-6 bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-xl text-center">
          <p className="font-semibold">Your order has been placed and is pending payment upon delivery.</p>
          <p className="text-sm mt-1">You’ll receive a notification once payment is confirmed.</p>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentOptions;
