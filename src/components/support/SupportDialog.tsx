
import { useState } from 'react';
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

export default function SupportDialog() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const { sendMessage, userMessages, refreshMessages } = useSupport();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Ensure messages are loaded when dialog opens
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      try {
        await refreshMessages();
      } catch (error) {
        console.error('Error refreshing messages:', error);
      }
    }
  };
  
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Help & Support
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Help & Support</DialogTitle>
          <DialogDescription>
            Have questions or need help? Send a message to our support team.
          </DialogDescription>
        </DialogHeader>
        
        {userMessages.length > 0 && (
          <div className="max-h-[300px] overflow-y-auto border rounded-md p-4 space-y-3 mb-4">
            {userMessages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.is_from_admin ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.is_from_admin 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
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
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button type="button" onClick={handleSendMessage} disabled={sending}>
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
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
