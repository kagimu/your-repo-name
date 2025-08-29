import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, LogIn, FileText, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { CustomCursor } from '@/components/CustomCursor';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import jsPDF from 'jspdf';

const QuantityInput = ({ itemId, quantity, updateQuantity, isLoading }) => {
  const [inputValue, setInputValue] = useState(quantity.toString());
  const debounceTimeout = useRef(null);

  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setInputValue(val);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed > 0) {
          updateQuantity(itemId, parsed);
        }
      }, 500);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      updateQuantity(itemId, parsed);
    } else {
      setInputValue(quantity.toString());
    }
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={isLoading}
      className="w-16 text-center rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
      inputMode="numeric"
      pattern="[0-9]*"
    />
  );
};

const Cart = () => {
  const { token, user, isAuthenticated } = useAuth();
  const { items, updateQuantity, removeFromCart, getCartTotal, pendingCheckoutDetails } = useCart();
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [invoicePdfUrl, setInvoicePdfUrl] = useState('');
  const navigate = useNavigate();
  const [showMobileControls, setShowMobileControls] = useState(false);

  // Invoice generation function using jsPDF
  const generateInvoice = async (shouldDownload: boolean = false) => {
    setGeneratingInvoice(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;
      
      // Set PDF properties for better compatibility
      pdf.setProperties({
        title: 'Edumall Invoice',
        subject: 'Shopping Cart Invoice',
        creator: 'Edumall',
        author: 'Edumall System'
      });

      // Helper function to center text
      const centerText = (text: string, y: number) => {
        const textWidth = pdf.getStringUnitWidth(text) * pdf.getFontSize() / pdf.internal.scaleFactor;
        return (pageWidth - textWidth) / 2;
      };

      // Add Logo
      const logoWidth = 40;
      const logoHeight = 10;
      const logoX = (pageWidth - logoWidth) / 2;
      pdf.addImage('/edumall-logo.png', 'PNG', logoX, yPos, logoWidth, logoHeight);
      yPos += logoHeight + 10;

      // Add Title
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      const title = 'PROFORMA INVOICE';
      pdf.text(title, centerText(title, yPos), yPos);
      yPos += 10;

      // Add Date
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Date: ${date}`, margin, yPos);
      yPos += 10;

      // Table Header
      pdf.setFont(undefined, 'bold');
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
      pdf.text('Item', margin + 2, yPos + 6);
      pdf.text('Qty', pageWidth - 70, yPos + 6);
      pdf.text('Price', pageWidth - 50, yPos + 6);
      pdf.text('Total', pageWidth - 30, yPos + 6);
      yPos += 12;

      // Table Content
      pdf.setFont(undefined, 'normal');
      items.forEach((item) => {
        if (yPos > pdf.internal.pageSize.getHeight() - 40) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.text(item.name.substring(0, 40) + (item.name.length > 40 ? '...' : ''), margin + 2, yPos);
        pdf.text(item.quantity.toString(), pageWidth - 70, yPos);
        pdf.text(formatPrice(item.price).replace('UGX', '').trim(), pageWidth - 50, yPos);
        pdf.text(formatPrice(item.price * item.quantity).replace('UGX', '').trim(), pageWidth - 30, yPos);
        yPos += 8;
      });

      // Total
      yPos += 5;
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;
      pdf.setFont(undefined, 'bold');
      pdf.text('Subtotal:', pageWidth - 70, yPos);
      pdf.text(formatPrice(getCartTotal()).replace('UGX', '').trim(), pageWidth - 30, yPos);
      yPos += 8;
      pdf.text('* Delivery fee will be calculated at checkout', margin, yPos);

      // Add Total
      yPos += 5;
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('Total (Delivery fee excluded):', pageWidth - 90, yPos);
      pdf.text(formatPrice(getCartTotal()).replace('UGX', '').trim(), pageWidth - 30, yPos);
      
      // Note about delivery
      yPos += 15;
      pdf.setFont(undefined, 'italic');
      pdf.setFontSize(10);
      const note = '* Delivery fee will be calculated at checkout based on your location';
      pdf.text(note, margin, yPos);

      // Footer
      yPos += 30; // Reduced gap before footer
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(9);
      const footer = [
        'Contact Us:',
        'Edumall Uganda',
        'Phone: +256 701 234 567',
        'Email: info@edumall.ug',
        'Website: www.edumall.ug'
      ];
      footer.forEach((line) => {
        pdf.text(line, centerText(line, yPos), yPos);
        yPos += 5;
      });

      if (shouldDownload) {
        pdf.save('edumall-invoice.pdf');
      } else {
        // Create blob and URL with explicit MIME type
        const pdfBlob = new Blob([pdf.output('blob')], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setInvoicePdfUrl(pdfUrl);
        setShowInvoicePreview(true);
      }
    } catch (error) {
      console.error('Invoice generation failed:', error);
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // Close invoice preview and clean up blob URL
  const closeInvoicePreview = () => {
    if (invoicePdfUrl) {
      URL.revokeObjectURL(invoicePdfUrl);
    }
    setShowInvoicePreview(false);
    setInvoicePdfUrl('');
  };

  // Clean up blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (invoicePdfUrl) {
        URL.revokeObjectURL(invoicePdfUrl);
      }
    };
  }, [invoicePdfUrl]);

  // Helper function to get correct image URL
  const getImageUrl = (imagePath: string) => {
    console.log('Processing image path:', imagePath);
    
    if (!imagePath) return '/placeholder.svg';

    // Extract actual URL if it's embedded in a storage path
    if (imagePath.includes('/storage/https://')) {
      const actualUrl = imagePath.split('/storage/')[1];
      console.log('Extracted URL from storage path:', actualUrl);
      return actualUrl;
    }
    
    // If it's an imghippo URL or any full URL
    if (imagePath.includes('imghippo.com') || imagePath.startsWith('http')) {
      console.log('Using direct URL:', imagePath);
      return imagePath;
    }
    
    // Handle storage paths
    if (imagePath.startsWith('/storage/')) {
      return `https://edumall-main-khkttx.laravel.cloud${imagePath}`;
    }
    
    return `https://edumall-main-khkttx.laravel.cloud/storage/${imagePath}`;
  };

  // Debug logged in state and image paths
  useEffect(() => {
    if (items.length > 0) {
      console.log('Auth state:', { isAuthenticated, token: !!token });
      items.forEach(item => {
        console.log('Item image processing:', {
          original: item.image,
          processed: getImageUrl(item.image)
        });
      });
    }
  }, [items, isAuthenticated, token]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);

  const handleRemoveItem = async (productId) => {
    setLoadingItemId(productId);
    try {
      await removeFromCart(productId);
    } catch (err) {
      console.error('Remove failed:', err);
      alert('Could not remove item.');
    } finally {
      setLoadingItemId(null);
    }
  };

  const subtotal = getCartTotal();
  const total = subtotal; // delivery fee calculated in checkout

  // Check if user has a pending order
  // @ts-expect-error - Assuming the API returns a status field
  const hasPendingOrder = pendingCheckoutDetails?.status === 'pending';

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <CustomCursor />
        <Navbar />
        <main className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl"
            >
              <ShoppingBag size={64} className="mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Browse our categories to find what you need.</p>
              <Link to="/categories">
                <EdumallButton variant="primary" size="lg">
                  Start Shopping
                </EdumallButton>
              </Link>
            </motion.div>
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
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
            <p className="text-gray-600">Review your items and proceed to checkout.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 mb-6 lg:mb-0">
              {items.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-xl bg-gray-50"
                      loading="lazy"
                      onError={(e) => {
                        const fallbackUrl = '/placeholder.svg';
                        if (e.currentTarget.src !== fallbackUrl) {
                          e.currentTarget.src = fallbackUrl;
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={loadingItemId === item.id}
                          className="text-red-500 hover:text-red-700 p-2 sm:hidden"
                        >
                          {loadingItemId === item.id ? (
                            <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </button>
                      </div>

                      <div className="mt-2">
                        <p className="text-lg font-bold text-teal-600">{formatPrice(item.price)}</p>
                        {item.unit && <p className="text-xs text-gray-500">per {item.unit}</p>}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={loadingItemId === item.id}
                          className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-gray-100 border flex items-center justify-center hover:bg-gray-200"
                        >
                          <Minus size={16} />
                        </button>
                        <QuantityInput
                          itemId={item.id}
                          quantity={item.quantity}
                          updateQuantity={updateQuantity}
                          isLoading={loadingItemId === item.id}
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={loadingItemId === item.id}
                          className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-gray-100 border flex items-center justify-center hover:bg-gray-200"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Total Price and Remove Button */}
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-lg font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={loadingItemId === item.id}
                          className="text-red-500 hover:text-red-700 hidden sm:block"
                        >
                          {loadingItemId === item.id ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary - Visible on all devices */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border shadow-lg lg:sticky lg:top-24 mb-24 lg:mb-0"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                {hasPendingOrder && (
                  <p className="text-red-600 text-sm mb-4">
                    You have a pending order. Please complete or cancel it before placing a new order.
                  </p>
                )}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span className="text-gray-500 italic">To be confirmed</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-teal-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Actions */}
                <div className="flex gap-2 mb-6">
                  <motion.button
                    whileHover={{ 
                      scale: 1.02, 
                      boxShadow: '0 4px 12px rgba(45, 212, 191, 0.15)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => generateInvoice(false)}
                    disabled={generatingInvoice}
                    className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 sm:py-2.5 text-sm font-medium text-teal-700 bg-teal-50/80 hover:bg-teal-100/80 active:bg-teal-100 border border-teal-200 rounded-xl transition-all shadow-sm disabled:opacity-50 group touch-manipulation"
                  >
                    <FileText className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 sm:group-active:scale-90" />
                    <span className="transition-all duration-300 group-hover:translate-x-0.5">
                      {generatingInvoice ? 'Generating...' : 'View Invoice'}
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => generateInvoice(true)}
                    disabled={generatingInvoice}
                    className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 sm:py-2.5 text-sm font-medium text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 active:bg-blue-100 border border-blue-200 rounded-xl transition-all shadow-sm disabled:opacity-50 group touch-manipulation"
                  >
                    <Download className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 sm:group-active:scale-90" />
                    <span className="transition-all duration-300 group-hover:translate-x-0.5">
                      {generatingInvoice ? 'Generating...' : 'Download Invoice'}
                    </span>
                  </motion.button>
                </div>

                <div className="space-y-4">

                {/* Invoice Preview Modal */}
                {showInvoicePreview && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-0 sm:p-4 md:p-8"
                    onClick={closeInvoicePreview}
                  >
                    <motion.div
                      initial={{ scale: 0.98, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.98, y: 10 }}
                      transition={{ type: 'spring', duration: 0.4 }}
                      className="relative bg-white rounded-2xl overflow-hidden w-full max-w-[98vw] md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[98vh] shadow-2xl border border-gray-200"
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/90 backdrop-blur sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Invoice Preview</h3>
                        </div>
                        <button
                          onClick={closeInvoicePreview}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                          tabIndex={0}
                          aria-label="Close invoice preview"
                        >
                          <span className="sr-only">Close</span>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        </button>
                      </div>

                      {/* Content with improved responsive height and scroll */}
                      <div className="relative w-full h-[80vh] sm:h-[70vh] md:h-[65vh] lg:h-[60vh] overflow-auto bg-gray-50">
                        <object
                          data={invoicePdfUrl}
                          type="application/pdf"
                          className="w-full h-full min-h-[400px] bg-white rounded-b-2xl"
                        >
                          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                            <p className="text-gray-600 mb-4">Unable to display PDF directly.</p>
                            <button
                              onClick={() => window.open(invoicePdfUrl, '_blank')}
                              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                            >
                              Open PDF in New Tab
                            </button>
                          </div>
                        </object>
                      </div>

                      {/* Close button for mobile at bottom */}
                      <div className="block sm:hidden w-full py-3 px-4 bg-gray-50 border-t border-gray-200 text-center">
                        <button
                          onClick={closeInvoicePreview}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold shadow hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                          tabIndex={0}
                        >
                          Close Invoice
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
                  {!isAuthenticated ? (
                    <>
                
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full touch-manipulation"
                      >
                        <EdumallButton
                          variant="primary"
                          size="lg"
                          className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 active:from-teal-700 active:to-blue-800 text-white transition-all duration-300 shadow-md hover:shadow-xl py-3 sm:py-2.5 group"
                          onClick={() => navigate('/login', { state: { from: '/cart' } })}
                        >
                          <LogIn className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110 group-active:scale-105" />
                          Login to Checkout
                        </EdumallButton>
                      </motion.div>
                      <p className="text-sm text-gray-600 text-center">
                        Login to save your cart and access more features
                      </p>
                    </>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full touch-manipulation"
                    >
                      <EdumallButton
                        variant="primary"
                        size="lg"
                        className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 active:from-teal-700 active:to-blue-800 text-white transition-all duration-300 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md py-3 sm:py-2.5 group"
                        disabled={hasPendingOrder}
                        onClick={() => navigate('/checkout', { state: { items, subtotal } })}
                      >
                        <span className="flex items-center justify-center">
                          Proceed to Checkout
                          <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1.5" />
                        </span>
                      </EdumallButton>
                    </motion.div>
                  )}
                </div>

                {hasPendingOrder && (
                  <p className="text-sm text-red-600 mt-2">
                    Please complete or cancel your pending order before placing a new one.
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
