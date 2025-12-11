import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { billingAPI } from './services/api';
import { toast } from 'react-hot-toast';
import {
  CurrencyDollarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import BillForm from '../components/Billing/BillForm';
import PaymentForm from '../components/Billing/PaymentForm';
import { format } from 'date-fns';

const Billing = () => {
  const { hasRole } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBillForm, setShowBillForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        paymentStatus: statusFilter,
      };

      const response = await billAPI.getBills(params);
      setBills(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch bills');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleCreate = async (billData) => {
    try {
      await billAPI.createBill(billData);
      toast.success('Bill created successfully');
      setShowBillForm(false);
      fetchBills();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create bill');
    }
  };

  const handleUpdate = async (id, billData) => {
    try {
      await billAPI.updateBill(id, billData);
      toast.success('Bill updated successfully');
      setShowBillForm(false);
      setSelectedBill(null);
      fetchBills();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update bill');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) {
      return;
    }

    try {
      await billAPI.deleteBill(id);
      toast.success('Bill deleted successfully');
      fetchBills();
    } catch {
      toast.error('Failed to delete bill');
    }
  };

  const handlePayment = async (id, paymentData) => {
    try {
      await billAPI.recordPayment(id, paymentData);
      toast.success('Payment recorded successfully');
      setShowPaymentForm(false);
      setSelectedBill(null);
      fetchBills();
    } catch {
      toast.error('Failed to record payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const printBill = (bill) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill ${bill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .hospital-name { font-size: 24px; font-weight: bold; }
            .bill-details { margin: 20px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f4f4f4; }
            .total { text-align: right; font-weight: bold; font-size: 18px; }
            .footer { margin-top: 50px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="hospital-name">Hospital Management System</div>
            <div>Medical Bill</div>
          </div>
          
          <div class="bill-details">
            <div><strong>Bill Number:</strong> ${bill.billNumber}</div>
            <div><strong>Date:</strong> ${format(new Date(bill.billDate), 'dd/MM/yyyy')}</div>
            <div><strong>Due Date:</strong> ${format(new Date(bill.dueDate), 'dd/MM/yyyy')}</div>
            <div><strong>Patient:</strong> ${bill.patient?.name}</div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.unitPrice}</td>
                  <td>₹${item.amount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <div>Subtotal: ₹${bill.subtotal}</div>
            <div>Tax: ₹${bill.tax}</div>
            <div>Discount: ₹${bill.discount}</div>
            <div>Total Amount: ₹${bill.totalAmount}</div>
            <div>Paid Amount: ₹${bill.paidAmount}</div>
            <div>Balance Due: ₹${bill.balance}</div>
            <div>Status: ${bill.paymentStatus}</div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing our hospital!</p>
            <p>For any queries, contact: +1 234 567 890</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading && bills.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="mt-2 text-gray-600">
            Manage patient bills and payments
          </p>
        </div>
        {hasRole(['Admin', 'Receptionist']) && (
          <button
            onClick={() => setShowBillForm(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Bill
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by bill number or patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
        </div>
        <div>
          <input
            type="date"
            className="input-field"
            placeholder="From date"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field"
        >
          <option value="">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Unpaid">Unpaid</option>
        </select>
      </div>

      {/* Bills Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bills.map((bill) => (
                <tr key={bill._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {bill.billNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(bill.billDate), 'dd/MM/yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {bill.patient?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {bill.patient?._id?.slice(-6)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{bill.totalAmount}
                    </div>
                    <div className="text-sm text-gray-500">
                      Paid: ₹{bill.paidAmount}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bill.paymentStatus)}`}>
                      {bill.paymentStatus}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Balance: ₹{bill.balance}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(bill.dueDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => printBill(bill)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Print"
                      >
                        <PrinterIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBill(bill);
                          setShowBillForm(true);
                        }}
                        className="text-primary-600 hover:text-primary-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {hasRole(['Admin', 'Receptionist']) && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedBill(bill);
                              setShowPaymentForm(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Record Payment"
                          >
                            <CreditCardIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBill(bill);
                              setShowBillForm(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(bill._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Form Modal */}
      {showBillForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <BillForm
              bill={selectedBill}
              onSubmit={selectedBill ? handleUpdate : handleCreate}
              onClose={() => {
                setShowBillForm(false);
                setSelectedBill(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <PaymentForm
              bill={selectedBill}
              onSubmit={(paymentData) => handlePayment(selectedBill._id, paymentData)}
              onClose={() => {
                setShowPaymentForm(false);
                setSelectedBill(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;