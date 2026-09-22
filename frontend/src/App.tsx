import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
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
      <StoreProvider>
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

              {/* Strictly Isolated Role-based Portals */}
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
                  <RoleRoute allowedRoles={['ROLE_STAFF']}>
                    <StaffDashboard />
                  </RoleRoute>
                }
              />

              <Route
                path="customer"
                element={
                  <RoleRoute allowedRoles={['ROLE_CUSTOMER']}>
                    <CustomerDashboard />
                  </RoleRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  );
};

export default App;
