
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AreaChart, BarChart, PieChart } from '@/components/ui/chart';
import { useElection } from '@/contexts/ElectionContext';
import { useVoter } from '@/contexts/VoterContext';
import { useAuth } from '@/contexts/AuthContext';
import AdminSupportCenter from '@/components/support/AdminSupportCenter';
import VoterVotingStatus from '@/components/admin/VoterVotingStatus';
import { ChevronRight, Users, Calendar, Vote, Activity, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { elections } = useElection();
  const { voters } = useVoter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate dashboard metrics
  const activeElections = elections.filter(election => election.status === 'active').length;
  const upcomingElections = elections.filter(election => election.status === 'upcoming').length;
  const completedElections = elections.filter(election => election.status === 'completed').length;
  const totalVoters = voters.length;
  const verifiedVoters = voters.filter(voter => voter.verified).length;
  
  // For election activity chart
  const electionVotes = elections.map(election => ({
    name: election.title.length > 20 ? `${election.title.substring(0, 20)}...` : election.title,
    total: election.totalVotes,
  })).sort((a, b) => b.total - a.total).slice(0, 5);

  // For voter verification status
  const verificationData = [
    { name: 'Verified', value: verifiedVoters },
    { name: 'Unverified', value: totalVoters - verifiedVoters }
  ];

  // For election status chart
  const electionStatusData = [
    { name: 'Active', value: activeElections },
    { name: 'Upcoming', value: upcomingElections },
    { name: 'Completed', value: completedElections }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'Administrator'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Link to="/admin/elections/new">
            <Button>Create New Election</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="voting-status">Voting Status</TabsTrigger>
          <TabsTrigger value="support">Support Center</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Voters
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalVoters}</div>
                <p className="text-xs text-muted-foreground">
                  {verifiedVoters} verified ({Math.round((verifiedVoters / totalVoters) * 100) || 0}%)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Elections
                </CardTitle>
                <Vote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeElections}</div>
                <p className="text-xs text-muted-foreground">
                  {upcomingElections} upcoming, {completedElections} completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Elections
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{elections.length}</div>
                <p className="text-xs text-muted-foreground">
                  {totalVoters > 0 ? Math.round(elections.length / totalVoters * 100) / 100 : 0} per voter average
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Voter Activity
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {elections.reduce((sum, election) => sum + election.totalVotes, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total votes cast across all elections
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Election Vote Counts</CardTitle>
                <CardDescription>
                  Vote distribution across top active elections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={electionVotes} 
                  index="name" 
                  categories={["total"]} 
                  valueFormatter={(v) => `${v} votes`}
                  showLegend={false}
                  showAnimation={true}
                  className="h-80"
                />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Voter Verification</CardTitle>
                <CardDescription>
                  Verification status of registered voters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart 
                  data={verificationData} 
                  index="name" 
                  category="value"
                  valueFormatter={(v) => `${v} voters`}
                  className="h-80"
                  colors={["emerald", "amber"]}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Election Status</CardTitle>
                <CardDescription>
                  Distribution of elections by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart 
                  data={electionStatusData} 
                  index="name" 
                  category="value"
                  valueFormatter={(v) => `${v} elections`}
                  className="h-80"
                  colors={["blue", "indigo", "violet"]}
                />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Voters</CardTitle>
                <CardDescription>
                  List of recently registered voters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {voters.slice(0, 5).map((voter) => (
                    <div key={voter.id} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{voter.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3 space-y-1">
                        <p className="text-sm font-medium leading-none">{voter.name}</p>
                        <p className="text-sm text-muted-foreground">{voter.email}</p>
                      </div>
                      <div className="ml-auto">
                        {voter.verified ? (
                          <Badge>Verified</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/admin/voters">
                      View all voters
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="voting-status">
          <VoterVotingStatus />
        </TabsContent>
        
        <TabsContent value="support">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Support Center
                  </CardTitle>
                  <CardDescription>
                    Manage and respond to voter support requests
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AdminSupportCenter />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
