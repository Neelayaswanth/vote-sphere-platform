
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  setActiveThread: (thread: SupportThread | null) => void;
  loading: boolean;
  unreadMessagesCount: number;
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
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  const fetchUserMessages = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      // For a voter, fetch their messages (sent and received)
      if (user.role === 'voter') {
        const { data, error } = await supabase
          .from('support_messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        setUserMessages(data as SupportMessage[] || []);
        
        // Count unread messages from admins
        const unreadCount = (data || []).filter((msg: SupportMessage) => 
          msg.is_from_admin && !msg.read && msg.receiver_id === user.id
        ).length;
        
        setUnreadMessagesCount(unreadCount);
      } 
      // For an admin, fetch all threads grouped by user
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
        
        // Get all unique user IDs from non-admin messages (senders)
        const userIds = [...new Set(
          data
            .filter((msg: SupportMessage) => !msg.is_from_admin)
            .map((msg: SupportMessage) => msg.sender_id)
        )];
        
        console.log("Unique user IDs:", userIds);
        
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
            const userMessages = data.filter((msg: SupportMessage) => 
              (msg.sender_id === userId && !msg.is_from_admin) || 
              (msg.receiver_id === userId && msg.is_from_admin)
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
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchUserMessages();
      
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
  }, [user]);
  
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
      const newMessage = {
        sender_id: user.id,
        sender_name: user.name,
        receiver_id: receiverId || null,
        message,
        is_from_admin: user.role === 'admin',
        read: false
      };
      
      const { error } = await supabase
        .from('support_messages')
        .insert([newMessage]);
        
      if (error) throw error;
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
      
      // Refresh messages
      fetchUserMessages();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive"
      });
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
  
  const value = {
    userMessages,
    adminThreads,
    activeThread,
    sendMessage,
    markThreadAsRead,
    setActiveThread,
    loading,
    unreadMessagesCount
  };
  
  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
};
