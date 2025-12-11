import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { appointmentAPI } from './services/api';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import AppointmentForm from './AppointmentForm';
import { format } from 'date-fns';

const Appointments = () => {
  const { user, hasRole } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        date: dateFilter,
        status: statusFilter,
      };

      // Optional: filter by patient role
      if (user.role === 'Patient') {
        params.patientId = user._id;
      }

      const response = await appointmentAPI.getAppointments(params);
      setAppointments(response.data.data);
    } catch (error) {
      console.error('Fetch appointments error:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, dateFilter, statusFilter, user._id, user.role]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Create appointment
  const handleCreate = async (appointmentData) => {
    try {
      await appointmentAPI.createAppointment(appointmentData);
      toast.success('Appointment booked successfully');
      setShowForm(false);
      fetchAppointments();
    } catch (error) {
      console.error('Create appointment error:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  // Update appointment
  const handleUpdate = async (id, appointmentData) => {
    try {
      await appointmentAPI.updateAppointment(id, appointmentData);
      toast.success('Appointment updated successfully');
      setShowForm(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Update appointment error:', error);
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    }
  };

  // Delete appointment
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentAPI.deleteAppointment(id);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Delete appointment error:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  // Update status
  const handleStatusChange = async (id, status) => {
    try {
      await appointmentAPI.updateAppointment(id, { status });
      toast.success(`Appointment ${status.toLowerCase()} successfully`);
      fetchAppointments();
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'No-Show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmed': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'Completed': return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'Cancelled': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default: return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-2 text-gray-600">Schedule and manage patient appointments</p>
        </div>
        {(hasRole(['Admin', 'Receptionist', 'Patient']) && user.role !== 'Patient') && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Book Appointment
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input-field"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field"
        >
          <option value="">All Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="No-Show">No-Show</option>
        </select>
      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {appointments.map((appointment) => (
          <div key={appointment._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(appointment.status)}
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(appointment.date), 'MMM dd, yyyy')}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Patient */}
                  <div>
                    <div className="text-sm text-gray-500">Patient</div>
                    <div className="font-medium text-gray-900">{appointment.patient?.name}</div>
                    <div className="text-sm text-gray-600">{appointment.patient?.age} years, {appointment.patient?.gender}</div>
                  </div>

                  {/* Doctor */}
                  <div>
                    <div className="text-sm text-gray-500">Doctor</div>
                    <div className="font-medium text-gray-900">Dr. {appointment.doctor?.name}</div>
                    <div className="text-sm text-primary-600">{appointment.doctor?.specialization}</div>
                  </div>

                  {/* Time & Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Time</div>
                      <div className="font-medium text-gray-900">{appointment.timeSlot?.start} - {appointment.timeSlot?.end}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Type</div>
                      <div className="font-medium text-gray-900">{appointment.appointmentType}</div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <div className="text-sm text-gray-500">Reason</div>
                    <div className="text-gray-900 line-clamp-2">{appointment.reason}</div>
                  </div>

                  {/* Notes */}
                  {appointment.notes && (
                    <div>
                      <div className="text-sm text-gray-500">Notes</div>
                      <div className="text-gray-900 text-sm">{appointment.notes}</div>
                    </div>
                  )}

                  {/* Fee & Payment */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="text-sm text-gray-500">Fee</div>
                      <div className="font-medium text-gray-900">₹{appointment.consultationFee}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Payment</div>
                      <div className={`font-medium ${appointment.paymentStatus === 'Paid' ? 'text-green-600' :
                        appointment.paymentStatus === 'Partial' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                        {appointment.paymentStatus}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Created by: {appointment.createdBy?.name || 'System'}
                </div>
                <div className="flex space-x-2">
                  {hasRole(['Admin', 'Doctor', 'Receptionist']) && appointment.status === 'Scheduled' && (
                    <button onClick={() => handleStatusChange(appointment._id, 'Confirmed')}
                      className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">Confirm</button>
                  )}
                  {hasRole(['Admin', 'Doctor']) && appointment.status === 'Confirmed' && (
                    <button onClick={() => handleStatusChange(appointment._id, 'Completed')}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">Complete</button>
                  )}
                  {hasRole(['Admin', 'Receptionist', 'Patient']) && appointment.status !== 'Cancelled' && (
                    <button onClick={() => handleStatusChange(appointment._id, 'Cancelled')}
                      className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">Cancel</button>
                  )}
                  {hasRole(['Admin', 'Receptionist', 'Doctor']) && (
                    <button onClick={() => { setSelectedAppointment(appointment); setShowForm(true); }}
                      className="text-yellow-600 hover:text-yellow-900" title="Edit">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  )}
                  {hasRole(['Admin', 'Receptionist']) && (
                    <button onClick={() => handleDelete(appointment._id)}
                      className="text-red-600 hover:text-red-900" title="Delete">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <AppointmentForm
              appointment={selectedAppointment}
              onSubmit={selectedAppointment ? (data) => handleUpdate(selectedAppointment._id, data) : handleCreate}
              onClose={() => { setShowForm(false); setSelectedAppointment(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
