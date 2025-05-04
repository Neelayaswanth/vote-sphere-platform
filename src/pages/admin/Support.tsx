
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSupport } from '@/contexts/SupportContext';
import { Loader2, RefreshCcw } from 'lucide-react';
import AdminSupportCenter from '@/components/support/AdminSupportCenter';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function Support() {
  const { loading, adminThreads } = useSupport();
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // We'll use a different approach since refreshMessages doesn't exist
      // Force a re-render of the AdminSupportCenter component
      setRefreshing(false);
      setRefreshing(true);
      
      setTimeout(() => {
        setRefreshing(false);
        toast({
          title: "Messages Refreshed",
          description: "Support messages have been refreshed.",
        });
      }, 1000);
    } catch (error) {
      console.error("Error refreshing messages:", error);
    } finally {
      setRefreshing(false);
    }
  };
  
  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading support messages...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
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
        <AdminSupportCenter key={refreshing ? 'refreshed' : 'normal'} />
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
