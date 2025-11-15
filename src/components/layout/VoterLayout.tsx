
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { VoterHeader } from './voter/VoterHeader';
import { VoterSidebar } from './voter/VoterSidebar';
import { VoterContent } from './voter/VoterContent';
import { Loader2 } from 'lucide-react';

export default function VoterLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Protect voter routes - redirect if not authenticated
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/auth', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  // Don't render voter layout if user is not authenticated or is admin
  if (!user || user.role === 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile header */}
      <VoterHeader setIsSidebarOpen={setIsSidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar components - both desktop and mobile */}
        <VoterSidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          isMobile={true} 
        />
        
        <VoterSidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          isMobile={false} 
        />

        {/* Main content */}
        <VoterContent />
      </div>
    </div>
  );
}
