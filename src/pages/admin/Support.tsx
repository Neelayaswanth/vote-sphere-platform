
import { Button } from '@/components/ui/button';
import { useSupport } from '@/contexts/SupportContext';
import { Loader2, RefreshCcw } from 'lucide-react';
import AdminSupportCenter from '@/components/support/AdminSupportCenter';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Support() {
  const { loading, refreshMessages } = useSupport();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { toast } = useToast();
  
  // Load data on mount when user is available
  useEffect(() => {
    if (user && user.role === 'admin' && !hasLoaded) {
      // Small delay to ensure context is ready
      const timer = setTimeout(() => {
        refreshMessages()
          .then(() => {
            setHasLoaded(true);
          })
          .catch((error) => {
            console.error("Error loading support messages:", error);
            setHasLoaded(true); // Still mark as loaded to prevent infinite loading
          });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, refreshMessages, hasLoaded]);
  
  // Timeout fallback to prevent infinite loading (10 seconds max)
  useEffect(() => {
    if (loading && user) {
      const timeout = setTimeout(() => {
        console.warn("Support page loading timeout - showing content anyway");
        setHasLoaded(true);
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
  }, [loading, user]);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMessages();
      
      toast({
        title: "Messages Refreshed",
        description: "Support messages have been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing messages:", error);
      toast({
        title: "Error",
        description: "Failed to refresh support messages.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  // Show loading indicator only if context is loading, user is available, and hasn't loaded yet
  if (loading && user && !hasLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading support messages...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Help & Support Center</h1>
          <p className="text-muted-foreground">
            Manage and respond to voter support requests and inquiries
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Messages
        </Button>
      </div>
      
      <AdminSupportCenter />
    </div>
  );
}
