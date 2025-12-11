import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { patientAPI, doctorAPI } from './services/api';
import { toast } from 'react-hot-toast';

const AppointmentForm = ({ appointment, onSubmit, onClose }) => {
  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      patient: '',
      doctor: '',
      date: '',
      timeSlot: { start: '', end: '' },
      appointmentType: 'Consultation',
      reason: '',
      symptoms: '',
      notes: ''
    }
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const doctorId = watch("doctor");
  const appointmentDate = watch("date");

  // Fetch Patients + Doctors
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [patientsRes, doctorsRes] = await Promise.all([
          patientAPI.getPatients({ limit: 100 }),
          doctorAPI.getDoctors({ isActive: true, limit: 100 })
        ]);
        setPatients(patientsRes?.data?.data || []);
        setDoctors(doctorsRes?.data?.data || []);
      } catch {
        toast.error("Failed to fetch patients/doctors");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Reset form for editing
  useEffect(() => {
    if (appointment) {
      reset({
        patient: appointment.patient?._id || "",
        doctor: appointment.doctor?._id || "",
        date: appointment.date ? new Date(appointment.date).toISOString().split("T")[0] : "",
        timeSlot: {
          start: appointment.timeSlot?.start || "",
          end: appointment.timeSlot?.end || "",
        },
        appointmentType: appointment.appointmentType || "Consultation",
        reason: appointment.reason || "",
        symptoms: appointment.symptoms?.join(", ") || "",
        notes: appointment.notes || "",
      });
    }
  }, [appointment, reset]);

  // Fetch Available Slots
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctorId || !appointmentDate) {
        setAvailableSlots([]);
        reset({ timeSlot: { start: '', end: '' } }, { keepValues: true });
        return;
      }
      try {
        const res = await doctorAPI.getAvailableSlots(doctorId, appointmentDate);
        setAvailableSlots(res?.data?.data || []);
        // Reset timeSlot when doctor/date changes
        reset(prev => ({ ...prev, timeSlot: { start: '', end: '' } }));
      } catch {
        toast.error("Failed to fetch slots");
        setAvailableSlots([]);
      }
    };
    fetchSlots();
  }, [doctorId, appointmentDate, reset]);

  // Submit handler
  const submitHandler = (data) => {
    const payload = {
      ...data,
      symptoms: data.symptoms ? data.symptoms.split(",").map(s => s.trim()) : [],
      date: data.date, // send as YYYY-MM-DD string
    };
    if (appointment) onSubmit(appointment._id, payload);
    else onSubmit(payload);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{appointment ? "Edit Appointment" : "Book Appointment"}</h2>
        <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" /></button>
      </div>

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Patient */}
          <div>
            <label className="label">Patient</label>
            <select {...register("patient", { required: "Patient is required" })} className="input-field" disabled={loadingData}>
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            {errors.patient && <p className="text-red-600">{errors.patient.message}</p>}
          </div>

          {/* Doctor */}
          <div>
            <label className="label">Doctor</label>
            <select {...register("doctor", { required: "Doctor is required" })} className="input-field" disabled={loadingData}>
              <option value="">Select Doctor</option>
              {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} - {d.specialization}</option>)}
            </select>
            {errors.doctor && <p className="text-red-600">{errors.doctor.message}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="label">Date</label>
            <input type="date" {...register("date", { required: "Date is required" })} className="input-field" min={new Date().toISOString().split("T")[0]} />
            {errors.date && <p className="text-red-600">{errors.date.message}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="label">Type</label>
            <select {...register("appointmentType")} className="input-field">
              <option value="Consultation">Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Emergency">Emergency</option>
              <option value="Routine Checkup">Routine Checkup</option>
              <option value="Test">Test</option>
            </select>
          </div>

          {/* Start Time */}
          <Controller
            control={control}
            name="timeSlot.start"
            rules={{ required: "Start time is required" }}
            render={({ field }) => (
              <div>
                <label className="label">Start Time</label>
                {availableSlots.length ? (
                  <select {...field} className="input-field">
                    <option value="">Select Start</option>
                    {availableSlots.map((s, i) => <option key={i} value={s.start}>{s.start}</option>)}
                  </select>
                ) : <input type="time" {...field} className="input-field" />}
                {errors.timeSlot?.start && <p className="text-red-600">{errors.timeSlot.start.message}</p>}
              </div>
            )}
          />

          {/* End Time */}
          <Controller
            control={control}
            name="timeSlot.end"
            rules={{ required: "End time is required" }}
            render={({ field }) => (
              <div>
                <label className="label">End Time</label>
                {availableSlots.length ? (
                  <select {...field} className="input-field">
                    <option value="">Select End</option>
                    {availableSlots.map((s, i) => <option key={i} value={s.end}>{s.end}</option>)}
                  </select>
                ) : <input type="time" {...field} className="input-field" />}
                {errors.timeSlot?.end && <p className="text-red-600">{errors.timeSlot.end.message}</p>}
              </div>
            )}
          />

        </div>

        {/* Reason */}
        <div>
          <label className="label">Reason</label>
          <textarea {...register("reason", { required: "Reason is required" })} rows={3} className="input-field" />
          {errors.reason && <p className="text-red-600">{errors.reason.message}</p>}
        </div>

        {/* Symptoms */}
        <div>
          <label className="label">Symptoms (comma separated)</label>
          <input type="text" {...register("symptoms")} className="input-field" />
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes</label>
          <textarea {...register("notes")} rows={2} className="input-field" />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{appointment ? "Update" : "Book"}</button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
