import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { patientAPI } from './services/api';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import PatientForm from '../components/Patients/PatientForm';

const Patients = () => {
  const { hasRole } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalPatients: 0,
    limit: 10,
  });

  const fetchPatients = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        search: searchTerm,
      };

      const response = await patientAPI.getPatients(params);
      setPatients(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch patients');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, searchTerm]);

  useEffect(() => {
    fetchPatients();
  }, [searchTerm, fetchPatients]);

  const handleCreate = async (patientData) => {
    try {
      await patientAPI.createPatient(patientData);
      toast.success('Patient created successfully');
      setShowForm(false);
      fetchPatients();
    } catch (error) {
      console.error('Create patient error:', error);
      toast.error(error.response?.data?.message || 'Failed to create patient');
    }
  };

  const handleUpdate = async (id, patientData) => {
    try {
      await patientAPI.updatePatient(id, patientData);
      toast.success('Patient updated successfully');
      setShowForm(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (error) {
      console.error('Update patient error:', error);
      toast.error(error.response?.data?.message || 'Failed to update patient');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      await patientAPI.deletePatient(id);
      toast.success('Patient deleted successfully');
      fetchPatients();
    } catch (error) {
      console.error('Delete patient error:', error);
      toast.error('Failed to delete patient');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Admitted':
        return 'bg-green-100 text-green-800';
      case 'Discharged':
        return 'bg-blue-100 text-blue-800';
      case 'Outpatient':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && patients.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="mt-2 text-gray-600">
            Manage patient records and information
          </p>
        </div>
        {hasRole(['Admin', 'Receptionist']) && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Patient
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search patients by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="input-field">
              <option value="">All Status</option>
              <option value="Admitted">Admitted</option>
              <option value="Discharged">Discharged</option>
              <option value="Outpatient">Outpatient</option>
            </select>
            <select className="input-field">
              <option value="name">Sort by Name</option>
              <option value="createdAt">Sort by Date</option>
              <option value="age">Sort by Age</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age/Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {patient._id.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.contact?.phone}</div>
                    <div className="text-sm text-gray-500">{patient.contact?.emergencyContact?.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.age} years</div>
                    <div className="text-sm text-gray-500">{patient.gender}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.assignedDoctor?.name || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowForm(true);
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
                              setSelectedPatient(patient);
                              setShowForm(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(patient._id)}
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

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.totalPatients)}
            </span>{' '}
            of <span className="font-medium">{pagination.totalPatients}</span> patients
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchPatients(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchPatients(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Patient Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <PatientForm
              patient={selectedPatient}
              onSubmit={selectedPatient ? handleUpdate : handleCreate}
              onClose={() => {
                setShowForm(false);
                setSelectedPatient(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;