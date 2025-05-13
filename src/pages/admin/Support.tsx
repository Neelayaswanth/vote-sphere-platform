
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSupport } from '@/contexts/SupportContext';
import { Loader2, RefreshCcw } from 'lucide-react';
import AdminSupportCenter from '@/components/support/AdminSupportCenter';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function Support() {
  const { loading, adminThreads, refreshMessages } = useSupport();
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();
  
  // Load data on mount - using a separate initialLoading state
  // This prevents the infinite loading loop
  useEffect(() => {
    let isMounted = true; // Track component mount state
    
    const initialLoad = async () => {
      try {
        if (!isMounted) return; // Skip if unmounted
        
        setInitialLoading(true);
        await refreshMessages();
      } catch (error) {
        console.error("Error during initial message load:", error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to load support messages. Please try again.",
            variant: "destructive"
          });
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };
    
    initialLoad();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [refreshMessages, toast]);
  
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
  
  // Only show loading indicator during initial load, not during refreshes
  if (initialLoading) {
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
      
      {adminThreads && adminThreads.length > 0 ? (
        <AdminSupportCenter />
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <h3 className="text-xl font-medium">No Support Messages</h3>
              <p className="text-muted-foreground">
                There are no support conversations at this time.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
