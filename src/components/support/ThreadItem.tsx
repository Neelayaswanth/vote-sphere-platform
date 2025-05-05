
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatMessageDate } from './supportUtils';

interface ThreadItemProps {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isActive: boolean;
  onClick: () => void;
}

export function ThreadItem({
  userId,
  userName,
  lastMessage,
  lastMessageTime,
  unreadCount,
  isActive,
  onClick
}: ThreadItemProps) {
  return (
    <button
      key={userId}
      className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${
        isActive ? 'bg-muted' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{userName}</h4>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {lastMessage}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatMessageDate(lastMessageTime)}
          </p>
        </div>
      </div>
    </button>
  );
}
