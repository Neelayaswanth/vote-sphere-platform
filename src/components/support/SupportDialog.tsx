import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useSupport } from '@/contexts/SupportContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const SupportDialog = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { userMessages, sendMessage, loading, unreadMessagesCount, markMessagesAsRead } = useSupport();
  const isMobile = useIsMobile();

  // Mark messages as read when dialog is opened
  useEffect(() => {
    if (dialogOpen && !loading) {
      markMessagesAsRead();
    }
  }, [dialogOpen, loading, markMessagesAsRead]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM d, h:mm a');
    } catch (e) {
      return '';
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size={isMobile ? "icon" : "default"}
        className="relative"
        onClick={() => setDialogOpen(true)}
      >
        <MessageSquare className={cn("h-4 w-4", !isMobile && "mr-2")} />
        {!isMobile && "Support"}
        {unreadMessagesCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadMessagesCount}
          </Badge>
        )}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Support Chat</DialogTitle>
            <DialogDescription>
              Need help? Send us a message and we'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col h-[60vh] sm:h-[50vh]">
            <ScrollArea className="flex-1 p-4 rounded-md border mb-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : userMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                  <div>
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No messages yet. Send a message to get started.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.is_from_admin ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.is_from_admin
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <div className="text-sm">{msg.message}</div>
                        <div className="text-xs mt-1 opacity-70">
                          {formatMessageTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <div className="flex items-end gap-2">
              <Textarea
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 min-h-[80px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                className="mb-[3px]" 
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupportDialog;
