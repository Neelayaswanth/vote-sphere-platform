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
  is_from_current_user?: boolean;
  is_delivered: boolean;
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
    // For received messages, set is_delivered to true and read status from database
    // For sent messages, we need to track if they've been read by the recipient
    const isSentByCurrentUser = msg.sender_id === currentUserId;
    
    return {
      ...msg,
      is_from_current_user: isSentByCurrentUser,
      is_delivered: true // All messages in the database are considered delivered
    };
  };
  
  const fetchUserMessages = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
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
      else if (user.role === 'admin') {
        console.log("Fetching support messages for admin");
        
        // Get all messages
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
        
        // Create a map to group conversations by user ID
        const conversationMap = new Map<string, SupportMessage[]>();
        
        processedMessages.forEach((msg: SupportMessage) => {
          let conversationUserId: string;
          
          if (msg.is_from_admin) {
            // Message from admin - group by receiver (voter)
            conversationUserId = msg.receiver_id || '';
          } else {
            // Message from voter - group by sender (voter)
            conversationUserId = msg.sender_id;
          }
          
          // Skip if no valid user ID
          if (!conversationUserId) return;
          
          if (!conversationMap.has(conversationUserId)) {
            conversationMap.set(conversationUserId, []);
          }
          conversationMap.get(conversationUserId)!.push(msg);
        });
        
        console.log("Conversation map:", conversationMap);
        
        // Convert conversations to threads
        const threads = await Promise.all(
          Array.from(conversationMap.entries()).map(async ([userId, messages]) => {
            try {
              // Get user profile for the voter
              const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('name, registration_id')
                .eq('id', userId)
                .single();
                
              if (userError) {
                console.error(`Error fetching user data for ${userId}:`, userError);
                return null;
              }
              
              const userName = userData?.name || 'Unknown User';
              const registrationId = userData?.registration_id || '';
              const displayName = registrationId ? `${userName} (${registrationId})` : userName;
              
              // Sort messages by created_at
              messages.sort((a: SupportMessage, b: SupportMessage) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
              
              const lastMessageObj = messages[messages.length - 1];
              const lastMessage = lastMessageObj?.message || '';
              const lastMessageTime = lastMessageObj?.created_at || '';
              
              // Count unread messages from voters (not from admins)
              const unreadCount = messages.filter((msg: SupportMessage) => 
                !msg.is_from_admin && !msg.read
              ).length;
              
              console.log(`Thread for ${displayName}: ${messages.length} messages, ${unreadCount} unread`);
              
              return {
                userId,
                userName: displayName,
                messages,
                lastMessage,
                lastMessageTime,
                unreadCount
              };
            } catch (error) {
              console.error(`Error processing thread for user ${userId}:`, error);
              return null;
            }
          })
        );
        
        const validThreads = threads.filter((thread): thread is SupportThread => 
          thread !== null && thread.messages.length > 0
        );
        
        // Sort threads by last message time (most recent first)
        validThreads.sort((a, b) => 
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );
        
        console.log("Created valid threads:", validThreads);
        
        setAdminThreads(validThreads);
        
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
      
      // Create message object
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
