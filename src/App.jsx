import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Layout from "./Layout.jsx";

// Lazy loaded pages
const Login = lazy(() => import("./Login.jsx"));
const Register = lazy(() => import("./Register.jsx"));
const Dashboard = lazy(() => import("./Dashboard.jsx"));
const Patients = lazy(() => import("./Patients.jsx"));
const Doctors = lazy(() => import("./Doctors.jsx"));
const Appointments = lazy(() => import("./Appointments.jsx"));
const Billing = lazy(() => import("./Billing.jsx"));
const Inventory = lazy(() => import("./Inventory.jsx"));
const Reports = lazy(() => import("./Reports.jsx"));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Suspense fallback={<LoadingSpinner />}>
              <Login />
            </Suspense>
          ) : (
            <Navigate to="/dashboard" />
          )
        }
      />

      <Route
        path="/register"
        element={
          !isAuthenticated ? (
            <Suspense fallback={<LoadingSpinner />}>
              <Register />
            </Suspense>
          ) : (
            <Navigate to="/dashboard" />
          )
        }
      />

      {/* Protected Routes with Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />

        <Route
          path="dashboard"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          }
        />

        <Route
          path="patients"
          element={
            <ProtectedRoute roles={["Admin", "Doctor", "Nurse", "Receptionist"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <Patients />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="doctors"
          element={
            <ProtectedRoute roles={["Admin", "Doctor", "Nurse", "Receptionist", "Patient"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <Doctors />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="appointments"
          element={
            <ProtectedRoute roles={["Admin", "Doctor", "Nurse", "Receptionist", "Patient"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <Appointments />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="billing"
          element={
            <ProtectedRoute roles={["Admin", "Receptionist"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <Billing />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="inventory"
          element={
            <ProtectedRoute roles={["Admin", "Nurse", "Doctor"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <Inventory />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="reports"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <Reports />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              style: {
                background: "#10b981",
              },
            },
            error: {
              duration: 4000,
              style: {
                background: "#ef4444",
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
