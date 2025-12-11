import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';

const DoctorForm = ({ doctor, onSubmit, onClose }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [schedule, setSchedule] = useState(doctor?.schedule || [
    { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true }
  ]);
  const [qualifications, setQualifications] = useState(doctor?.qualifications || []);
  const [qualificationInput, setQualificationInput] = useState('');

  useEffect(() => {
    if (doctor) {
      reset({
        name: doctor.name,
        specialization: doctor.specialization,
        department: doctor.department || '',
        licenseNumber: doctor.licenseNumber || '',
        consultationFee: doctor.consultationFee || 500,
        experience: doctor.experience || 0,
        maxPatientsPerDay: doctor.maxPatientsPerDay || 20,
        contact: {
          phone: doctor.contact?.phone || '',
          email: doctor.contact?.email || ''
        }
      });
    }
  }, [doctor, reset]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const addQualification = () => {
    if (qualificationInput.trim() && !qualifications.includes(qualificationInput.trim())) {
      setQualifications([...qualifications, qualificationInput.trim()]);
      setQualificationInput('');
    }
  };

  const removeQualification = (index) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  const toggleDay = (day) => {
    const existing = schedule.find(s => s.day === day);
    if (existing) {
      setSchedule(schedule.filter(s => s.day !== day));
    } else {
      setSchedule([...schedule, { day, startTime: '09:00', endTime: '17:00', isAvailable: true }]);
    }
  };

  const updateScheduleTime = (day, field, value) => {
    setSchedule(schedule.map(s => 
      s.day === day ? { ...s, [field]: value } : s
    ));
  };

  const submitHandler = (data) => {
    const doctorData = {
      ...data,
      schedule,
      qualifications,
      availableDays: schedule.map(s => s.day)
    };
    
    if (doctor) {
      onSubmit(doctor._id, doctorData);
    } else {
      onSubmit(doctorData);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {doctor ? 'Edit Doctor' : 'Add New Doctor'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <label className="label">Specialization</label>
            <select
              {...register('specialization', { required: 'Specialization is required' })}
              className="input-field"
            >
              <option value="">Select Specialization</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Emergency Medicine">Emergency Medicine</option>
              <option value="Family Medicine">Family Medicine</option>
              <option value="Neurology">Neurology</option>
              <option value="Oncology">Oncology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Psychiatry">Psychiatry</option>
              <option value="Radiology">Radiology</option>
              <option value="Surgery">Surgery</option>
              <option value="Urology">Urology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Ophthalmology">Ophthalmology</option>
              <option value="ENT">ENT</option>
            </select>
            {errors.specialization && (
              <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>
            )}
          </div>

          <div>
            <label className="label">License Number</label>
            <input
              type="text"
              {...register('licenseNumber', { required: 'License number is required' })}
              className="input-field"
            />
            {errors.licenseNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.licenseNumber.message}</p>
            )}
          </div>

          <div>
            <label className="label">Department</label>
            <input
              type="text"
              {...register('department')}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Consultation Fee (₹)</label>
            <input
              type="number"
              {...register('consultationFee', { 
                required: 'Fee is required',
                min: { value: 0, message: 'Fee must be positive' }
              })}
              className="input-field"
            />
            {errors.consultationFee && (
              <p className="mt-1 text-sm text-red-600">{errors.consultationFee.message}</p>
            )}
          </div>

          <div>
            <label className="label">Experience (years)</label>
            <input
              type="number"
              {...register('experience', { 
                min: { value: 0, message: 'Experience must be positive' }
              })}
              className="input-field"
            />
            {errors.experience && (
              <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>
            )}
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              {...register('contact.phone')}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              {...register('contact.email')}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Max Patients Per Day</label>
            <input
              type="number"
              {...register('maxPatientsPerDay', { 
                min: { value: 1, message: 'Minimum 1 patient per day' }
              })}
              className="input-field"
            />
            {errors.maxPatientsPerDay && (
              <p className="mt-1 text-sm text-red-600">{errors.maxPatientsPerDay.message}</p>
            )}
          </div>
        </div>

        {/* Qualifications */}
        <div>
          <label className="label">Qualifications</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={qualificationInput}
              onChange={(e) => setQualificationInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
              className="input-field"
              placeholder="Add qualification (e.g., MD, MBBS)" // cspell:disable-line
            />
            <button
              type="button"
              onClick={addQualification}
              className="btn-primary whitespace-nowrap"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {qualifications.map((qual, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
              >
                <span>{qual}</span>
                <button
                  type="button"
                  onClick={() => removeQualification(index)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="label">Schedule</label>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {days.map((day) => {
                const isSelected = schedule.some(s => s.day === day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-md ${
                      isSelected
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                );
              })}
            </div>

            {schedule.map((slot) => (
              <div key={slot.day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                <span className="font-medium min-w-24">{slot.day}</span>
                <div className="flex items-center gap-2">
                  <label className="text-sm">From:</label>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateScheduleTime(slot.day, 'startTime', e.target.value)}
                    className="input-field py-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm">To:</label>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateScheduleTime(slot.day, 'endTime', e.target.value)}
                    className="input-field py-1"
                  />
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={slot.isAvailable}
                    onChange={(e) => updateScheduleTime(slot.day, 'isAvailable', e.target.checked)}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm">Available</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {doctor ? 'Update Doctor' : 'Create Doctor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorForm;