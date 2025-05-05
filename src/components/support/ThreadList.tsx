
import { useState } from 'react';
import { Search, MessageSquare, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThreadItem } from './ThreadItem';
import { useSupport } from '@/contexts/SupportContext';
import { useToast } from '@/components/ui/use-toast';

interface ThreadListProps {
  onRefresh: () => Promise<void>;
  refreshing: boolean;
}

export function ThreadList({ onRefresh, refreshing }: ThreadListProps) {
  const { adminThreads, activeThread, setActiveThread, markThreadAsRead } = useSupport();
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Filter threads by search query
  const filteredThreads = adminThreads?.filter(thread => 
    thread.userName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  // Sort threads by last message time (most recent first)
  const sortedThreads = [...filteredThreads].sort((a, b) => 
    new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );
  
  // Threads with unread messages
  const unreadThreads = sortedThreads.filter(thread => thread.unreadCount > 0);
  // All other threads
  const readThreads = sortedThreads.filter(thread => thread.unreadCount === 0);

  const handleThreadClick = (thread: typeof activeThread) => {
    console.log("Setting active thread:", thread);
    setActiveThread(thread);
    // Mark thread as read when opened
    if (thread && thread.unreadCount > 0) {
      markThreadAsRead(thread.userId);
    }
  };

  const handleRefresh = async () => {
    try {
      await onRefresh();
      toast({
        title: "Messages Refreshed",
        description: "Support conversations have been refreshed",
      });
    } catch (error) {
      console.error('Error refreshing messages:', error);
      toast({
        title: "Error",
        description: "Failed to refresh messages.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Support Conversations</CardTitle>
            <CardDescription>Manage support requests from voters</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh conversations"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
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
                    <ThreadItem
                      key={thread.userId}
                      userId={thread.userId}
                      userName={thread.userName}
                      lastMessage={thread.lastMessage}
                      lastMessageTime={thread.lastMessageTime}
                      unreadCount={thread.unreadCount}
                      isActive={activeThread?.userId === thread.userId}
                      onClick={() => handleThreadClick(thread)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[400px]">
              {sortedThreads.length === 0 ? (
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
                    <ThreadItem
                      key={thread.userId}
                      userId={thread.userId}
                      userName={thread.userName}
                      lastMessage={thread.lastMessage}
                      lastMessageTime={thread.lastMessageTime}
                      unreadCount={thread.unreadCount}
                      isActive={activeThread?.userId === thread.userId}
                      onClick={() => handleThreadClick(thread)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
