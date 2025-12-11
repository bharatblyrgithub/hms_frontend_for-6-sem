import React from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';

const RestockForm = ({ item, onSubmit, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      quantity: 10,
      batchNumber: '',
      expiryDate: ''
    }
  });

  const submitHandler = (data) => {
    onSubmit(data);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Restock Item</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {item && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Item</div>
              <div className="font-medium">{item.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Current Stock</div>
              <div className="font-medium">{item.quantity} {item.unit}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">SKU</div>
              <div className="font-medium">{item.sku}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Reorder Level</div>
              <div className="font-medium">{item.reorderLevel} {item.unit}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
        <div>
          <label className="label">Quantity to Add</label>
          <input
            type="number"
            {...register('quantity', {
              required: 'Quantity is required',
              min: { value: 1, message: 'Quantity must be at least 1' }
            })}
            className="input-field"
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
          )}
        </div>

        <div>
          <label className="label">Batch Number (Optional)</label>
          <input
            type="text"
            {...register('batchNumber')}
            className="input-field"
          />
        </div>

        <div>
          <label className="label">Expiry Date (Optional)</label>
          <input
            type="date"
            {...register('expiryDate')}
            className="input-field"
          />
        </div>

        <div>
          <label className="label">Supplier (Optional)</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              {...register('supplier.name')}
              className="input-field"
              placeholder="Supplier Name"
            />
            <input
              type="text"
              {...register('supplier.contact')}
              className="input-field"
              placeholder="Contact"
            />
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            {...register('notes')}
            rows={3}
            className="input-field"
            placeholder="Restock notes..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Restock Item
          </button>
        </div>
      </form>
    </div>
  );
};

export default RestockForm;