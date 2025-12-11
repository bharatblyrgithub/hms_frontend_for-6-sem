import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';

const InventoryForm = ({ item, onSubmit, onClose }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        category: item.category,
        description: item.description || '',
        sku: item.sku,
        quantity: item.quantity,
        unit: item.unit,
        reorderLevel: item.reorderLevel || 10,
        unitPrice: item.unitPrice,
        supplier: {
          name: item.supplier?.name || '',
          contact: item.supplier?.contact || '',
          email: item.supplier?.email || ''
        },
        expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
        batchNumber: item.batchNumber || '',
        location: item.location || '',
        minimumStock: item.minimumStock || 0,
        maximumStock: item.maximumStock || 1000
      });
    }
  }, [item, reset]);

  const submitHandler = (data) => {
    const itemData = {
      ...data,
      supplier: {
        name: data.supplier.name || undefined,
        contact: data.supplier.contact || undefined,
        email: data.supplier.email || undefined
      },
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined
    };
    
    if (item) {
      onSubmit(item._id, itemData);
    } else {
      onSubmit(itemData);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {item ? 'Edit Inventory Item' : 'Add Inventory Item'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Item Name</label>
            <input
              type="text"
              {...register('name', { required: 'Item name is required' })}
              className="input-field"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label">Category</label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="input-field"
            >
              <option value="">Select Category</option>
              <option value="Medicine">Medicine</option>
              <option value="Equipment">Equipment</option>
              <option value="Supplies">Supplies</option>
              <option value="Lab">Lab</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="label">SKU</label>
            <input
              type="text"
              {...register('sku', { required: 'SKU is required' })}
              className="input-field"
              placeholder="Stock Keeping Unit"
            />
            {errors.sku && (
              <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
            )}
          </div>

          <div>
            <label className="label">Quantity</label>
            <input
              type="number"
              {...register('quantity', {
                required: 'Quantity is required',
                min: { value: 0, message: 'Quantity cannot be negative' }
              })}
              className="input-field"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="label">Unit</label>
            <input
              type="text"
              {...register('unit', { required: 'Unit is required' })}
              className="input-field"
              placeholder="e.g., pieces, boxes, ml, mg"
            />
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
            )}
          </div>

          <div>
            <label className="label">Unit Price (₹)</label>
            <input
              type="number"
              {...register('unitPrice', {
                required: 'Unit price is required',
                min: { value: 0, message: 'Price cannot be negative' }
              })}
              className="input-field"
              step="0.01"
            />
            {errors.unitPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.unitPrice.message}</p>
            )}
          </div>

          <div>
            <label className="label">Reorder Level</label>
            <input
              type="number"
              {...register('reorderLevel', {
                min: { value: 0, message: 'Reorder level cannot be negative' }
              })}
              className="input-field"
            />
            {errors.reorderLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.reorderLevel.message}</p>
            )}
          </div>

          <div>
            <label className="label">Location</label>
            <input
              type="text"
              {...register('location')}
              className="input-field"
              placeholder="Storage location"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea
              {...register('description')}
              rows={2}
              className="input-field"
              placeholder="Item description..."
            />
          </div>
        </div>

        {/* Supplier Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="label">Supplier Name</label>
              <input
                type="text"
                {...register('supplier.name')}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Contact</label>
              <input
                type="text"
                {...register('supplier.contact')}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                {...register('supplier.email')}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Expiry Date</label>
            <input
              type="date"
              {...register('expiryDate')}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Batch Number</label>
            <input
              type="text"
              {...register('batchNumber')}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Minimum Stock</label>
            <input
              type="number"
              {...register('minimumStock', { min: 0 })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Maximum Stock</label>
            <input
              type="number"
              {...register('maximumStock', { min: 0 })}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {item ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;