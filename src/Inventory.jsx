import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { inventoryAPI } from './services/api';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import InventoryForm from './InventoryForm';
import RestockForm from './RestockForm';

const Inventory = () => {
  const { hasRole } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showRestockForm, setShowRestockForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  const categories = ['Medicine', 'Equipment', 'Supplies', 'Lab'];

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        category: categoryFilter,
        minQuantity: lowStockFilter ? 0 : undefined,
        maxQuantity: lowStockFilter ? 10 : undefined
      };

      const response = await inventoryAPI.getInventory(params);
      setInventory(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch inventory');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, lowStockFilter]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleCreate = async (itemData) => {
    try {
      await inventoryAPI.createInventoryItem(itemData);
      toast.success('Item added successfully');
      setShowForm(false);
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item');
    }
  };

  const handleUpdate = async (id, itemData) => {
    try {
      await inventoryAPI.updateInventoryItem(id, itemData);
      toast.success('Item updated successfully');
      setShowForm(false);
      setSelectedItem(null);
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this item?')) {
      return;
    }

    try {
      await inventoryAPI.deleteInventoryItem(id);
      toast.success('Item deactivated successfully');
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate item');
    }
  };

  const handleRestock = async (id, restockData) => {
    try {
      await inventoryAPI.restockInventory(id, restockData);
      toast.success('Item restocked successfully');
      setShowRestockForm(false);
      setSelectedItem(null);
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restock item');
    }
  };

  const getStockColor = (quantity, reorderLevel) => {
    if (quantity <= 0) return 'bg-red-100 text-red-800';
    if (quantity <= reorderLevel) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatus = (quantity, reorderLevel) => {
    if (quantity <= 0) return 'Out of Stock';
    if (quantity <= reorderLevel) return 'Low Stock';
    return 'In Stock';
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="mt-2 text-gray-600">
            Manage hospital inventory and supplies
          </p>
        </div>
        {hasRole(['Admin']) && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Item
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, SKU, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 bg-white p-2 rounded-md border">
          <input
            type="checkbox"
            checked={lowStockFilter}
            onChange={(e) => setLowStockFilter(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Show Low Stock Only</span>
        </label>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item) => (
          <div key={item._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.sku}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.category === 'Medicine' ? 'bg-blue-100 text-blue-800' :
                item.category === 'Equipment' ? 'bg-purple-100 text-purple-800' :
                  item.category === 'Supplies' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                {item.category}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Description</div>
                <div className="text-gray-900 line-clamp-2">{item.description || 'No description'}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Current Stock</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{item.quantity} {item.unit}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(item.quantity, item.reorderLevel)}`}>
                      {getStockStatus(item.quantity, item.reorderLevel)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Reorder Level</div>
                  <div className="text-lg font-medium text-gray-900">{item.reorderLevel} {item.unit}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Unit Price</div>
                  <div className="text-lg font-medium text-gray-900">₹{item.unitPrice}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Value</div>
                  <div className="text-lg font-medium text-gray-900">₹{(item.quantity * item.unitPrice).toFixed(2)}</div>
                </div>
              </div>

              {item.expiryDate && (
                <div>
                  <div className="text-sm text-gray-500">Expiry Date</div>
                  <div className={`text-sm font-medium ${new Date(item.expiryDate) < new Date() ? 'text-red-600' : 'text-gray-900'
                    }`}>
                    {new Date(item.expiryDate).toLocaleDateString()}
                    {new Date(item.expiryDate) < new Date() && (
                      <span className="ml-2 flex items-center text-xs">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        Expired
                      </span>
                    )}
                  </div>
                </div>
              )}

              {item.supplier?.name && (
                <div>
                  <div className="text-sm text-gray-500">Supplier</div>
                  <div className="text-gray-900">{item.supplier.name}</div>
                  <div className="text-sm text-gray-600">{item.supplier.contact}</div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Last restocked: {item.lastRestocked ?
                    new Date(item.lastRestocked).toLocaleDateString() : 'Never'}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setShowForm(true);
                    }}
                    className="text-primary-600 hover:text-primary-900"
                    title="View Details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  {hasRole(['Admin']) && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowRestockForm(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Restock"
                      >
                        <ArrowPathIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowForm(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <InventoryForm
              item={selectedItem}
              onSubmit={selectedItem ? handleUpdate : handleCreate}
              onClose={() => {
                setShowForm(false);
                setSelectedItem(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Restock Form Modal */}
      {showRestockForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <RestockForm
              item={selectedItem}
              onSubmit={(restockData) => handleRestock(selectedItem._id, restockData)}
              onClose={() => {
                setShowRestockForm(false);
                setSelectedItem(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;