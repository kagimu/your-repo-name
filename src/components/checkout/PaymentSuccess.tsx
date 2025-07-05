// src/pages/PaymentSuccess.tsx

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '@/contexts/CartContext';
import { Navbar } from '@/components/layout/Navbar';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { LoaderCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    const txRef = searchParams.get('tx_ref');
    const paymentStatus = searchParams.get('status');

    const verifyPayment = async () => {
      try {
        interface VerifyPaymentResponse {
          status: string;
          [key: string]: any;
        }

        const res = await axios.post<VerifyPaymentResponse>('http://127.0.0.1:8000/api/payment/verify', {
          tx_ref: txRef,
          status: paymentStatus,
        });

        if (res.data.status === 'success') {
          clearCart(); // empty cart
          setStatus('success');
        } else {
          setStatus('failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('failed');
      }
    };

    if (txRef) {
      verifyPayment();
    } else {
      setStatus('failed');
    }
  }, [searchParams, clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />

      <div className="max-w-xl mx-auto py-24 text-center px-6">
        {status === 'verifying' && (
          <div className="flex flex-col items-center space-y-4">
            <LoaderCircle className="animate-spin text-blue-500" size={48} />
            <p className="text-lg text-gray-700">Verifying your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-teal-600">Payment Successful 🎉</h2>
            <p className="text-gray-600">
              Thank you for your purchase! Your order is being processed.
            </p>
            <EdumallButton variant="primary" size="lg">
              <a href="/categories">Continue Shopping</a>
            </EdumallButton>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-red-600">Payment Failed ❌</h2>
            <p className="text-gray-600">
              We couldn't verify your payment. Please try again or contact support.
            </p>
            <EdumallButton variant="ghost" size="lg">
              <a href="/cart">Back to Cart</a>
            </EdumallButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
