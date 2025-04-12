
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RootLayout() {
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("RootLayout auth state:", { user, isLoading });
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <span className="text-lg font-medium">Authenticating...</span>
      </div>
    );
  }

  return <Outlet />;
}
