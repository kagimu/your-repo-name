import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { LabItem, LabItemCategory } from '@/types/lab';
import { X } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<LabItem>) => void;
  item?: LabItem;
  mode: 'add' | 'edit';
}

const categoryOptions: { value: LabItemCategory; label: string }[] = [
  { value: 'specimen', label: 'Specimen' },
  { value: 'chemical', label: 'Chemical' },
  { value: 'apparatus', label: 'Apparatus' },
];

const unitOptions = ['pcs', 'ml', 'L', 'g', 'kg', 'mg'];

export const ItemModal = ({ isOpen, onClose, onSave, item, mode }: ItemModalProps) => {
  const [formData, setFormData] = useState<Partial<LabItem>>(
    item || {
      category: 'apparatus',
      quantity: 0,
      threshold: 0,
      unit: 'pcs',
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.quantity === undefined || formData.quantity < 0) {
      newErrors.quantity = 'Quantity must be 0 or greater';
    }
    
    if (formData.threshold === undefined || formData.threshold < 0) {
      newErrors.threshold = 'Threshold must be 0 or greater';
    }
    
    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field: keyof LabItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'add' ? 'Add New Item' : 'Edit Item'}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity and Unit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                        Quantity
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        min="0"
                        value={formData.quantity || ''}
                        onChange={(e) => handleChange('quantity', Number(e.target.value))}
                        className={`mt-1 block w-full rounded-md border ${
                          errors.quantity ? 'border-red-300' : 'border-gray-300'
                        } px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500`}
                      />
                      {errors.quantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                        Unit
                      </label>
                      <select
                        id="unit"
                        value={formData.unit || ''}
                        onChange={(e) => handleChange('unit', e.target.value)}
                        className={`mt-1 block w-full rounded-md border ${
                          errors.unit ? 'border-red-300' : 'border-gray-300'
                        } px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500`}
                      >
                        {unitOptions.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                      {errors.unit && (
                        <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                      )}
                    </div>
                  </div>

                  {/* Threshold */}
                  <div>
                    <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      id="threshold"
                      min="0"
                      value={formData.threshold || ''}
                      onChange={(e) => handleChange('threshold', Number(e.target.value))}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.threshold ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500`}
                    />
                    {errors.threshold && (
                      <p className="mt-1 text-sm text-red-600">{errors.threshold}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={formData.location || ''}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
                      placeholder="e.g., Lab Room 101, Shelf A2"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes || ''}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
                      placeholder="Add any special handling instructions or notes"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      {mode === 'add' ? 'Add Item' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
