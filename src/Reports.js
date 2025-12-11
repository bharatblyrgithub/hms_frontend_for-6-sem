import React, { useState, useEffect } from 'react';
import { patientAPI, doctorAPI, appointmentAPI, billingAPI, inventoryAPI } from './services/api';
import { toast } from 'react-hot-toast';
import {
  DocumentChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CubeIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    patientStats: {},
    doctorStats: {},
    appointmentStats: {},
    billStats: {},
    inventoryStats: {},
  });
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAllStats();
  }, [dateRange]);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const [
        patientRes,
        doctorRes,
        appointmentRes,
        billRes,
        inventoryRes
      ] = await Promise.all([
        patientAPI.getPatientStats(),
        doctorAPI.getDoctorStats(),
        appointmentAPI.getAppointmentStats(),
        billAPI.getBillStats(),
        inventoryAPI.getInventoryStats()
      ]);

      setStats({
        patientStats: patientRes.data.data,
        doctorStats: doctorRes.data.data,
        appointmentStats: appointmentRes.data.data,
        billStats: billRes.data.data,
        inventoryStats: inventoryRes.data.data,
      });
    } catch (error) {
      toast.error('Failed to fetch report data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + data.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = (type) => {
    // Implement export based on type
    switch (type) {
      case 'patients':
        exportToCSV([
          { Name: 'John Doe', Age: 45, Gender: 'Male', Status: 'Admitted' },
          { Name: 'Jane Smith', Age: 32, Gender: 'Female', Status: 'Outpatient' },
        ], 'patients_report.csv');
        break;
      case 'appointments':
        exportToCSV([
          { Date: '2024-01-15', Patient: 'John Doe', Doctor: 'Dr. Smith', Status: 'Completed' },
          { Date: '2024-01-16', Patient: 'Jane Smith', Doctor: 'Dr. Johnson', Status: 'Scheduled' },
        ], 'appointments_report.csv');
        break;
      case 'billing':
        exportToCSV([
          { BillNumber: 'HMS-001', Patient: 'John Doe', Amount: 1000, Status: 'Paid' },
          { BillNumber: 'HMS-002', Patient: 'Jane Smith', Amount: 500, Status: 'Unpaid' },
        ], 'billing_report.csv');
        break;
      case 'inventory':
        exportToCSV([
          { ItemName: 'Paracetamol', Category: 'Medicine', Quantity: 100, Status: 'In Stock' },
          { ItemName: 'Stethoscope', Category: 'Equipment', Quantity: 5, Status: 'Low Stock' },
        ], 'inventory_report.csv');
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Prepare data for charts
  const appointmentTrendData = [
    { month: 'Jan', appointments: 45 },
    { month: 'Feb', appointments: 52 },
    { month: 'Mar', appointments: 48 },
    { month: 'Apr', appointments: 60 },
    { month: 'May', appointments: 55 },
    { month: 'Jun', appointments: 65 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 450000, expenses: 320000, profit: 130000 },
    { month: 'Feb', revenue: 520000, expenses: 380000, profit: 140000 },
    { month: 'Mar', revenue: 480000, expenses: 350000, profit: 130000 },
    { month: 'Apr', revenue: 600000, expenses: 420000, profit: 180000 },
    { month: 'May', revenue: 550000, expenses: 390000, profit: 160000 },
    { month: 'Jun', revenue: 650000, expenses: 450000, profit: 200000 },
  ];

  const patientDistribution = [
    { name: 'Admitted', value: stats.patientStats.admittedPatients || 15 },
    { name: 'Outpatient', value: stats.patientStats.outpatientPatients || 85 },
    { name: 'Discharged', value: stats.patientStats.dischargedPatients || 45 },
  ];

  const inventoryCategoryData = [
    { name: 'Medicine', value: 45 },
    { name: 'Equipment', value: 25 },
    { name: 'Supplies', value: 20 },
    { name: 'Lab', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive reports and analytics dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input-field"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.patientStats.totalPatients || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CalendarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Appointments Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.appointmentStats.todaysAppointments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats.billStats.monthlyRevenue?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <CubeIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inventoryStats.lowStockCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <button
              onClick={() => handleExport('billing')}
              className="text-sm text-primary-600 hover:text-primary-900 flex items-center"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Area type="monotone" dataKey="profit" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointments Trend */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Appointments Trend</h3>
            <button
              onClick={() => handleExport('appointments')}
              className="text-sm text-primary-600 hover:text-primary-900 flex items-center"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appointmentTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={patientDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {patientDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryCategoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Status</h3>
          <div className="space-y-3">
            {stats.appointmentStats.statusStats?.map((stat) => (
              <div key={stat._id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{stat._id}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{stat.count} appointments</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(stat.count / (stats.appointmentStats.total || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
          <div className="space-y-3">
            {stats.billStats.paymentStatusStats?.map((stat) => (
              <div key={stat._id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{stat._id}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">₹{stat.amount?.toFixed(2)}</span>
                  <span className="text-sm text-gray-600">{stat.count} bills</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleExport('patients')}
            className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
          >
            <UserGroupIcon className="h-8 w-8 text-gray-600 mb-2" />
            <span className="text-sm font-medium">Patient Report</span>
            <span className="text-xs text-gray-500">CSV, PDF</span>
          </button>
          <button
            onClick={() => handleExport('appointments')}
            className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
          >
            <CalendarIcon className="h-8 w-8 text-gray-600 mb-2" />
            <span className="text-sm font-medium">Appointment Report</span>
            <span className="text-xs text-gray-500">CSV, PDF</span>
          </button>
          <button
            onClick={() => handleExport('billing')}
            className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
          >
            <CurrencyDollarIcon className="h-8 w-8 text-gray-600 mb-2" />
            <span className="text-sm font-medium">Financial Report</span>
            <span className="text-xs text-gray-500">CSV, PDF</span>
          </button>
          <button
            onClick={() => handleExport('inventory')}
            className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
          >
            <CubeIcon className="h-8 w-8 text-gray-600 mb-2" />
            <span className="text-sm font-medium">Inventory Report</span>
            <span className="text-xs text-gray-500">CSV, PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;