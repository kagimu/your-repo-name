import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminRoute } from './RouteGuards';
import { useAuth } from '@/hooks/useAuth';

const ProtectedLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Don't render anything while redirecting
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <AdminRoute>
      <Outlet />
    </AdminRoute>
  );
};

export default ProtectedLayout;
