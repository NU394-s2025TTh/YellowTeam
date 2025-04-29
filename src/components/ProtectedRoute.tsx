import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserContext } from 'src/providers/UserProvider';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useUserContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
