import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UnauthorizedPage } from './UnauthorizedPage';
import { Loader2 } from 'lucide-react';
import type { RoleType } from '../types';

interface RoleRouteProps {
  allowedRoles: RoleType[];
  children: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasPermission = user.roles.some((role) => allowedRoles.includes(role));

  if (!hasPermission) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};
