
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useElection, Candidate } from '@/contexts/ElectionContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  AlertTriangle,
  ArrowLeft, 
  Calendar, 
  Check, 
  Clock, 
  Info, 
  Lock, 
  Users 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ElectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getElection, getUserVoteForElection, castVote } = useElection();
  const { toast } = useToast();
  
  const [election, setElection] = useState(getElection(id || ''));
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isReadingGuidelines, setIsReadingGuidelines] = useState(true);
  const [hasUserVoted, setHasUserVoted] = useState(false);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Check if user has already voted
  useEffect(() => {
    if (id) {
      const userVote = getUserVoteForElection(id);
      setHasUserVoted(!!userVote);
    }
  }, [id, getUserVoteForElection]);
  
  // Refresh election data (needed after voting)
  useEffect(() => {
    if (id) {
      const currentElection = getElection(id);
      setElection(currentElection);
    }
  }, [id, getElection]);
  
  // Timer for the "Vote Now" button
  useEffect(() => {
    if (!isReadingGuidelines || hasUserVoted || election?.status !== 'active') {
      return;
    }

    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, isReadingGuidelines, hasUserVoted, election?.status]);
  
  if (!election) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold">Election Not Found</h1>
        <p className="text-muted-foreground mt-2">
          The election you're looking for doesn't exist or has been removed.
        </p>
        <Button 
          className="mt-6" 
          onClick={() => navigate('/voter/elections')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Elections
        </Button>
      </div>
    );
  }
  
  // Format candidates data for charts
  const candidateChartData = election.candidates.map(candidate => ({
    name: candidate.name,
    votes: candidate.votes,
  }));
  
  // Determine total percentage of votes
  const totalVotes = election.totalVotes;
  const getVotePercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };
  
  const handleVoteClick = (candidate: Candidate) => {
    if (election.status !== 'active' || hasUserVoted) return;
    
    setSelectedCandidate(candidate);
    setIsConfirmDialogOpen(true);
  };
  
  const confirmVote = async () => {
    if (!selectedCandidate || !id) return;
    
    setIsVoting(true);
    
    try {
      await castVote(id, selectedCandidate.id);
      
      // Update local state
      setHasUserVoted(true);
      
      // Show success toast
      toast({
        title: "Vote Submitted Successfully",
        description: `Your vote for ${selectedCandidate.name} has been recorded.`,
      });
      
    } catch (error) {
      console.error('Error casting vote:', error);
      toast({
        variant: "destructive",
        title: "Vote Failed",
        description: "There was an error submitting your vote. Please try again.",
      });
    } finally {
      setIsVoting(false);
      setIsConfirmDialogOpen(false);
    }
  };
  
  const renderElectionStatus = () => {
    switch (election.status) {
      case 'upcoming':
        return (
          <Alert variant="default" className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            <Info className="h-4 w-4" />
            <AlertTitle>Upcoming Election</AlertTitle>
            <AlertDescription>
              This election has not started yet. Voting begins on{' '}
              {new Date(election.startDate).toLocaleDateString()}.
            </AlertDescription>
          </Alert>
        );
      case 'active':
        return hasUserVoted ? (
          <Alert variant="default" className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100">
            <Check className="h-4 w-4" />
            <AlertTitle>Vote Submitted</AlertTitle>
            <AlertDescription>
              You have already voted in this election. Results will be available once the election ends on{' '}
              {new Date(election.endDate).toLocaleDateString()}.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="default" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Active Election</AlertTitle>
            <AlertDescription>
              This election is currently active. Please review the candidates and cast your vote.
              Voting ends on {new Date(election.endDate).toLocaleDateString()}.
            </AlertDescription>
          </Alert>
        );
      case 'completed':
        return (
          <Alert variant="default" className="bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            <Lock className="h-4 w-4" />
            <AlertTitle>Election Completed</AlertTitle>
            <AlertDescription>
              This election has ended. Voting was open from{' '}
              {new Date(election.startDate).toLocaleDateString()} to{' '}
              {new Date(election.endDate).toLocaleDateString()}.
            </AlertDescription>
          </Alert>
        );
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/voter/elections')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{election.title}</h1>
          <p className="text-muted-foreground">
            {election.description}
          </p>
        </div>
      </div>
      
      {/* Status Alert */}
      <div>{renderElectionStatus()}</div>
      
      {/* Election Info */}
      <Card>
        <CardHeader>
          <CardTitle>Election Information</CardTitle>
          <CardDescription>
            Details and timeline for this election
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(election.startDate).toLocaleDateString()}, {new Date(election.startDate).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
              <div>
                <p className="font-medium">End Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(election.endDate).toLocaleDateString()}, {new Date(election.endDate).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Total Votes</p>
                <p className="text-sm text-muted-foreground">
                  {election.totalVotes} votes cast
                </p>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Election Rules</h3>
            <ul className="space-y-1 list-disc list-inside text-sm ml-1">
              {election.rules.map((rule, index) => (
                <li key={index} className="text-muted-foreground">{rule}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* Guidelines (only show if active and user hasn't voted) */}
      {election.status === 'active' && !hasUserVoted && isReadingGuidelines && (
        <Card className="border-primary/50">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-primary" />
              Voting Guidelines
            </CardTitle>
            <CardDescription>
              Please review these important guidelines before voting
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Before You Vote:</h3>
                <ul className="space-y-2 list-disc list-inside text-sm ml-1">
                  <li>Take time to research each candidate thoroughly.</li>
                  <li>Your vote is confidential and cannot be traced back to you.</li>
                  <li>You can only vote once in this election.</li>
                  <li>Your vote cannot be changed after submission.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">How Voting Works:</h3>
                <ol className="space-y-2 list-decimal list-inside text-sm ml-1">
                  <li>Review the candidates below</li>
                  <li>Click on a candidate card to select them</li>
                  <li>Confirm your vote when prompted</li>
                  <li>Receive confirmation once your vote is recorded</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Waiting Period:</h3>
                <p className="text-sm">
                  To ensure thoughtful voting, the "Continue to Voting" button will be active in:
                </p>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{timeRemaining} seconds remaining</span>
                    <span className="text-sm">{Math.round((10 - timeRemaining) / 10 * 100)}%</span>
                  </div>
                  <Progress value={(10 - timeRemaining) * 10} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 flex justify-between">
            <Button variant="outline" onClick={() => navigate('/voter/elections')}>
              Go Back
            </Button>
            <Button 
              disabled={timeRemaining > 0} 
              onClick={() => setIsReadingGuidelines(false)}
            >
              {timeRemaining > 0 ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Please wait ({timeRemaining}s)
                </>
              ) : (
                'Continue to Voting'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Candidates */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {election.status === 'completed' ? 'Results' : 'Candidates'}
        </h2>
        
        {election.status === 'completed' && (
          <div className="space-y-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Election Results</CardTitle>
                <CardDescription>
                  Voting results and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Bar Chart */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Vote Distribution</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={candidateChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={100} />
                          <Tooltip />
                          <Bar dataKey="votes" fill="#0066ff" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Pie Chart */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Vote Percentage</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={candidateChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="votes"
                          >
                            {candidateChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {election.candidates.map(candidate => (
            <Card 
              key={candidate.id} 
              className={`overflow-hidden transition-all ${
                election.status === 'active' && !hasUserVoted && !isReadingGuidelines
                  ? 'cursor-pointer hover:shadow-md hover:border-primary'
                  : ''
              }`}
              onClick={() => {
                if (election.status === 'active' && !hasUserVoted && !isReadingGuidelines) {
                  handleVoteClick(candidate);
                }
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
                    <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{candidate.name}</CardTitle>
                    <CardDescription>{candidate.party}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{candidate.bio}</p>
                
                {election.status === 'completed' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Total Votes:</span>
                      <span className="font-medium">{candidate.votes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Percentage:</span>
                      <span className="font-medium">{getVotePercentage(candidate.votes)}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full mt-1">
                      <div 
                        className="h-2 bg-primary rounded-full" 
                        style={{ width: `${getVotePercentage(candidate.votes)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {election.status === 'active' && !hasUserVoted && !isReadingGuidelines && (
                  <div className="mt-4">
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVoteClick(candidate);
                      }}
                    >
                      Vote for this Candidate
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Election platform/manifesto details */}
      <Card>
        <CardHeader>
          <CardTitle>Candidate Manifestos</CardTitle>
          <CardDescription>
            Detailed information about each candidate's platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {election.candidates.map((candidate, index) => (
              <AccordionItem key={candidate.id} value={candidate.id}>
                <AccordionTrigger>{candidate.name} - {candidate.party}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
                        <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-medium">{candidate.name}</h3>
                        <p className="text-muted-foreground">{candidate.party}</p>
                        <p className="text-sm mt-1">{candidate.bio}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Key Policies</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Economic reform and job creation</li>
                        <li>Healthcare system improvements</li>
                        <li>Environmental protection initiatives</li>
                        <li>Educational system modernization</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Background & Experience</h4>
                      <p className="text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      {/* Voting confirmation dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to cast your vote for <span className="font-semibold">{selectedCandidate?.name}</span> of the {selectedCandidate?.party}.
              <br /><br />
              This action cannot be undone. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isVoting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmVote();
              }}
              disabled={isVoting}
              className="bg-primary hover:bg-primary/90"
            >
              {isVoting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Confirm Vote'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
