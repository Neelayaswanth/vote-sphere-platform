
import { formatDistanceToNow } from 'date-fns';

/**
 * Formats a date string to a relative time format (e.g. "2 hours ago")
 */
export function formatMessageDate(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return 'Unknown date';
  }
}
