// Central route definitions using React Router v7 style API
import React from 'react'
import { createBrowserRouter } from 'react-router'
import { RootLayout } from './ui/layouts/RootLayout.tsx'
import { HomePage } from './ui/pages/HomePage.tsx'
import { AboutPage } from './ui/pages/AboutPage.jsx'
import { NotFoundPage } from './ui/pages/NotFoundPage.jsx'
import { LoginPage } from './ui/pages/unauthorized/LoginPage.tsx'
import { ForgotPasswordPage } from './ui/pages/unauthorized/ForgotPasswordPage.tsx'
import { ResetPasswordPage } from './ui/pages/unauthorized/ResetPasswordPage.tsx'
import { MfaVerifyPage } from './ui/pages/unauthorized/MfaVerifyPage.tsx'
import { MfaSetupIntroPage } from './ui/pages/unauthorized/MfaSetupIntroPage.tsx'
import { MfaSetupTotpPage } from './ui/pages/unauthorized/MfaSetupTotpPage.tsx'
import { MfaSetupVerifyPage } from './ui/pages/unauthorized/MfaSetupVerifyPage.tsx'
import { MfaRecoveryPage } from './ui/pages/unauthorized/MfaRecoveryPage.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { SecuritySettings } from './ui/pages/settings/SecuritySettings.tsx'
import { EmployeesPage } from './ui/pages/employees/EmployeesPage.tsx'
import { EmployeeDetailPage } from './ui/pages/employees/detail/EmployeeDetailPage.tsx'
import { SuperAdminPage } from './ui/pages/superadmin/SuperAdminPage.tsx'
import CalendarPage from './ui/pages/calendar/CalendarPage.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />, // fallback for route errors
    children: [
      { index: true, element: (
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      ) },
      { path: 'about', element: (
        <ProtectedRoute>
          <AboutPage />
        </ProtectedRoute>
      ) },
      { path: 'empleados', element: (
        <ProtectedRoute>
          <EmployeesPage />
        </ProtectedRoute>
      ) },
      { path: 'empleados/:id', element: (
        <ProtectedRoute>
          <EmployeeDetailPage />
        </ProtectedRoute>
      ) },
      { path: 'calendario', element: (
        <ProtectedRoute>
          <CalendarPage />
        </ProtectedRoute>
      ) },
      { path: 'settings/security', element: (
        <ProtectedRoute>
          <SecuritySettings />
        </ProtectedRoute>
      ) },
      { path: 'superadmin', element: (
        <ProtectedRoute>
          <SuperAdminPage />
        </ProtectedRoute>
      ) },
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'mfa/verify', element: <MfaVerifyPage /> },
      { path: 'mfa/setup-intro', element: <MfaSetupIntroPage /> },
      { path: 'mfa/setup/totp', element: <MfaSetupTotpPage /> },
      { path: 'mfa/setup/verify', element: <MfaSetupVerifyPage /> },
      { path: 'mfa/recovery', element: <MfaRecoveryPage /> },
      { path: '*', element: (
        <ProtectedRoute>
          <NotFoundPage />
        </ProtectedRoute>
      ) },
    ],
  },
])
