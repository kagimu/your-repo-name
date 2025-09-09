import { useState, useEffect, useMemo, useCallback } from 'react';
import { Beaker, FileSpreadsheet, Plus } from 'lucide-react';
import { LabItem, LabItemCategory, LabInventoryStats, LabFilter, LabProduct } from '../types/lab';
import { CategoryTabs } from '@/components/lab/CategoryTabs';
import { FilterBar } from '@/components/lab/FilterBar';
import { InventoryTable } from '@/components/lab/InventoryTable';
import { InventoryCardList } from '@/components/lab/InventoryCardList';
import { ItemModal } from '@/components/lab/ItemModal';
import { ProductSearchModal } from '@/components/lab/ProductSearchModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Mock data - TODO: Replace with API calls
const mockLabItems: LabItem[] = [
  {
    id: "lab-001",
    name: "Ethanol 95%",
    category: "chemical",
    quantity: 5,
    unit: "L",
    threshold: 2,
    productId: "prod-1234",
    location: "Chemistry lab - Shelf A2",
    notes: "Flammable",
    lastUpdated: "2025-08-01T10:00:00.000Z"
  },
  {
    id: "lab-002",
    name: "Test Tubes",
    category: "apparatus",
    quantity: 50,
    unit: "pcs",
    threshold: 10,
    location: "Storage Room B",
    lastUpdated: "2025-08-02T15:30:00.000Z"
  },
  {
    id: "lab-003",
    name: "Preserved Frog Specimen",
    category: "specimen",
    quantity: 8,
    unit: "pcs",
    threshold: 3,
    productId: "prod-5678",
    location: "Biology Lab - Cabinet 3",
    notes: "For dissection practice",
    lastUpdated: "2025-08-03T09:15:00.000Z"
  }
];

const LabInventory = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<LabItem[]>([]);
  const [stats, setStats] = useState<LabInventoryStats>({
    totalItems: 0,
    lowStockCount: 0,
    lastSyncTime: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LabFilter>({
    search: '',
    category: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProductSearchModal, setShowProductSearchModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LabItem | null>(null);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Apply category filter
    if (filter.category !== 'all') {
      result = result.filter(item => item.category === filter.category);
    }

    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.productId?.toLowerCase().includes(searchLower) ||
        item.location?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (filter.sortBy === 'name') {
        return filter.sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (filter.sortBy === 'quantity') {
        return filter.sortOrder === 'asc'
          ? a.quantity - b.quantity
          : b.quantity - a.quantity;
      }
      // lastUpdated
      return filter.sortOrder === 'asc'
        ? new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
        : new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });

    return result;
  }, [items, filter]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      all: items.length,
      specimen: 0,
      chemical: 0,
      apparatus: 0
    };

    items.forEach(item => {
      counts[item.category]++;
    });

    return counts;
  }, [items]);

  useEffect(() => {
    // Simulating API call
    const fetchInventory = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setItems(mockLabItems);
        
        // Calculate stats
        const lowStockItems = mockLabItems.filter(
          item => item.quantity <= item.threshold
        );
        
        setStats({
          totalItems: mockLabItems.length,
          lowStockCount: lowStockItems.length,
          lastSyncTime: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
        toast.error('Failed to load inventory. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();

    // Set up polling for low stock updates
    const pollInterval = setInterval(() => {
      const lowStockItems = items.filter(item => item.quantity <= item.threshold);
      setStats(prev => ({
        ...prev,
        lowStockCount: lowStockItems.length,
        lastSyncTime: new Date().toISOString()
      }));
    }, 5 * 60 * 1000); // Poll every 5 minutes

    return () => clearInterval(pollInterval);
  }, [items]);

  // Event Handlers
  const handleAddItem = useCallback((item: Partial<LabItem>) => {
    // TODO: Replace with API call
    const newItem: LabItem = {
      id: `lab-${Date.now()}`,
      name: item.name!,
      category: item.category!,
      quantity: item.quantity!,
      unit: item.unit!,
      threshold: item.threshold!,
      productId: item.productId,
      location: item.location,
      notes: item.notes,
      lastUpdated: new Date().toISOString()
    };

    setItems(prev => [...prev, newItem]);
    setShowAddModal(false);
    toast.success('Item added successfully');
  }, []);

  const handleEditItem = useCallback((item: Partial<LabItem>) => {
    if (!selectedItem) return;

    // TODO: Replace with API call
    setItems(prev =>
      prev.map(i =>
        i.id === selectedItem.id
          ? { ...i, ...item, lastUpdated: new Date().toISOString() }
          : i
      )
    );
    setShowEditModal(false);
    toast.success('Item updated successfully');
  }, [selectedItem]);

  const handleDeleteItem = useCallback((item: LabItem) => {
    // TODO: Replace with API call
    setItems(prev => prev.filter(i => i.id !== item.id));
    toast.success('Item deleted successfully', {
      action: {
        label: 'Undo',
        onClick: () => setItems(prev => [...prev, item])
      }
    });
  }, []);

  const handleRestock = useCallback((item: LabItem) => {
    if (item.productId) {
      navigate(`/cart?add=${item.productId}&qty=1`);
    } else {
      setSelectedItem(item);
      setShowProductSearchModal(true);
    }
  }, [navigate]);

  const handleProductSelect = useCallback((product: LabProduct) => {
    setShowProductSearchModal(false);
    if (selectedItem) {
      // Update existing item with product link
      handleEditItem({
        ...selectedItem,
        productId: product.id,
        unit: product.unit || selectedItem.unit
      });
      navigate(`/cart?add=${product.id}&qty=1`);
    } else {
      // Pre-fill add item form
      setShowAddModal(true);
      // Pre-fill form will be handled by the ItemModal component
    }
  }, [selectedItem, handleEditItem, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Lab Inventory</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <Plus className="w-5 h-5 mr-1.5" />
            Add Item
          </button>
        </div>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-teal-600" />
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-semibold">{stats.totalItems}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <Beaker className="w-6 h-6 text-amber-600" />
              <div>
                <p className="text-sm text-gray-500">Low Stock Items</p>
                <p className="text-2xl font-semibold text-amber-600">
                  {stats.lowStockCount}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                Last Updated
                <p className="text-base font-medium text-gray-900">
                  {new Date(stats.lastSyncTime).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        activeCategory={filter.category}
        onCategoryChange={(category) => setFilter(prev => ({ ...prev, category }))}
        categoryCounts={categoryCounts}
      />

      {/* Search and Filters */}
      <FilterBar
        filter={filter}
        onFilterChange={(changes) => setFilter(prev => ({ ...prev, ...changes }))}
      />
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No items found matching your criteria.</p>
        </div>
      ) : (
        <>
          <InventoryTable
            items={filteredItems}
            onEdit={(item) => {
              setSelectedItem(item);
              setShowEditModal(true);
            }}
            onRestock={handleRestock}
            onDelete={handleDeleteItem}
          />
          <InventoryCardList
            items={filteredItems}
            onEdit={(item) => {
              setSelectedItem(item);
              setShowEditModal(true);
            }}
            onRestock={handleRestock}
            onDelete={handleDeleteItem}
          />
        </>
      )}

      {/* Modals */}
      <ItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddItem}
        mode="add"
      />

      <ItemModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        onSave={handleEditItem}
        item={selectedItem || undefined}
        mode="edit"
      />

      <ProductSearchModal
        isOpen={showProductSearchModal}
        onClose={() => {
          setShowProductSearchModal(false);
          setSelectedItem(null);
        }}
        onProductSelect={handleProductSelect}
      />
    </div>
  );
};

export default LabInventory;
