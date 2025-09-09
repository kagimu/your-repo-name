import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, Eye } from 'lucide-react';
import { Order } from '@/types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl: string;
  order: Order;
  onDownload: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  receiptUrl,
  order,
  onDownload,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-0 sm:p-4 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-2xl overflow-hidden w-full max-w-[98vw] md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[98vh] shadow-2xl border border-gray-200"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/90 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Receipt #{order.id.toString().padStart(5, '0')}</h3>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDownload}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </motion.button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="relative w-full h-[calc(100vh-8rem)] bg-gray-50">
          <object
            data={receiptUrl}
            type="application/pdf"
            className="w-full h-full"
          >
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <p className="text-gray-600 mb-4">
                PDF viewer not available in your browser.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open(receiptUrl, '_blank')}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Open in New Tab
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </motion.button>
              </div>
            </div>
          </object>
        </div>

        {/* Mobile Actions */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(receiptUrl, '_blank')}
              className="flex-1 px-3 py-2 bg-teal-600 text-white rounded-lg font-medium flex items-center justify-center gap-1.5 text-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              Open in New Tab
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDownload}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-1.5 text-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
