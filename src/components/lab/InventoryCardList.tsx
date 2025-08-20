import { AlertTriangle, Edit, Link, MoreVertical, RefreshCcw, Trash2 } from 'lucide-react';
import { LabItem } from '@/types/lab';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface InventoryCardListProps {
  items: LabItem[];
  onEdit: (item: LabItem) => void;
  onRestock: (item: LabItem) => void;
  onDelete: (item: LabItem) => void;
}

export const InventoryCardList = ({ items, onEdit, onRestock, onDelete }: InventoryCardListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="lg:hidden space-y-4">
      {items.map((item) => (
        <motion.div
          key={item.id}
          layout
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          {/* Card Header */}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-sm font-medium text-gray-900">
                    {item.name}
                  </h3>
                  {item.productId && (
                    <Link className="w-4 h-4 ml-1.5 text-teal-500" />
                  )}
                </div>
                <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                  {item.category}
                </span>
              </div>
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="p-1 -m-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <span className="sr-only">Show details</span>
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Quantity and Status */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center">
                <span className={`text-sm ${
                  item.quantity <= item.threshold ? 'text-amber-600 font-medium' : 'text-gray-900'
                }`}>
                  {item.quantity} {item.unit}
                </span>
                {item.quantity <= item.threshold && (
                  <AlertTriangle className="w-4 h-4 ml-1.5 text-amber-500" />
                )}
              </div>
              <span className="text-xs text-gray-500">
                Updated {new Date(item.lastUpdated).toLocaleDateString()}
              </span>
            </div>

            {/* Primary Action */}
            <div className="mt-3">
              <button
                onClick={() => onRestock(item)}
                className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Restock
              </button>
            </div>
          </div>

          {/* Expandable Details */}
          {expandedId === item.id && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="border-t border-gray-200 bg-gray-50"
            >
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Location</label>
                  <p className="mt-1 text-sm text-gray-900">{item.location || '—'}</p>
                </div>
                {item.notes && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{item.notes}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-500">Threshold</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {item.threshold} {item.unit}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};
