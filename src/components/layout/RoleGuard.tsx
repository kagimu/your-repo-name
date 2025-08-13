import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  requireAuth?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, requireAuth = true }) => {
  const { user, isAuthenticated } = useAuth();

  // If the route doesn't require authentication, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // For protected routes, check authentication
  if (!isAuthenticated && requireAuth) {
    return <Navigate to="/login" replace />;
  }

  if (!user && requireAuth) {
    return <Navigate to="/login" replace />;
  }

  // Convert user.type to match the role system
  const userRole = user?.type === 'institution' || user?.type === 'individual' ? 'user' : user?.type;

  if (userRole && !allowedRoles.includes(userRole) && !allowedRoles.includes(user?.type || '')) {
    // If trying to access courier routes without being a courier
    if (allowedRoles.includes('courier')) {
      return <Navigate to="/courier/login" replace />;
    }
    // For other unauthorized access, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
