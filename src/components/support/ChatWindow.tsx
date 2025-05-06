
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { useSupport } from '@/contexts/SupportContext';
import { MessageItem } from './MessageItem';

export function ChatWindow() {
  const { activeThread, sendMessage } = useSupport();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when active thread changes or new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread]);

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
      
      // Scroll to bottom after sending
      if (messagesEndRef.current) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
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

  return (
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
                activeThread.messages.map(message => (
                  <MessageItem key={message.id} message={message} />
                ))
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
  );
}
