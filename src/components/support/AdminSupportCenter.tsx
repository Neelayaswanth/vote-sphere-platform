
import { useState } from 'react';
import { useSupport } from '@/contexts/SupportContext';
import { ThreadList } from './ThreadList';
import { ChatWindow } from './ChatWindow';

export default function AdminSupportCenter() {
  const { refreshMessages } = useSupport();
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
