
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSupport } from '@/contexts/SupportContext';
import { ThreadList } from './ThreadList';
import { ChatWindow } from './ChatWindow';

export default function AdminSupportCenter() {
  const { loading, refreshMessages } = useSupport();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMessages();
      return Promise.resolve();
    } catch (error) {
      console.error('Error refreshing messages:', error);
      return Promise.reject(error);
    } finally {
      setRefreshing(false);
    }
  };

  // If we're not in the refreshing state, we can show the loading indicator
  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading support messages...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Thread List */}
      <ThreadList 
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      
      {/* Chat Window */}
      <ChatWindow />
    </div>
  );
}
