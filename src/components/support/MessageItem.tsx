
import { SupportMessage } from '@/contexts/SupportContext';
import { formatMessageDate } from './supportUtils';
import { Circle, CircleDot, CircleCheck } from 'lucide-react';

interface MessageItemProps {
  message: SupportMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  // Determine the message status indicator
  const renderStatusIndicator = () => {
    // Only show indicators for outgoing messages (from the current user perspective)
    if (!message.is_from_current_user) {
      return null;
    }

    // Status indicators: red = not delivered, orange = delivered but not read, green = read
    if (!message.is_delivered) {
      return <Circle className="h-3 w-3 text-destructive shrink-0" />;
    } else if (!message.read) {
      return <CircleDot className="h-3 w-3 text-orange-400 shrink-0" />;
    } else {
      return <CircleCheck className="h-3 w-3 text-green-500 shrink-0" />;
    }
  };

  return (
    <div 
      className={`flex ${message.is_from_current_user ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div 
        className={`max-w-[80%] p-3 rounded-lg ${
          message.is_from_current_user 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground'
        }`}
      >
        <div className="flex items-start justify-between">
          <p className="text-sm">{message.message}</p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs opacity-70">
            {formatMessageDate(message.created_at)}
          </p>
          {renderStatusIndicator()}
        </div>
      </div>
    </div>
  );
}
