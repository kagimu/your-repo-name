import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();

  // Only restrict if user is signed in as courier or supplier
  if (isAuthenticated && user && (user.userType === 'courier' || user.userType === 'supplier')) {
    if (!allowedRoles.includes(user.userType)) {
      return <Navigate to={`/${user.userType}`} replace />;
    }
  }

  // Otherwise, allow access
  return <>{children}</>;
};

export default RoleGuard;
