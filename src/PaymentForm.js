import React from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';

/* eslint-disable react-hooks/incompatible-library */
'use no memo';

const PaymentForm = ({ bill, onSubmit, onClose }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      amount: bill?.balance || 0,
      paymentMethod: 'Cash',
      paymentDate: new Date().toISOString().split('T')[0]
    }
  });

  const amount = watch('amount');
  const maxAmount = bill ? bill.balance : 0;

  const submitHandler = (data) => {
    onSubmit(data);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Record Payment</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {bill && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Bill Number</div>
              <div className="font-medium">{bill.billNumber}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Patient</div>
              <div className="font-medium">{bill.patient?.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Amount</div>
              <div className="font-medium">₹{bill.totalAmount}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Paid Amount</div>
              <div className="font-medium">₹{bill.paidAmount}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-gray-500">Balance Due</div>
              <div className="text-lg font-bold text-primary-600">₹{bill.balance}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
        <div>
          <label className="label">Payment Date</label>
          <input
            type="date"
            {...register('paymentDate', { required: 'Payment date is required' })}
            className="input-field"
          />
          {errors.paymentDate && (
            <p className="mt-1 text-sm text-red-600">{errors.paymentDate.message}</p>
          )}
        </div>

        <div>
          <label className="label">Payment Method</label>
          <select
            {...register('paymentMethod', { required: 'Payment method is required' })}
            className="input-field"
          >
            <option value="Cash">Cash</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Insurance">Insurance</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
          {errors.paymentMethod && (
            <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
          )}
        </div>

        <div>
          <label className="label">
            Amount (₹) 
            <span className="text-sm text-gray-500 ml-2">
              Max: ₹{maxAmount}
            </span>
          </label>
          <input
            type="number"
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 0.01, message: 'Amount must be greater than 0' },
              max: { value: maxAmount, message: `Amount cannot exceed ₹${maxAmount}` }
            })}
            className="input-field"
            step="0.01"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
          <div className="mt-2">
            <input
              type="range"
              min="0"
              max={maxAmount}
              step="0.01"
              value={parseFloat(amount) || 0}
              className="w-full"
              disabled
            />
          </div>
        </div>

        <div>
          <label className="label">Reference / Transaction ID</label>
          <input
            type="text"
            {...register('reference')}
            className="input-field"
            placeholder="Optional transaction reference"
          />
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            {...register('notes')}
            rows={3}
            className="input-field"
            placeholder="Additional payment notes..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Record Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;