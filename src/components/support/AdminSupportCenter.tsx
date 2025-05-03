
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageSquare, Search, Send } from 'lucide-react';
import { useSupport, SupportMessage } from '@/contexts/SupportContext';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function AdminSupportCenter() {
  const { adminThreads, activeThread, setActiveThread, sendMessage, markThreadAsRead, loading } = useSupport();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Filter threads by search query
  const filteredThreads = adminThreads.filter(thread => 
    thread.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort threads by last message time (most recent first)
  const sortedThreads = [...filteredThreads].sort((a, b) => 
    new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );
  
  // Threads with unread messages
  const unreadThreads = sortedThreads.filter(thread => thread.unreadCount > 0);
  // All other threads
  const readThreads = sortedThreads.filter(thread => thread.unreadCount === 0);
  
  useEffect(() => {
    // Scroll to bottom when active thread changes or new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread]);

  // Debug logs to help diagnose support threads issues
  useEffect(() => {
    console.log("Admin Support Center - Current adminThreads:", adminThreads);
    console.log("Admin Support Center - Active Thread:", activeThread);
  }, [adminThreads, activeThread]);
  
  const handleThreadClick = (thread: typeof activeThread) => {
    console.log("Setting active thread:", thread);
    setActiveThread(thread);
    // Mark thread as read when opened
    if (thread && thread.unreadCount > 0) {
      markThreadAsRead(thread.userId);
    }
  };
  
  const handleSendMessage = async () => {
    if (!activeThread) {
      toast({
        title: "No recipient selected",
        description: "Please select a conversation first before sending a message.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newMessage.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message before sending.",
        variant: "destructive"
      });
      return;
    }
    
    setSending(true);
    
    try {
      console.log("Sending message to:", activeThread.userId);
      await sendMessage(newMessage, activeThread.userId);
      setNewMessage('');
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending support message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };
  
  const formatMessageDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  const renderMessage = (message: SupportMessage) => (
    <div 
      key={message.id}
      className={`flex ${message.is_from_admin ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div 
        className={`max-w-[80%] p-3 rounded-lg ${
          message.is_from_admin 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground'
        }`}
      >
        <p className="text-sm">{message.message}</p>
        <p className="text-xs opacity-70 mt-1">
          {formatMessageDate(message.created_at)}
        </p>
      </div>
    </div>
  );
  
  if (loading) {
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
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Support Conversations</CardTitle>
          <CardDescription>Manage support requests from voters</CardDescription>
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger className="flex-1" value="unread">
                Unread ({unreadThreads.length})
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="all">
                All ({sortedThreads.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="unread" className="m-0">
              <ScrollArea className="h-[400px]">
                {unreadThreads.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    No unread messages
                  </div>
                ) : (
                  <div className="divide-y">
                    {unreadThreads.map(thread => (
                      <button
                        key={thread.userId}
                        className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${
                          activeThread?.userId === thread.userId ? 'bg-muted' : ''
                        }`}
                        onClick={() => handleThreadClick(thread)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>{thread.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{thread.userName}</h4>
                              <Badge variant="destructive" className="ml-2">
                                {thread.unreadCount}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {thread.lastMessage}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatMessageDate(thread.lastMessageTime)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="all" className="m-0">
              <ScrollArea className="h-[400px]">
                {adminThreads.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground flex flex-col items-center gap-3">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                    <p>No support conversations found</p>
                    <p className="text-xs text-muted-foreground/70">
                      When voters send support messages, they will appear here
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {sortedThreads.map(thread => (
                      <button
                        key={thread.userId}
                        className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${
                          activeThread?.userId === thread.userId ? 'bg-muted' : ''
                        }`}
                        onClick={() => handleThreadClick(thread)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>{thread.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{thread.userName}</h4>
                              {thread.unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                  {thread.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {thread.lastMessage}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatMessageDate(thread.lastMessageTime)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Chat Window */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          {activeThread ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{activeThread.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{activeThread.userName}</CardTitle>
                  <CardDescription>
                    {activeThread.messages.length} messages
                  </CardDescription>
                </div>
              </div>
            </>
          ) : (
            <>
              <CardTitle>Support Chat</CardTitle>
              <CardDescription>
                Select a conversation to start chatting
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="p-0">
          {activeThread ? (
            <>
              <ScrollArea className="h-[350px] px-4 py-3">
                {activeThread.messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-muted-foreground">
                    No messages found
                  </div>
                ) : (
                  activeThread.messages.map(renderMessage)
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              <div className="p-4 border-t flex gap-2 items-center">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="px-4 py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground text-lg">
                  Select a conversation from the list to view messages
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
