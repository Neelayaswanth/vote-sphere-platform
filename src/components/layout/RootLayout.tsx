
import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RootLayout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/auth');
      } else if (user.role === 'voter') {
        navigate('/voter');
      } else if (user.role === 'admin') {
        navigate('/admin');
      }
      setInitialCheckDone(true);
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !initialCheckDone) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  return <Outlet />;
}
