
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useElection } from '@/contexts/ElectionContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { Calendar, CheckCircle, ExternalLink } from 'lucide-react';

export default function VotingHistory() {
  const { user } = useAuth();
  const { elections, userVotes } = useElection();
  const [votingHistory, setVotingHistory] = useState<Array<{
    id: string;
    electionId: string;
    candidateId: string;
    electionTitle: string;
    candidateName: string;
    candidateParty: string;
    candidateImage: string;
    voteDate: string;
    electionStatus: 'active' | 'upcoming' | 'completed';
    electionResult?: {
      winner: string;
      isVotedCandidateWinner: boolean;
    };
  }>>([]);
  
  useEffect(() => {
    // Combine user votes with election and candidate details
    const history = userVotes.map(vote => {
      const election = elections.find(e => e.id === vote.electionId);
      const candidate = election?.candidates.find(c => c.id === vote.candidateId);
      
      // Determine winner for completed elections
      let electionResult;
      if (election?.status === 'completed') {
        const sortedCandidates = [...(election?.candidates || [])].sort((a, b) => b.votes - a.votes);
        const winner = sortedCandidates[0];
        
        electionResult = {
          winner: winner?.name || 'Unknown',
          isVotedCandidateWinner: winner?.id === vote.candidateId
        };
      }
      
      return {
        id: vote.id,
        electionId: vote.electionId,
        candidateId: vote.candidateId,
        electionTitle: election?.title || 'Unknown Election',
        candidateName: candidate?.name || 'Unknown Candidate',
        candidateParty: candidate?.party || 'Unknown Party',
        candidateImage: candidate?.imageUrl || '/placeholder.svg',
        voteDate: vote.timestamp,
        electionStatus: election?.status || 'completed',
        electionResult
      };
    });
    
    // Sort by vote date (newest first)
    history.sort((a, b) => new Date(b.voteDate).getTime() - new Date(a.voteDate).getTime());
    
    setVotingHistory(history);
  }, [userVotes, elections]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Voting History</h1>
        <p className="text-muted-foreground">
          Records of your past votes and election participation
        </p>
      </div>
      
      {votingHistory.length > 0 ? (
        <div className="space-y-6">
          {votingHistory.map(vote => (
            <Card key={vote.id} className="overflow-hidden">
              <CardHeader className={`${
                vote.electionStatus === 'completed' 
                  ? 'bg-muted/50' 
                  : 'bg-primary/5'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{vote.electionTitle}</CardTitle>
                    <CardDescription>
                      Voted on {new Date(vote.voteDate).toLocaleDateString()} at {new Date(vote.voteDate).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  <div>
                    {vote.electionStatus === 'completed' ? (
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={vote.candidateImage} alt={vote.candidateName} />
                    <AvatarFallback>{vote.candidateName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{vote.candidateName}</h3>
                        <p className="text-sm text-muted-foreground">{vote.candidateParty}</p>
                      </div>
                      
                      {vote.electionResult && (
                        <div className="mt-2 sm:mt-0">
                          {vote.electionResult.isVotedCandidateWinner ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Winner
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Winner: {vote.electionResult.winner}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {vote.electionStatus === 'completed'
                            ? 'Election completed'
                            : 'Election in progress'
                          }
                        </span>
                      </div>
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/voter/elections/${vote.electionId}`}>
                          View Details
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-3">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No Voting History</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              You haven't participated in any elections yet. <br />
              When you vote, your participation will be recorded here.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/voter/elections">View Available Elections</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
