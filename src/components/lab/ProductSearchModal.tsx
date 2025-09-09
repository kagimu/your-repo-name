import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { LabProduct } from '@/types/lab';
import debounce from 'lodash/debounce';
import axios from 'axios';

interface ProductSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSelect: (product: LabProduct) => void;
}

export const ProductSearchModal = ({
  isOpen,
  onClose,
  onProductSelect,
}: ProductSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<LabProduct[]>([]);

  const searchProducts = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setProducts([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get<{ data: LabProduct[] }>(
          `https://edumall-main-khkttx.laravel.cloud/api/labs?query=${encodeURIComponent(
            query
          )}`
        );
        setProducts(response.data.data || []);
      } catch (err) {
        setError(
          'Failed to search products. Please check your connection and try again.'
        );
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchProducts(query);
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="relative">
                  <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search product catalog..."
                    className="w-full pl-12 pr-4 py-3 border-b border-gray-200 focus:outline-none focus:border-teal-500 focus:ring-0"
                  />
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-red-600 text-sm">{error}</p>
                      <button
                        onClick={() => searchProducts(searchQuery)}
                        className="mt-2 text-teal-600 text-sm hover:text-teal-700"
                      >
                        Try again
                      </button>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchQuery
                        ? 'No products found. Try a different search term.'
                        : 'Start typing to search products...'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {products.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => onProductSelect(product)}
                          className="w-full p-3 text-left rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <div className="flex items-start gap-3">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </h4>
                              {product.sku && (
                                <p className="text-xs text-gray-500">
                                  SKU: {product.sku}
                                </p>
                              )}
                              {product.price && (
                                <p className="text-sm font-medium text-teal-600">
                                  {new Intl.NumberFormat('en-UG', {
                                    style: 'currency',
                                    currency: 'UGX',
                                  }).format(product.price)}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
