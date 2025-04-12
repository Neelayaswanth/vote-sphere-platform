
import { Link } from 'react-router-dom';
import { useElection } from '@/contexts/ElectionContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Users
} from 'lucide-react';

export default function ElectionsList() {
  const { elections, userVotes } = useElection();
  
  const activeElections = elections.filter(election => election.status === 'active');
  const upcomingElections = elections.filter(election => election.status === 'upcoming');
  const completedElections = elections.filter(election => election.status === 'completed');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Elections</h1>
        <p className="text-muted-foreground">
          View and participate in current and upcoming elections
        </p>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active <Badge variant="outline" className="ml-2">{activeElections.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming <Badge variant="outline" className="ml-2">{upcomingElections.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed <Badge variant="outline" className="ml-2">{completedElections.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6 space-y-4">
          {activeElections.length > 0 ? (
            activeElections.map(election => {
              const hasVoted = userVotes.some(vote => vote.electionId === election.id);
              const endDate = new Date(election.endDate);
              const timeRemaining = endDate.getTime() - new Date().getTime();
              const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={election.id} className="overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle>{election.title}</CardTitle>
                      {hasVoted ? (
                        <Badge variant="secondary" className="flex items-center">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Voted
                        </Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {election.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                        <div>
                          <p className="text-sm font-medium">End Date</p>
                          <p className="text-sm text-muted-foreground">
                            {endDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                        <div>
                          <p className="text-sm font-medium">Time Remaining</p>
                          <p className="text-sm text-muted-foreground">
                            {daysRemaining} days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-muted-foreground mr-2" />
                        <div>
                          <p className="text-sm font-medium">Candidates</p>
                          <p className="text-sm text-muted-foreground">
                            {election.candidates.length} candidates
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Total Votes</p>
                        <p className="text-sm text-muted-foreground">
                          {election.totalVotes} votes cast so far
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 py-4">
                    <Button 
                      className="ml-auto" 
                      variant={hasVoted ? "outline" : "default"}
                      asChild
                    >
                      <Link to={`/voter/elections/${election.id}`}>
                        {hasVoted ? 'View Details' : 'Vote Now'}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="rounded-full bg-primary/10 p-3">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No Active Elections</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  There are no active elections at the moment. <br />
                  Check back soon or view upcoming elections.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-6 space-y-4">
          {upcomingElections.length > 0 ? (
            upcomingElections.map(election => {
              const startDate = new Date(election.startDate);
              const daysUntilStart = Math.ceil(
                (startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <Card key={election.id} className="overflow-hidden">
                  <CardHeader className="bg-secondary/50 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle>{election.title}</CardTitle>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                    <CardDescription>
                      {election.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                        <div>
                          <p className="text-sm font-medium">Start Date</p>
                          <p className="text-sm text-muted-foreground">
                            {startDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                        <div>
                          <p className="text-sm font-medium">Starts In</p>
                          <p className="text-sm text-muted-foreground">
                            {daysUntilStart} days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-muted-foreground mr-2" />
                        <div>
                          <p className="text-sm font-medium">Candidates</p>
                          <p className="text-sm text-muted-foreground">
                            {election.candidates.length} candidates
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 py-4">
                    <Button 
                      variant="outline" 
                      className="ml-auto"
                      asChild
                    >
                      <Link to={`/voter/elections/${election.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="rounded-full bg-secondary p-3">
                  <Calendar className="h-6 w-6 text-secondary-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No Upcoming Elections</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  There are no upcoming elections scheduled at the moment. <br />
                  Check back soon for future elections.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6 space-y-4">
          {completedElections.length > 0 ? (
            completedElections.map(election => {
              const hasVoted = userVotes.some(vote => vote.electionId === election.id);
              const endDate = new Date(election.endDate);
              
              return (
                <Card key={election.id} className="overflow-hidden">
                  <CardHeader className="bg-muted pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle>{election.title}</CardTitle>
                      {hasVoted ? (
                        <Badge variant="outline" className="flex items-center">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Participated
                        </Badge>
                      ) : (
                        <Badge variant="outline">Completed</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {election.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                        <div>
                          <p className="text-sm font-medium">End Date</p>
                          <p className="text-sm text-muted-foreground">
                            {endDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-muted-foreground mr-2" />
                        <div>
                          <p className="text-sm font-medium">Total Votes</p>
                          <p className="text-sm text-muted-foreground">
                            {election.totalVotes} votes
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 py-4">
                    <Button 
                      variant="outline" 
                      className="ml-auto"
                      asChild
                    >
                      <Link to={`/voter/elections/${election.id}`}>
                        View Results
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="rounded-full bg-muted p-3">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No Completed Elections</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  There are no completed elections yet. <br />
                  Active elections will appear here after they have ended.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
