import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from './features/auth/login/LoginPage';
import Dashboard from './features/dashboard/DashboardPage';
import ProfilePage from './features/profile/ProfilePage';
import SubsidiaryPage from './features/subsidiaries/SubsidiaryPage';
import Attendance from './features/assistance/Attendance';

import { useAuth } from './hooks/useAuth';

import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/sucursales" element={<SubsidiaryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/asistencia" element={<Attendance />} />
        {/* …other modules… */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
