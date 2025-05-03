
import { useEffect, useState } from 'react';
import { useElection } from '@/contexts/ElectionContext';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Voter } from '@/contexts/VoterContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VoterVotingStatusProps {
  voter: Voter;
  electionId?: string;
}

export default function VoterVotingStatus({ voter, electionId }: VoterVotingStatusProps) {
  const { elections } = useElection();
  const [hasVoted, setHasVoted] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (!electionId || !voter) {
      setHasVoted(null);
      return;
    }
    
    // Find if the voter has voted in this election
    const hasVotedInElection = voter.votingHistory.some(
      history => history.electionId === electionId
    );
    
    setHasVoted(hasVotedInElection);
  }, [voter, electionId]);
  
  if (hasVoted === null) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        N/A
      </Badge>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            {hasVoted ? (
              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Voted
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-600 flex items-center gap-1">
                <X className="h-3 w-3" />
                Not Voted
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {hasVoted 
            ? "This voter has cast their vote in this election"
            : "This voter has not yet voted in this election"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
