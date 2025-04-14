
import { useState } from 'react';
import { useElection } from '@/contexts/ElectionContext';
import { useVoter } from '@/contexts/VoterContext';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Search, X } from 'lucide-react';

export default function VoterVotingStatus() {
  const { elections, userVotes } = useElection();
  const { voters } = useVoter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElection, setSelectedElection] = useState<string | null>(null);
  
  // Filter active and completed elections
  const relevantElections = elections.filter(
    election => election.status === 'active' || election.status === 'completed'
  );
  
  // Get selected election
  const currentElection = selectedElection 
    ? elections.find(e => e.id === selectedElection) 
    : relevantElections[0];
  
  // Filter voters based on search term
  const filteredVoters = voters.filter(voter => 
    voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Check if a voter has voted in the current election
  const hasVotedInElection = (voterId: string, electionId: string) => {
    return userVotes.some(vote => 
      vote.userId === voterId && vote.electionId === electionId
    );
  };
  
  // Get voting statistics for current election
  const getVotingStats = () => {
    if (!currentElection) return { total: 0, voted: 0, notVoted: 0, percentage: 0 };
    
    const total = voters.length;
    const voted = voters.filter(voter => 
      hasVotedInElection(voter.id, currentElection.id)
    ).length;
    
    const notVoted = total - voted;
    const percentage = total > 0 ? Math.round((voted / total) * 100) : 0;
    
    return { total, voted, notVoted, percentage };
  };
  
  const stats = getVotingStats();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Voter Participation</CardTitle>
        <CardDescription>Track which voters have cast their ballots</CardDescription>
        
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search voters..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {relevantElections.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {relevantElections.map(election => (
              <Badge
                key={election.id}
                variant={currentElection?.id === election.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedElection(election.id)}
              >
                {election.title}
                {election.status === 'active' && (
                  <span className="ml-1 text-xs text-secondary rounded-full px-1">(Active)</span>
                )}
              </Badge>
            ))}
          </div>
        )}
        
        {currentElection && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Voters</p>
                <h4 className="text-2xl font-semibold">{stats.total}</h4>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Voted</p>
                <h4 className="text-2xl font-semibold text-green-500">{stats.voted}</h4>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Not Voted</p>
                <h4 className="text-2xl font-semibold text-red-500">{stats.notVoted}</h4>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Turnout</p>
                <h4 className="text-2xl font-semibold">{stats.percentage}%</h4>
              </CardContent>
            </Card>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!currentElection ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">No active or completed elections found</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voter Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVoters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No voters found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVoters.map(voter => (
                    <TableRow key={voter.id}>
                      <TableCell className="font-medium">{voter.name}</TableCell>
                      <TableCell>{voter.email}</TableCell>
                      <TableCell>
                        {hasVotedInElection(voter.id, currentElection.id) ? (
                          <Badge className="bg-green-500">
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Voted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-200 text-red-500">
                            <X className="h-3.5 w-3.5 mr-1" />
                            Not Voted
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {voter.verified ? (
                          <Badge variant="outline" className="border-green-200 text-green-500">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-200 text-yellow-500">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
