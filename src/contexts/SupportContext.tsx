
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './AuthContext';

export interface SupportMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  receiver_id?: string;
  message: string;
  is_from_admin: boolean;
  is_from_current_user?: boolean; // Added to identify messages from current user
  is_delivered: boolean; // Added to track delivery status
  created_at: string;
  read: boolean;
}

// Define the shape of raw messages from the database
interface RawSupportMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  receiver_id?: string;
  message: string;
  is_from_admin: boolean;
  created_at: string;
  read: boolean;
}

interface SupportThread {
  userId: string;
  userName: string;
  messages: SupportMessage[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface SupportContextType {
  userMessages: SupportMessage[];
  adminThreads: SupportThread[];
  activeThread: SupportThread | null;
  sendMessage: (message: string, receiverId?: string) => Promise<void>;
  markThreadAsRead: (userId: string) => Promise<void>;
  markMessagesAsRead: () => Promise<void>; 
  setActiveThread: (thread: SupportThread | null) => void;
  loading: boolean;
  unreadMessagesCount: number;
  refreshMessages: () => Promise<void>;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export const useSupport = (): SupportContextType => {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
};

export const SupportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userMessages, setUserMessages] = useState<SupportMessage[]>([]);
  const [adminThreads, setAdminThreads] = useState<SupportThread[]>([]);
  const [activeThread, setActiveThread] = useState<SupportThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [allAdmins, setAllAdmins] = useState<{id: string, name: string}[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Default admin user ID - used when a voter sends a message to an admin
  const DEFAULT_ADMIN_ID = '7e8ded93-bcb9-4a0e-966b-38957a474864'; // This should be a valid admin ID in your system
  
  // Fetch all admin users
  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'admin');
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setAllAdmins(data);
        console.log("Fetched admins:", data);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };
  
  // Helper function to transform raw messages from DB to SupportMessage type
  const transformRawMessage = (msg: RawSupportMessage, currentUserId: string): SupportMessage => {
    return {
      ...msg,
      is_from_current_user: msg.sender_id === currentUserId,
      is_delivered: true // For simplicity, assume all fetched messages are delivered
    };
  };
  
  const fetchUserMessages = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // For a voter, fetch their messages (sent and received)
      if (user.role === 'voter') {
        const { data, error } = await supabase
          .from('support_messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        // Process messages to add delivery status and current user info
        const processedMessages = (data || []).map((msg: RawSupportMessage) => 
          transformRawMessage(msg, user.id)
        );
        
        setUserMessages(processedMessages);
        
        // Count unread messages from admins
        const unreadCount = (data || []).filter((msg: RawSupportMessage) => 
          msg.is_from_admin && !msg.read && msg.receiver_id === user.id
        ).length;
        
        setUnreadMessagesCount(unreadCount);
      } 
      // For an admin, fetch all threads grouped by user
      else if (user.role === 'admin') {
        console.log("Fetching support messages for admin");
        
        // Get all messages - modified to include messages sent directly to specific admins
        // and messages with null receiver_id (for backward compatibility)
        const { data, error } = await supabase
          .from('support_messages')
          .select('*')
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error("Error fetching support messages:", error);
          throw error;
        }
        
        console.log("Retrieved support messages:", data);
        
        if (!data || data.length === 0) {
          console.log("No support messages found");
          setAdminThreads([]);
          setUnreadMessagesCount(0);
          setLoading(false);
          return;
        }
        
        // Process all messages to add delivery status and current user info
        const processedMessages = (data || []).map((msg: RawSupportMessage) => 
          transformRawMessage(msg, user.id)
        );
        
        // Get all unique user IDs from non-admin messages (senders)
        // Plus users who received messages from admins
        const userIds = [...new Set([
          ...processedMessages
            .filter((msg: SupportMessage) => !msg.is_from_admin)
            .map((msg: SupportMessage) => msg.sender_id),
          ...processedMessages
            .filter((msg: SupportMessage) => msg.is_from_admin && msg.receiver_id)
            .map((msg: SupportMessage) => msg.receiver_id as string)
        ])];
        
        console.log("Unique user IDs for threads:", userIds);
        
        if (userIds.length === 0) {
          console.log("No user threads found");
          setAdminThreads([]);
          setUnreadMessagesCount(0);
          setLoading(false);
          return;
        }
        
        // Create threads for each user
        const threads = await Promise.all(userIds.map(async (userId) => {
          try {
            // Get user name
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', userId)
              .single();
              
            if (userError) {
              console.error(`Error fetching user data for ${userId}:`, userError);
              throw userError;
            }
            
            const userName = userData?.name || 'Unknown User';
            
            // Get messages for this user (incoming and outgoing)
            // Including messages where receiver_id is NULL (for backward compatibility)
            const userMessages = processedMessages.filter((msg: SupportMessage) => 
              (msg.sender_id === userId && !msg.is_from_admin) || 
              (msg.receiver_id === userId && msg.is_from_admin) ||
              (msg.is_from_admin === false && msg.sender_id === userId) ||
              (msg.is_from_admin && !msg.receiver_id)
            );
            
            // Debug: Check if we're finding messages for this user
            console.log(`Found ${userMessages.length} messages for user ${userName} (${userId})`);
            
            // Sort messages by created_at
            userMessages.sort((a: SupportMessage, b: SupportMessage) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            
            // Get last message
            const lastMessageObj = userMessages[userMessages.length - 1];
            const lastMessage = lastMessageObj?.message || '';
            const lastMessageTime = lastMessageObj?.created_at || '';
            
            // Count unread messages (from non-admin users that haven't been read)
            const unreadCount = userMessages.filter((msg: SupportMessage) => 
              !msg.is_from_admin && !msg.read
            ).length;
            
            return {
              userId,
              userName,
              messages: userMessages,
              lastMessage,
              lastMessageTime,
              unreadCount
            };
          } catch (error) {
            console.error(`Error processing thread for user ${userId}:`, error);
            // Return a placeholder thread object to avoid breaking the Promise.all
            return {
              userId,
              userName: 'Unknown User',
              messages: [],
              lastMessage: '',
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0
            };
          }
        }));
        
        console.log("Created threads:", threads);
        
        // Filter out any threads that might have errors (no messages)
        const validThreads = threads.filter(thread => thread.messages.length > 0);
        setAdminThreads(validThreads);
        
        // Calculate total unread messages
        const totalUnread = validThreads.reduce((sum, thread) => sum + thread.unreadCount, 0);
        setUnreadMessagesCount(totalUnread);
      }
    } catch (error: any) {
      console.error('Error fetching support messages:', error);
      toast({
        title: "Error",
        description: `Failed to load messages: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [user, toast]);
  
  // Implement refreshMessages function - now using the memoized fetchUserMessages
  const refreshMessages = async () => {
    try {
      await fetchUserMessages();
      return Promise.resolve();
    } catch (error) {
      console.error("Error refreshing messages:", error);
      return Promise.reject(error);
    }
  };
  
  // Initial data load & subscription setup
  useEffect(() => {
    if (user) {
      // Only fetch data when the component mounts for the first time
      if (!isInitialized) {
        fetchAdmins(); // Fetch all admins
        fetchUserMessages();
      }
      
      // Set up real-time subscription for new messages
      const supportChannel = supabase
        .channel('support-messages-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'support_messages' },
          (payload) => {
            console.log('Support message update:', payload);
            fetchUserMessages();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(supportChannel);
      };
    } else {
      setUserMessages([]);
      setAdminThreads([]);
      setActiveThread(null);
      setLoading(false);
    }
  }, [user, fetchUserMessages, isInitialized]);
  
  const sendMessage = async (message: string, receiverId?: string) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to send messages.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Sending message as:", user.role, "receiver:", receiverId);
      
      // Fix for receiverId handling
      let finalReceiverId: string | null = null;
      
      // If admin is sending to a specific user (from activeThread)
      if (user.role === 'admin' && activeThread) {
        finalReceiverId = activeThread.userId;
        console.log("Setting receiverId from activeThread:", finalReceiverId);
      } 
      // If admin is sending to a specific user (from parameter)
      else if (user.role === 'admin' && receiverId) {
        finalReceiverId = receiverId;
        console.log("Setting receiverId from parameter:", finalReceiverId);
      }
      // If voter is sending to admin, use the default admin ID
      else if (user.role === 'voter') {
        // Always send to the default admin when the sender is a voter
        finalReceiverId = DEFAULT_ADMIN_ID;
        console.log("Voter sending to default admin:", finalReceiverId);
      }
      
      // Create message object with delivery status
      const newMessage = {
        sender_id: user.id,
        sender_name: user.name,
        receiver_id: finalReceiverId,
        message,
        is_from_admin: user.role === 'admin',
        read: false // Set to false by default
      };
      
      console.log("Inserting new message:", newMessage);
      
      const { data, error } = await supabase
        .from('support_messages')
        .insert([newMessage])
        .select();
        
      if (error) {
        console.error("Error inserting message:", error);
        throw error;
      }
      
      console.log("Message sent successfully:", data);
      
      // Refresh messages
      fetchUserMessages();
      
      return;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const markThreadAsRead = async (userId: string) => {
    if (!user || user.role !== 'admin') return;
    
    try {
      // Update all unread messages from this user
      const { error } = await supabase
        .from('support_messages')
        .update({ read: true })
        .eq('sender_id', userId)
        .eq('is_from_admin', false)
        .eq('read', false);
        
      if (error) throw error;
      
      // Refresh messages
      fetchUserMessages();
    } catch (error: any) {
      console.error('Error marking thread as read:', error);
    }
  };
  
  const markMessagesAsRead = async () => {
    if (!user || user.role !== 'voter') return;
    
    try {
      // Update all unread messages sent to this user by admins
      const { error } = await supabase
        .from('support_messages')
        .update({ read: true })
        .eq('receiver_id', user.id)
        .eq('is_from_admin', true)
        .eq('read', false);
        
      if (error) throw error;
      
      // Refresh messages to update the UI
      await fetchUserMessages();
      
      // Reset unread count
      setUnreadMessagesCount(0);
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
    }
  };
  
  const value = {
    userMessages,
    adminThreads,
    activeThread,
    sendMessage,
    markThreadAsRead,
    markMessagesAsRead,
    setActiveThread,
    loading,
    unreadMessagesCount,
    refreshMessages
  };
  
  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
};
