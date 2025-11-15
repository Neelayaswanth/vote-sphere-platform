import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'voter';
  redirectTo?: string;
}

export default function ProtectedRoute({ requiredRole, redirectTo }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  // If no user, redirect to auth page
  if (!user) {
    return <Navigate to={redirectTo || '/auth'} replace />;
  }

  // If role is required and user doesn't have it, redirect
  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/voter" replace />;
    }
  }

  return <Outlet />;
}

