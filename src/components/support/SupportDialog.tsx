
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useSupport } from '@/contexts/SupportContext';
import { HelpCircle, Loader2, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function SupportDialog() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  const { sendMessage, userMessages, refreshMessages, unreadMessagesCount, markMessagesAsRead } = useSupport();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Ensure messages are loaded when dialog opens
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      try {
        await refreshMessages();
        // Reset the scroll flag when opening
        setHasScrolled(false);
        
        // Mark messages as read when dialog opens
        if (unreadMessagesCount > 0) {
          await markMessagesAsRead();
        }
      } catch (error) {
        console.error('Error refreshing messages:', error);
      }
    }
  };
  
  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (open && userMessages.length > 0 && !hasScrolled) {
      const messageContainer = document.getElementById('support-messages-container');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
        setHasScrolled(true);
      }
    }
  }, [userMessages, open, hasScrolled]);
  
  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message before sending.",
        variant: "destructive"
      });
      return;
    }
    
    setSending(true);
    
    try {
      await sendMessage(message);
      setMessage('');
      
      toast({
        title: "Message sent",
        description: "Your support request has been sent to administrators.",
      });
      
      // Refresh messages after sending
      await refreshMessages();
      
      // Reset scroll flag to auto-scroll to the new message
      setHasScrolled(false);
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

  // Format timestamp to a more readable format
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' +
           date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <HelpCircle className="h-4 w-4" />
          Help & Support
          {unreadMessagesCount > 0 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute -top-2 -right-2"
            >
              <Badge variant="destructive" className="text-xs h-5 min-w-5 flex items-center justify-center rounded-full">
                {unreadMessagesCount}
              </Badge>
            </motion.div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Help & Support</DialogTitle>
          <DialogDescription>
            Have questions or need help? Send a message to our support team.
          </DialogDescription>
        </DialogHeader>
        
        {userMessages.length > 0 && (
          <div 
            id="support-messages-container"
            className="max-h-[300px] overflow-y-auto border rounded-md p-4 space-y-3 mb-4 bg-background/60"
          >
            {userMessages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.is_from_admin ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                    msg.is_from_admin 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Your message</Label>
            <Textarea
              id="message"
              placeholder="Type your question or describe your issue..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={4}
              className="resize-none bg-background/80"
            />
            <p className="text-xs text-muted-foreground">
              Press Shift+Enter for a new line
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)} variant="outline">
            Close
          </Button>
          <Button 
            type="button" 
            onClick={handleSendMessage} 
            disabled={sending || !message.trim()}
            className="relative overflow-hidden"
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
            
            {!sending && message.trim() && (
              <motion.span
                className="absolute inset-0 bg-primary/10"
                initial={{ scale: 0, borderRadius: "100%" }}
                animate={{ scale: 1.5, opacity: 0, borderRadius: "100%" }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
              />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
