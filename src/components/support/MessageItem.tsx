
import { SupportMessage } from '@/contexts/SupportContext';
import { formatMessageDate } from './supportUtils';

interface MessageItemProps {
  message: SupportMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  return (
    <div 
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
}
