import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doctorAPI } from './services/api';
import { toast } from 'react-hot-toast';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import DoctorForm from '../components/Doctors/DoctorForm';

const Doctors = () => {
  const { hasRole } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specializations] = useState([
    'Cardiology', 'Dermatology', 'Emergency Medicine', 'Family Medicine',
    'Neurology', 'Oncology', 'Pediatrics', 'Psychiatry', 'Radiology',
    'Surgery', 'Urology', 'Orthopedics', 'Ophthalmology', 'ENT'
  ]);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        isActive: true,
      };

      const response = await doctorAPI.getDoctors(params);
      setDoctors(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch doctors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleCreate = async (doctorData) => {
    try {
      await doctorAPI.createDoctor(doctorData);
      toast.success('Doctor created successfully');
      setShowForm(false);
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create doctor');
    }
  };

  const handleUpdate = async (id, doctorData) => {
    try {
      await doctorAPI.updateDoctor(id, doctorData);
      toast.success('Doctor updated successfully');
      setShowForm(false);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update doctor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this doctor?')) {
      return;
    }

    try {
      await doctorAPI.deleteDoctor(id);
      toast.success('Doctor deactivated successfully');
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate doctor');
    }
  };

  const getExperienceLevel = (experience) => {
    if (experience < 5) return 'Junior';
    if (experience < 10) return 'Mid-level';
    if (experience < 20) return 'Senior';
    return 'Expert';
  };

  if (loading && doctors.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
          <p className="mt-2 text-gray-600">
            Manage doctors and their schedules
          </p>
        </div>
        {hasRole(['Admin']) && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Doctor
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
              placeholder="Search doctors by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
        </div>
        <select className="input-field">
          <option value="">All Specializations</option>
          {specializations.map((spec) => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
        <select className="input-field">
          <option value="name">Sort by Name</option>
          <option value="experience">Sort by Experience</option>
          <option value="consultationFee">Sort by Fee</option>
        </select>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-lg">
                      {doctor.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                    <p className="text-sm text-primary-600">{doctor.specialization}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <StarIcon className="h-4 w-4 mr-2" />
                    <span>Consultation: ₹{doctor.consultationFee}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Department:</span> {doctor.department}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">Availability:</div>
                  <div className="flex flex-wrap gap-1">
                    {doctor.schedule?.slice(0, 3).map((sched, idx) => ( // cspell:disable-line
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                      >
                        {sched.day.substring(0, 3)} // cspell:disable-line
                      </span>
                    ))}
                    {doctor.schedule?.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        +{doctor.schedule.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getExperienceLevel(doctor.experience) === 'Expert'
                      ? 'bg-purple-100 text-purple-800'
                      : getExperienceLevel(doctor.experience) === 'Senior'
                        ? 'bg-blue-100 text-blue-800'
                        : getExperienceLevel(doctor.experience) === 'Mid-level'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {getExperienceLevel(doctor.experience)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedDoctor(doctor);
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
                          setSelectedDoctor(doctor);
                          setShowForm(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doctor._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Deactivate"
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

      {/* Doctor Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <DoctorForm
              doctor={selectedDoctor}
              onSubmit={selectedDoctor ? handleUpdate : handleCreate}
              onClose={() => {
                setShowForm(false);
                setSelectedDoctor(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;