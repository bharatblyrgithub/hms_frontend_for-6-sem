import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { doctorAPI } from './services/api';

const PatientForm = ({ patient, onSubmit, onClose }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [doctors, setDoctors] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [medications, setMedications] = useState([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedicalRecord, setNewMedicalRecord] = useState({
    condition: '',
    diagnosedDate: '',
    treatment: '',
    notes: ''
  });
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorAPI.getDoctors({ isActive: true, limit: 100 });
        setDoctors(response.data.data);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (patient) {
      reset({
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        'contact.phone': patient.contact?.phone || '',
        'contact.emergencyContact.name': patient.contact?.emergencyContact?.name || '',
        'contact.emergencyContact.phone': patient.contact?.emergencyContact?.phone || '',
        'contact.emergencyContact.relationship': patient.contact?.emergencyContact?.relationship || '',
        'address.street': patient.address?.street || '',
        'address.city': patient.address?.city || '',
        'address.state': patient.address?.state || '',
        'address.zipCode': patient.address?.zipCode || '',
        'address.country': patient.address?.country || '',
        bloodGroup: patient.bloodGroup || '',
        assignedDoctor: patient.assignedDoctor?._id || '',
        roomNumber: patient.roomNumber || '',
        admissionDate: patient.admissionDate ? new Date(patient.admissionDate).toISOString().split('T')[0] : '',
        dischargeDate: patient.dischargeDate ? new Date(patient.dischargeDate).toISOString().split('T')[0] : '',
        status: patient.status || 'Outpatient',
        'insuranceInfo.provider': patient.insuranceInfo?.provider || '',
        'insuranceInfo.policyNumber': patient.insuranceInfo?.policyNumber || '',
        'insuranceInfo.validity': patient.insuranceInfo?.validity ? new Date(patient.insuranceInfo.validity).toISOString().split('T')[0] : '',
        email: patient.email || ''
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMedicalHistory(patient.medicalHistory || []);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllergies(patient.allergies || []);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMedications(patient.currentMedications || []);
    }
  }, [patient, reset]);

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (index) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const addMedicalRecord = () => {
    if (newMedicalRecord.condition.trim()) {
      setMedicalHistory([...medicalHistory, { ...newMedicalRecord }]);
      setNewMedicalRecord({
        condition: '',
        diagnosedDate: '',
        treatment: '',
        notes: ''
      });
    }
  };

  const removeMedicalRecord = (index) => {
    setMedicalHistory(medicalHistory.filter((_, i) => i !== index));
  };

  const addMedication = () => {
    if (newMedication.name.trim()) {
      setMedications([...medications, { ...newMedication }]);
      setNewMedication({
        name: '',
        dosage: '',
        frequency: '',
        startDate: '',
        endDate: ''
      });
    }
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const submitHandler = (data) => {
    const patientData = {
      ...data,
      medicalHistory,
      allergies,
      currentMedications: medications,
      admissionDate: data.admissionDate ? new Date(data.admissionDate) : undefined,
      dischargeDate: data.dischargeDate ? new Date(data.dischargeDate) : undefined,
      'insuranceInfo.validity': data['insuranceInfo.validity'] ? new Date(data['insuranceInfo.validity']) : undefined
    };

    if (patient) {
      onSubmit(patient._id, patientData);
    } else {
      onSubmit(patientData);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {patient ? 'Edit Patient' : 'Add New Patient'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="input-field"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label">Age</label>
            <input
              type="number"
              {...register('age', {
                required: 'Age is required',
                min: { value: 0, message: 'Age must be positive' },
                max: { value: 120, message: 'Age must be less than 120' }
              })}
              className="input-field"
            />
            {errors.age && (
              <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
            )}
          </div>

          <div>
            <label className="label">Gender</label>
            <select
              {...register('gender', { required: 'Gender is required' })}
              className="input-field"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                {...register('contact.phone', { required: 'Phone number is required' })}
                className="input-field"
              />
              {errors.contact?.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.contact.phone.message}</p>
              )}
            </div>

            <div>
              <label className="label">Email (Optional)</label>
              <input
                type="email"
                {...register('email')}
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-md font-medium text-gray-900 mb-2">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  {...register('contact.emergencyContact.name')}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  {...register('contact.emergencyContact.phone')}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Relationship</label>
                <input
                  type="text"
                  {...register('contact.emergencyContact.relationship')}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Street</label>
              <input
                type="text"
                {...register('address.street')}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">City</label>
              <input
                type="text"
                {...register('address.city')}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">State</label>
              <input
                type="text"
                {...register('address.state')}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Zip Code</label>
              <input
                type="text"
                {...register('address.zipCode')}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Country</label>
              <input
                type="text"
                {...register('address.country')}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="label">Blood Group</label>
              <select
                {...register('bloodGroup')}
                className="input-field"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="label">Assigned Doctor</label>
              <select
                {...register('assignedDoctor')}
                className="input-field"
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Room Number</label>
              <input
                type="text"
                {...register('roomNumber')}
                className="input-field"
              />
            </div>
          </div>

          {/* Allergies */}
          <div className="mb-6">
            <label className="label">Allergies</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                className="input-field"
                placeholder="Add allergy"
              />
              <button
                type="button"
                onClick={addAllergy}
                className="btn-primary whitespace-nowrap"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full"
                >
                  <span>{allergy}</span>
                  <button
                    type="button"
                    onClick={() => removeAllergy(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Medical History */}
          <div className="mb-6">
            <label className="label">Medical History</label>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newMedicalRecord.condition}
                  onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, condition: e.target.value })}
                  className="input-field"
                  placeholder="Condition"
                />
                <input
                  type="date"
                  value={newMedicalRecord.diagnosedDate}
                  onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, diagnosedDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newMedicalRecord.treatment}
                  onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, treatment: e.target.value })}
                  className="input-field"
                  placeholder="Treatment"
                />
                <input
                  type="text"
                  value={newMedicalRecord.notes}
                  onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, notes: e.target.value })}
                  className="input-field"
                  placeholder="Notes"
                />
              </div>
              <button
                type="button"
                onClick={addMedicalRecord}
                className="btn-secondary"
              >
                Add Medical Record
              </button>

              {/* Medical History List */}
              <div className="space-y-2">
                {medicalHistory.map((record, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{record.condition}</div>
                        <div className="text-sm text-gray-600">Diagnosed: {new Date(record.diagnosedDate).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-600">Treatment: {record.treatment}</div>
                        {record.notes && (
                          <div className="text-sm text-gray-600">Notes: {record.notes}</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedicalRecord(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Medications */}
          <div>
            <label className="label">Current Medications</label>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <input
                  type="text"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  className="input-field"
                  placeholder="Medication Name"
                />
                <input
                  type="text"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  className="input-field"
                  placeholder="Dosage"
                />
                <input
                  type="text"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                  className="input-field"
                  placeholder="Frequency"
                />
                <input
                  type="date"
                  value={newMedication.startDate}
                  onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
                  className="input-field"
                />
                <input
                  type="date"
                  value={newMedication.endDate}
                  onChange={(e) => setNewMedication({ ...newMedication, endDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <button
                type="button"
                onClick={addMedication}
                className="btn-secondary"
              >
                Add Medication
              </button>

              {/* Medications List */}
              <div className="space-y-2">
                {medications.map((med, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{med.name}</div>
                        <div className="text-sm text-gray-600">
                          {med.dosage} - {med.frequency}
                        </div>
                        <div className="text-sm text-gray-600">
                          From {new Date(med.startDate).toLocaleDateString()} to {med.endDate ? new Date(med.endDate).toLocaleDateString() : 'Ongoing'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hospital Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label">Status</label>
            <select
              {...register('status')}
              className="input-field"
            >
              <option value="Outpatient">Outpatient</option>
              <option value="Admitted">Admitted</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>

          <div>
            <label className="label">Admission Date</label>
            <input
              type="date"
              {...register('admissionDate')}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Discharge Date</label>
            <input
              type="date"
              {...register('dischargeDate')}
              className="input-field"
            />
          </div>
        </div>

        {/* Insurance Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="label">Provider</label>
              <input
                type="text"
                {...register('insuranceInfo.provider')}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Policy Number</label>
              <input
                type="text"
                {...register('insuranceInfo.policyNumber')}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Validity</label>
              <input
                type="date"
                {...register('insuranceInfo.validity')}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {patient ? 'Update Patient' : 'Create Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;