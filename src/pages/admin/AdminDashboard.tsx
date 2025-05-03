
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useElection } from '@/contexts/ElectionContext';
import { useVoter, Voter } from '@/contexts/VoterContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSupport } from '@/contexts/SupportContext';
import { format } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  Calendar,
  ChevronRight,
  MessageSquare,
  User,
  UserCheck,
  Users,
  Vote,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import VoterVotingStatus from '@/components/admin/VoterVotingStatus';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { elections } = useElection();
  const { voters, loading: votersLoading } = useVoter();
  const { unreadMessagesCount, adminThreads } = useSupport();

  const [activeElections, setActiveElections] = useState(0);
  const [totalVoters, setTotalVoters] = useState(0);
  const [verifiedVoters, setVerifiedVoters] = useState(0);
  const [selectedElection, setSelectedElection] = useState<string>('');

  const [participationData, setParticipationData] = useState<
    { name: string; voted: number; notVoted: number }[]
  >([]);

  useEffect(() => {
    if (elections) {
      const active = elections.filter(
        (election) => 
          new Date(election.end_date) > new Date()
      ).length;
      setActiveElections(active);

      // Set the first active election as selected by default
      if (elections.length > 0 && !selectedElection) {
        const activeElection = elections.find(
          (election) => new Date(election.end_date) > new Date()
        );
        if (activeElection) {
          setSelectedElection(activeElection.id);
        } else if (elections[0]) {
          setSelectedElection(elections[0].id);
        }
      }
    }
  }, [elections, selectedElection]);

  useEffect(() => {
    if (voters) {
      setTotalVoters(voters.length);
      const verified = voters.filter((voter) => voter.verified).length;
      setVerifiedVoters(verified);
    }
  }, [voters]);

  useEffect(() => {
    if (elections?.length && selectedElection) {
      // Calculate participation data
      const election = elections.find((e) => e.id === selectedElection);
      if (election) {
        // Get all votes for this election
        const participationByDay = {};
        
        // Create data for last 7 days
        const today = new Date();
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          const formattedDate = format(date, 'MMM dd');
          
          // Generate random data for demo purposes
          const totalVoters = Math.floor(Math.random() * 50) + 50; // Between 50-100
          const voted = Math.floor(Math.random() * totalVoters);
          const notVoted = totalVoters - voted;
          
          data.push({
            name: formattedDate,
            voted,
            notVoted,
          });
        }
        
        setParticipationData(data);
      }
    }
  }, [elections, selectedElection]);

  // Filter relevant voters for the selected election
  const electionsMap = new Map();
  if (elections) {
    elections.forEach(election => {
      electionsMap.set(election.id, election);
    });
  }

  // Display the 5 most recent voters
  const recentVoters = voters ? [...voters]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5) : [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex gap-1 items-center">
            <User className="h-3.5 w-3.5" />
            <span>{user?.name}</span>
          </Badge>
          <Badge variant="outline" className="bg-primary/10">Admin</Badge>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Active Elections</p>
              <p className="text-2xl font-bold">{activeElections}</p>
            </div>
            <Calendar className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Voters</p>
              <p className="text-2xl font-bold">{totalVoters}</p>
            </div>
            <Users className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Verified Voters</p>
              <p className="text-2xl font-bold">{verifiedVoters}</p>
            </div>
            <UserCheck className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Support Messages</p>
              <p className="text-2xl font-bold">{unreadMessagesCount}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participation Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Election Participation</CardTitle>
                <CardDescription>Voting trends over time</CardDescription>
              </div>
              {elections && elections.length > 0 && (
                <div className="flex items-center space-x-2">
                  <select
                    className="p-2 text-sm border rounded-md"
                    value={selectedElection}
                    onChange={(e) => setSelectedElection(e.target.value)}
                  >
                    {elections.map((election) => (
                      <option key={election.id} value={election.id}>
                        {election.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={participationData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar name="Voted" dataKey="voted" fill="#10b981" />
                <Bar name="Not Voted" dataKey="notVoted" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Upcoming election reminder */}
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 text-amber-700 p-2 rounded-lg dark:bg-amber-900 dark:text-amber-100">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Upcoming Election</p>
                  <p className="text-sm text-muted-foreground">
                    {elections && elections.length > 0 
                      ? `"${elections[0]?.title}" starts on ${new Date(elections[0]?.start_date).toLocaleDateString()}`
                      : "No upcoming elections"}
                  </p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              
              {/* New support message */}
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-lg dark:bg-blue-900 dark:text-blue-100">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">New Support Messages</p>
                  <p className="text-sm text-muted-foreground">
                    {adminThreads.length > 0 
                      ? `${unreadMessagesCount} unread messages from ${adminThreads.length} voters`
                      : "No unread messages"}
                  </p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
              
              {/* Election activity */}
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-700 p-2 rounded-lg dark:bg-green-900 dark:text-green-100">
                  <Vote className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Election Activity</p>
                  <p className="text-sm text-muted-foreground">
                    10 new votes in the last hour
                  </p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              
              {/* System activity */}
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 text-purple-700 p-2 rounded-lg dark:bg-purple-900 dark:text-purple-100">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">System Update</p>
                  <p className="text-sm text-muted-foreground">
                    System maintenance completed successfully
                  </p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/admin/activity-logs">
                View All Activity
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Voters & Election Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Voters */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Voters</CardTitle>
            <CardDescription>Newly registered voters</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {recentVoters.map((voter) => (
                  <div key={voter.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{voter.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {voter.verified ? 'Verified' : 'Unverified'} voter
                        </p>
                      </div>
                    </div>
                    {selectedElection && (
                      <VoterVotingStatus 
                        voter={voter} 
                        electionId={selectedElection} 
                      />
                    )}
                  </div>
                ))}
                
                {recentVoters.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent voters found
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <Separator className="my-4" />
            
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/admin/voters">
                Manage All Voters
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Elections Status */}
        <Card>
          <CardHeader>
            <CardTitle>Election Status</CardTitle>
            <CardDescription>Overview of current and upcoming elections</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                <ScrollArea className="h-[250px] pr-4">
                  {elections && elections
                    .filter(election => 
                      new Date(election.start_date) <= new Date() && 
                      new Date(election.end_date) >= new Date()
                    )
                    .map(election => (
                      <div key={election.id} className="mb-3 pb-3 border-b last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{election.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Ends {format(new Date(election.end_date), 'MMM dd, yyyy')}
                            </p>
                            <Badge variant="secondary" className="mt-1">
                              Active
                            </Badge>
                          </div>
                          <Button size="sm" asChild>
                            <Link to={`/admin/elections/edit/${election.id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  }
                  
                  {elections && elections.filter(election => 
                    new Date(election.start_date) <= new Date() && 
                    new Date(election.end_date) >= new Date()
                  ).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No active elections found
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="upcoming">
                <ScrollArea className="h-[250px] pr-4">
                  {elections && elections
                    .filter(election => new Date(election.start_date) > new Date())
                    .map(election => (
                      <div key={election.id} className="mb-3 pb-3 border-b last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{election.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Starts {format(new Date(election.start_date), 'MMM dd, yyyy')}
                            </p>
                            <Badge variant="outline" className="mt-1">
                              Upcoming
                            </Badge>
                          </div>
                          <Button size="sm" asChild>
                            <Link to={`/admin/elections/edit/${election.id}`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  }
                  
                  {elections && elections.filter(election => 
                    new Date(election.start_date) > new Date()
                  ).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No upcoming elections found
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="past">
                <ScrollArea className="h-[250px] pr-4">
                  {elections && elections
                    .filter(election => new Date(election.end_date) < new Date())
                    .map(election => (
                      <div key={election.id} className="mb-3 pb-3 border-b last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{election.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Ended {format(new Date(election.end_date), 'MMM dd, yyyy')}
                            </p>
                            <Badge variant="secondary" className="mt-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                              Completed
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/admin/elections/edit/${election.id}`}>
                              Results
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  }
                  
                  {elections && elections.filter(election => 
                    new Date(election.end_date) < new Date()
                  ).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No past elections found
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
            
            <Separator className="my-4" />
            
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/admin/elections">
                Manage All Elections
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
