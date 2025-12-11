import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { patientAPI, doctorAPI, appointmentAPI, billingAPI, inventoryAPI } from './services/api';
import {
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
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
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patientStats: {},
    doctorStats: {},
    appointmentStats: {},
    billStats: {},
    inventoryStats: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch all statistics based on user role
        const promises = [];

        if (user.role === 'Admin' || user.role === 'Doctor' || user.role === 'Nurse') {
          promises.push(patientAPI.getPatientStats());
        }

        if (user.role === 'Admin' || user.role === 'Doctor') {
          promises.push(doctorAPI.getDoctorStats());
          promises.push(appointmentAPI.getAppointmentStats());
        }

        if (user.role === 'Admin' || user.role === 'Receptionist') {
          promises.push(billAPI.getBillStats());
        }

        if (user.role === 'Admin' || user.role === 'Nurse') {
          promises.push(inventoryAPI.getInventoryStats());
        }

        const results = await Promise.all(promises);

        const newStats = {};
        results.forEach((result) => {
          if (result.data.data) {
            // Determine which stat this is based on the data structure
            if (result.data.data.totalPatients !== undefined) {
              newStats.patientStats = result.data.data;
            } else if (result.data.data.totalDoctors !== undefined) {
              newStats.doctorStats = result.data.data;
            } else if (result.data.data.todaysAppointments !== undefined) {
              newStats.appointmentStats = result.data.data;
            } else if (result.data.data.totalRevenue !== undefined) {
              newStats.billStats = result.data.data;
            } else if (result.data.data.totalItems !== undefined) {
              newStats.inventoryStats = result.data.data;
            }
          }
        });

        setStats(newStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.role]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Patients',
      value: stats.patientStats.totalPatients || 0,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Active Doctors',
      value: stats.doctorStats.totalDoctors || 0,
      icon: UserIcon,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'increase',
    },
    {
      name: "Today's Appointments",
      value: stats.appointmentStats.todaysAppointments || 0,
      icon: CalendarIcon,
      color: 'bg-yellow-500',
      change: '+8%',
      changeType: 'increase',
    },
    {
      name: 'Monthly Revenue',
      value: `₹${stats.billStats.monthlyRevenue?.total || 0}`,
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'increase',
    },
    {
      name: 'Inventory Items',
      value: stats.inventoryStats.totalItems || 0,
      icon: CubeIcon,
      color: 'bg-red-500',
      change: '-2%',
      changeType: 'decrease',
    },
    {
      name: 'Pending Payments',
      value: `₹${stats.billStats.totalRevenue?.pending || 0}`,
      icon: CurrencyDollarIcon,
      color: 'bg-orange-500',
      change: '-5%',
      changeType: 'decrease',
    },
  ];

  // Sample data for charts
  const appointmentData = [
    { month: 'Jan', appointments: 45 },
    { month: 'Feb', appointments: 52 },
    { month: 'Mar', appointments: 48 },
    { month: 'Apr', appointments: 60 },
    { month: 'May', appointments: 55 },
    { month: 'Jun', appointments: 65 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 450000, expenses: 320000 },
    { month: 'Feb', revenue: 520000, expenses: 380000 },
    { month: 'Mar', revenue: 480000, expenses: 350000 },
    { month: 'Apr', revenue: 600000, expenses: 420000 },
    { month: 'May', revenue: 550000, expenses: 390000 },
    { month: 'Jun', revenue: 650000, expenses: 450000 },
  ];

  const patientDistribution = [
    { name: 'Admitted', value: stats.patientStats.admittedPatients || 15 },
    { name: 'Outpatient', value: stats.patientStats.outpatientPatients || 85 },
    { name: 'Discharged', value: stats.patientStats.dischargedPatients || 45 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user.name}! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.name}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{card.value}</p>
                <div className="mt-2 flex items-center">
                  {card.changeType === 'increase' ? (
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`ml-2 text-sm font-medium ${card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {card.change}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">from last month</span>
                </div>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenses</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" />
                <Bar dataKey="expenses" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Distribution */}
        <div className="card lg:col-span-2">
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
                  {patientDistribution.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[patientDistribution.indexOf(entry) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {[
              { id: 1, action: 'New appointment booked', user: 'John Doe', time: '2 hours ago' },
              { id: 2, action: 'Patient discharge completed', user: 'Dr. Smith', time: '4 hours ago' },
              { id: 3, action: 'Medicine restocked', user: 'Nurse Jane', time: '6 hours ago' },
              { id: 4, action: 'Bill payment received', user: 'Receptionist', time: '1 day ago' },
              { id: 5, action: 'New doctor registered', user: 'Admin', time: '2 days ago' },
            ].map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index !== 4 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                        <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                      </div>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">by {activity.user}</p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;