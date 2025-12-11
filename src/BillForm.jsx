import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { patientAPI } from './services/api';

const BillForm = ({ bill, onSubmit, onClose }) => {
  'use no memo';
  const { register, handleSubmit, formState: { errors }, setValue, control } = useForm({
    defaultValues: {
      tax: 0,
      discount: 0,
      billDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30))
        .toISOString()
        .split('T')[0],
    }
  });

  const { tax, discount } = useWatch({ control, name: ['tax', 'discount'] });

  const [patients, setPatients] = useState([]);
  const [items, setItems] = useState(bill?.items || []);
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0,
    category: 'Consultation',
  });

  const categories = ['Consultation', 'Medication', 'Room', 'Procedure', 'Test', 'Other'];

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getPatients({ limit: 100 });
      setPatients(response.data.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchPatients();
  }, []);

  useEffect(() => {
    if (bill) {
      // Populate form fields
      Object.keys(bill).forEach((key) => {
        if (key !== 'items' && key !== 'patient') {
          setValue(key, bill[key]);
        }
      });
      setValue('patient', bill.patient?._id || '');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(bill.items || []);
    }
  }, [bill, setValue]);

  const addItem = () => {
    if (!newItem.description || newItem.quantity <= 0 || newItem.unitPrice < 0) return;

    setItems([...items, { ...newItem, amount: newItem.quantity * newItem.unitPrice }]);
    setNewItem({ description: '', quantity: 1, unitPrice: 0, category: 'Consultation' });
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxValue = parseFloat(tax || 0);
    const discountValue = parseFloat(discount || 0);
    const totalAmount = subtotal + taxValue - discountValue;
    return { subtotal, tax: taxValue, discount: discountValue, totalAmount };
  }, [items, tax, discount]);

  const submitHandler = (data) => {
    const { subtotal, totalAmount } = totals;

    const billData = {
      ...data,
      items,
      subtotal,
      totalAmount,
      tax: parseFloat(data.tax || 0),
      discount: parseFloat(data.discount || 0),
      paidAmount: bill?.paidAmount || 0,
    };

    if (bill) onSubmit(bill._id, billData);
    else onSubmit(billData);
  };

  const { subtotal, totalAmount } = totals;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{bill ? 'Edit Bill' : 'Create New Bill'}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
        {/* Patient & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Patient</label>
            <select {...register('patient', { required: 'Patient is required' })} className="input-field" disabled={!!bill}>
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            {errors.patient && <p className="text-red-600 text-sm">{errors.patient.message}</p>}
          </div>

          <div>
            <label className="label">Bill Date</label>
            <input type="date" {...register('billDate', { required: true })} className="input-field" />
          </div>

          <div>
            <label className="label">Due Date</label>
            <input type="date" {...register('dueDate', { required: true })} className="input-field" />
          </div>

          <div>
            <label className="label">Payment Method</label>
            <select {...register('paymentMethod')} className="input-field">
              <option value="">Select Method</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Insurance">Insurance</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Items */}
        <div>
          <label className="label">Bill Items</label>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2">
              <input type="text" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Description" className="col-span-5 input-field" />
              <input type="number" value={newItem.quantity} min="1" onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} className="col-span-2 input-field" />
              <input type="number" value={newItem.unitPrice} min="0" step="0.01" onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })} className="col-span-2 input-field" />
              <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="col-span-2 input-field">
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <button type="button" onClick={addItem} className="col-span-1 btn-primary"><PlusIcon className="h-5 w-5" /></button>
            </div>

            <table className="min-w-full divide-y divide-gray-200 mt-2">
              <thead className="bg-gray-50">
                <tr>
                  {['Description', 'Category', 'Qty', 'Unit Price', 'Amount', 'Action'].map((h) => <th key={h} className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1">{item.description}</td>
                    <td className="px-2 py-1">{item.category}</td>
                    <td className="px-2 py-1">{item.quantity}</td>
                    <td className="px-2 py-1">₹{item.unitPrice.toFixed(2)}</td>
                    <td className="px-2 py-1">₹{item.amount.toFixed(2)}</td>
                    <td className="px-2 py-1">
                      <button type="button" onClick={() => removeItem(i)} className="text-red-600"><TrashIcon className="h-5 w-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <input type="number" {...register('tax', { min: 0 })} placeholder="Tax" className="input-field flex-1" step="0.01" />
              <input type="number" {...register('discount', { min: 0 })} placeholder="Discount" className="input-field flex-1" step="0.01" />
            </div>
            <div className="flex justify-between font-bold mt-2">
              <span>Total:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea {...register('notes')} rows={4} className="input-field" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{bill ? 'Update Bill' : 'Create Bill'}</button>
        </div>
      </form>
    </div>
  );
};

export default BillForm;
