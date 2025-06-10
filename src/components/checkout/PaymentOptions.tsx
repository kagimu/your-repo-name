
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Banknote, CheckCircle } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';

interface PaymentOptionsProps {
  onPaymentComplete: (paymentData: any) => void;
  total: number;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({ onPaymentComplete, total }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    phoneNumber: '',
    pin: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'visa',
      name: 'Visa Card',
      icon: CreditCard,
      color: 'from-blue-500 to-blue-600',
      description: 'Pay with your Visa credit/debit card'
    },
    {
      id: 'mastercard',
      name: 'Mastercard',
      icon: CreditCard,
      color: 'from-red-500 to-red-600',
      description: 'Pay with your Mastercard credit/debit card'
    },
    {
      id: 'airtel',
      name: 'Airtel Money',
      icon: Smartphone,
      color: 'from-red-600 to-orange-500',
      description: 'Pay with Airtel Money mobile wallet'
    },
    {
      id: 'mtn',
      name: 'MTN Mobile Money',
      icon: Smartphone,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Pay with MTN Mobile Money'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handlePayment = async () => {
    if (!selectedMethod) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete({
        method: selectedMethod,
        amount: total,
        transactionId: `TXN${Date.now()}`,
        status: 'success',
        timestamp: new Date().toISOString()
      });
    }, 3000);
  };

  const isFormValid = () => {
    if (!selectedMethod) return false;
    
    if (selectedMethod === 'visa' || selectedMethod === 'mastercard') {
      return paymentDetails.cardNumber && paymentDetails.expiryDate && paymentDetails.cvv;
    }
    
    if (selectedMethod === 'airtel' || selectedMethod === 'mtn') {
      return paymentDetails.phoneNumber && paymentDetails.pin;
    }
    
    return false;
  };

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

      {/* Payment Method Selection */}
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

      {/* Payment Form */}
      {selectedMethod && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 mb-6"
        >
          {(selectedMethod === 'visa' || selectedMethod === 'mastercard') && (
            <>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={paymentDetails.cardNumber}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.expiryDate}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.cvv}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            </>
          )}

          {(selectedMethod === 'airtel' || selectedMethod === 'mtn') && (
            <>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={paymentDetails.phoneNumber}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="0700123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  PIN
                </label>
                <input
                  type="password"
                  value={paymentDetails.pin}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, pin: e.target.value }))}
                  placeholder="Enter your PIN"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </>
          )}
        </motion.div>
      )}

      <EdumallButton
        onClick={handlePayment}
        variant="primary"
        size="lg"
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        disabled={!isFormValid() || isProcessing}
      >
        {isProcessing ? 'Processing Payment...' : `Pay ${formatPrice(total)}`}
      </EdumallButton>
      
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center"
        >
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Securing your payment...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
