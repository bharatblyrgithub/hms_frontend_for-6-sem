import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Patient API
export const patientAPI = {
  getPatients: (params = {}) => api.get('/patients', { params }),
  getPatient: (id) => api.get(`/patients/${id}`),
  createPatient: (data) => api.post('/patients', data),
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),
  deletePatient: (id) => api.delete(`/patients/${id}`),
};

// Doctor API
export const doctorAPI = {
  getDoctors: (params = {}) => api.get('/doctors', { params }),
  getDoctor: (id) => api.get(`/doctors/${id}`),
  createDoctor: (data) => api.post('/doctors', data),
  updateDoctor: (id, data) => api.put(`/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),
  getAvailableSlots: (doctorId, date) => api.get(`/doctors/${doctorId}/available-slots`, { params: { date } }),
};

// Appointment API
export const appointmentAPI = {
  getAppointments: (params = {}) => api.get('/appointments', { params }),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  createAppointment: (data) => api.post('/appointments', data),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
};

// Billing API
export const billingAPI = {
  getBills: (params = {}) => api.get('/bills', { params }),
  getBill: (id) => api.get(`/bills/${id}`),
  createBill: (data) => api.post('/bills', data),
  updateBill: (id, data) => api.put(`/bills/${id}`, data),
  deleteBill: (id) => api.delete(`/bills/${id}`),
};

// Inventory API
export const inventoryAPI = {
  getItems: (params = {}) => api.get('/inventory', { params }),
  getItem: (id) => api.get(`/inventory/${id}`),
  createItem: (data) => api.post('/inventory', data),
  updateItem: (id, data) => api.put(`/inventory/${id}`, data),
  deleteItem: (id) => api.delete(`/inventory/${id}`),
  restockItem: (id, data) => api.put(`/inventory/${id}/restock`, data),
};

// Reports API
export const reportsAPI = {
  getReports: (params = {}) => api.get('/reports', { params }),
  generateReport: (data) => api.post('/reports/generate', data),
};

export default api;
