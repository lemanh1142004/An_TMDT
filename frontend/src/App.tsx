import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { UnauthorizedPage } from './components/UnauthorizedPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="unauthorized" element={<UnauthorizedPage />} />
            
            {/* General Protected Profile Route */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Role-based Portals */}
            <Route
              path="admin"
              element={
                <RoleRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />

            <Route
              path="staff"
              element={
                <RoleRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
                  <StaffDashboard />
                </RoleRoute>
              }
            />

            <Route
              path="customer"
              element={
                <RoleRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN', 'ROLE_STAFF']}>
                  <CustomerDashboard />
                </RoleRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
