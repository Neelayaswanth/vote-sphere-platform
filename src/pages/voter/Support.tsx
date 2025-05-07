
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupport, SupportMessage } from '@/contexts/SupportContext';
import { HelpCircle, Loader2, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { MessageItem } from '@/components/support/MessageItem';

export default function Support() {
  const { userMessages, sendMessage, loading, unreadMessagesCount, markMessagesAsRead } = useSupport();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Mark messages as read when the component mounts or when new messages arrive
    if (unreadMessagesCount > 0) {
      markMessagesAsRead();
    }
  }, [userMessages, unreadMessagesCount, markMessagesAsRead]);

  // Debug logs
  useEffect(() => {
    console.log("Voter Support - userMessages:", userMessages);
  }, [userMessages]);
  
  const handleSendMessage = async () => {
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
      // No need to pass receiverId for voter messages
      await sendMessage(newMessage);
      setNewMessage('');
      toast({
        title: "Message sent",
        description: "Your message has been sent to our support team.",
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
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Help & Support</h1>
      <p className="text-muted-foreground mb-6">
        Have questions or need assistance? Our support team is here to help.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Support Chat
              </CardTitle>
              <CardDescription>
                Chat with our support team to get help with your questions
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {loading ? (
                <div className="flex items-center justify-center h-64 flex-1">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-lg">Loading messages...</span>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 px-6 py-4 min-h-[400px]">
                    {userMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-medium">No messages yet</h3>
                        <p className="text-muted-foreground">
                          Send a message to start a conversation with our support team
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userMessages.map((message: SupportMessage) => (
                          <MessageItem key={message.id} message={message} />
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                  
                  <div className="p-4 border-t mt-auto">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message here..."
                        className="min-h-[60px] flex-1"
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
                        className="self-end" 
                        onClick={handleSendMessage}
                        disabled={sending || !newMessage.trim()}
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>FAQs</CardTitle>
              <CardDescription>
                Common questions and answers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-secondary rounded-lg">
                <h3 className="font-medium">How do I vote in an election?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Go to the Elections page, select an active election, and follow the instructions to cast your vote.
                </p>
              </div>
              
              <div className="p-3 bg-secondary rounded-lg">
                <h3 className="font-medium">I forgot my password</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Forgot Password" on the login screen to reset your password via email.
                </p>
              </div>
              
              <div className="p-3 bg-secondary rounded-lg">
                <h3 className="font-medium">How do I verify my account?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  After registration, check your email for a verification link. If you didn't receive it, contact an administrator.
                </p>
              </div>
              
              <Button variant="outline" className="w-full">
                <HelpCircle className="mr-2 h-4 w-4" />
                View All FAQs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
