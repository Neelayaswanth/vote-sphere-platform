
import { useVoter } from '@/contexts/VoterContext';
import { useElection } from '@/contexts/ElectionContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  CheckCircle, 
  ChevronRight, 
  FileBarChart, 
  Info, 
  Users, 
  Vote, 
  XCircle 
} from 'lucide-react';

export default function AdminDashboard() {
  const { voters } = useVoter();
  const { elections } = useElection();
  
  // Election statistics
  const activeElections = elections.filter(election => election.status === 'active');
  const upcomingElections = elections.filter(election => election.status === 'upcoming');
  const completedElections = elections.filter(election => election.status === 'completed');
  
  // Voter statistics
  const totalVoters = voters.length;
  const verifiedVoters = voters.filter(voter => voter.verified).length;
  const unverifiedVoters = totalVoters - verifiedVoters;
  const activeVoters = voters.filter(voter => voter.status === 'active').length;
  const blockedVoters = totalVoters - activeVoters;
  
  // Voter verification chart data
  const verificationData = [
    { name: 'Verified', value: verifiedVoters },
    { name: 'Unverified', value: unverifiedVoters }
  ];
  
  // Voter status chart data
  const statusData = [
    { name: 'Active', value: activeVoters },
    { name: 'Blocked', value: blockedVoters }
  ];
  
  // Election participation data for bar chart
  const electionParticipationData = completedElections.map(election => ({
    name: election.title.split(' ').slice(0, 2).join(' '), // Shortened name for display
    participants: election.totalVotes
  }));
  
  // Colors for charts
  const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#8884d8', '#82ca9d'];
  
  // Calculate voter turnout percentage
  const calculateVoterTurnout = () => {
    if (completedElections.length === 0) return 0;
    
    const totalCompletedVotes = completedElections.reduce((sum, election) => sum + election.totalVotes, 0);
    const averageVotes = totalCompletedVotes / completedElections.length;
    return Math.round((averageVotes / totalVoters) * 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of the voting system platform
        </p>
      </div>
      
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Voters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVoters}</div>
            <p className="text-xs text-muted-foreground">
              {verifiedVoters} verified
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/voters">
                  Manage Voters
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Elections</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeElections.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingElections.length} upcoming
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/elections">
                  Manage Elections
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voter Turnout</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateVoterTurnout()}%</div>
            <p className="text-xs text-muted-foreground">
              Average participation rate
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/elections">
                  View Details
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Election Reports</CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedElections.length}</div>
            <p className="text-xs text-muted-foreground">
              Completed elections
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/activity-logs">
                  View Reports
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Voter Verification Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Voter Verification Status</CardTitle>
            <CardDescription>
              Percentage of verified vs. unverified voters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={verificationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {verificationData.map((entry, index) => (
                      <Cell key={`cell-verification-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Election Participation Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Election Participation</CardTitle>
            <CardDescription>
              Number of voters in each completed election
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {electionParticipationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={electionParticipationData}
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="participants" fill="#0066ff" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Info className="h-10 w-10 text-muted-foreground mx-auto" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No completed elections data available
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Voter Activity</CardTitle>
            <CardDescription>
              Latest actions from voters on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Vote className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Vote Cast</p>
                  <p className="text-xs text-muted-foreground">
                    John Smith voted in City Council Election
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Just now
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-green-100 p-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Voter Verified</p>
                  <p className="text-xs text-muted-foreground">
                    Admin verified Maria Garcia's account
                  </p>
                  <p className="text-xs text-muted-foreground">
                    2 hours ago
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-blue-100 p-2">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">New Registration</p>
                  <p className="text-xs text-muted-foreground">
                    Michael Brown created a new account
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Yesterday
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-red-100 p-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Account Blocked</p>
                  <p className="text-xs text-muted-foreground">
                    Admin blocked Sarah Williams's account
                  </p>
                  <p className="text-xs text-muted-foreground">
                    2 days ago
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Button variant="link" asChild>
                <Link to="/admin/activity-logs">
                  View All Activity
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for platform administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full justify-start" asChild>
                <Link to="/admin/elections/new">
                  <Vote className="mr-2 h-4 w-4" />
                  Create New Election
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/voters">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Voters
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/elections">
                  <FileBarChart className="mr-2 h-4 w-4" />
                  Download Election Reports
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/settings">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Admin Accounts
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
