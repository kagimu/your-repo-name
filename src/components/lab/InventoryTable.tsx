import { AlertTriangle, Edit, Link, MoreVertical, RefreshCcw, Trash2 } from 'lucide-react';
import { LabItem } from '@/types/lab';
import { motion } from 'framer-motion';
import { Fragment } from 'react';

interface InventoryTableProps {
  items: LabItem[];
  onEdit: (item: LabItem) => void;
  onRestock: (item: LabItem) => void;
  onDelete: (item: LabItem) => void;
}

export const InventoryTable = ({ items, onEdit, onRestock, onDelete }: InventoryTableProps) => {
  return (
    <div className="hidden lg:block overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                      {item.productId && (
                        <Link className="inline-block w-4 h-4 ml-2 text-teal-500" />
                      )}
                    </div>
                    {item.notes && (
                      <div className="text-sm text-gray-500">{item.notes}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                  {item.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
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
                <div className="text-xs text-gray-500">
                  Threshold: {item.threshold} {item.unit}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.location || '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(item.lastUpdated).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                  >
                    <span className="sr-only">Edit</span>
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRestock(item)}
                    className="text-teal-600 hover:text-teal-900 p-1 rounded-full hover:bg-teal-50"
                  >
                    <span className="sr-only">Restock</span>
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                  >
                    <span className="sr-only">Delete</span>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
