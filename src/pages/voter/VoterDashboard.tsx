
import { useAuth } from '@/contexts/AuthContext';
import { useElection } from '@/contexts/ElectionContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Calendar, 
  ChevronRight, 
  Settings, 
  User, 
  Vote 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function VoterDashboard() {
  const { user } = useAuth();
  const { elections, userVotes } = useElection();
  
  // Format data for active elections chart
  const activeElections = elections.filter(election => election.status === 'active');
  const upcomingElections = elections.filter(election => election.status === 'upcoming');
  
  // Format data for voter participation chart
  const completedElections = elections.filter(election => election.status === 'completed');
  
  const electionParticipationData = completedElections.map(election => ({
    name: election.title.split(' ').slice(0, 2).join(' '),
    totalVotes: election.totalVotes,
  }));
  
  // Pie chart data for voter types
  const pieChartData = [
    { name: 'Voted', value: userVotes.length },
    { name: 'Not Voted', value: Math.max(0, elections.length - userVotes.length) }
  ];
  
  const COLORS = ['#0088FE', '#BBDEFB'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your voting account.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick access card - Profile */}
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-muted-foreground">{user?.email}</p>
              {user?.verified ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100 mt-1">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 mt-1">
                  Awaiting Verification
                </span>
              )}
            </div>
            <div className="mt-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/voter/profile">
                  View Profile
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick access card - Elections */}
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
                <Link to="/voter/elections">
                  View Elections
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick access card - Voting History */}
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voting History</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userVotes.length}</div>
            <p className="text-xs text-muted-foreground">
              Elections you've participated in
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/voter/history">
                  View History
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Bar chart - Election Participation */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Election Participation</CardTitle>
            <CardDescription>
              Total votes in completed elections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {electionParticipationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={electionParticipationData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalVotes" fill="#0066ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    No completed elections data available
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Pie chart - Your Voting Status */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Your Voting Status</CardTitle>
            <CardDescription>
              Elections you've voted in vs. available elections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Active Elections */}
        <Card>
          <CardHeader>
            <CardTitle>Active Elections</CardTitle>
            <CardDescription>
              Current elections you can participate in
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeElections.length > 0 ? (
              <div className="space-y-4">
                {activeElections.map(election => (
                  <div key={election.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{election.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Ends: {new Date(election.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button asChild>
                      <Link to={`/voter/elections/${election.id}`}>
                        Vote Now
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                There are no active elections at the moment.
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Upcoming Elections */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Elections</CardTitle>
            <CardDescription>
              Elections that will be active soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingElections.length > 0 ? (
              <div className="space-y-4">
                {upcomingElections.map(election => (
                  <div key={election.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{election.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Starts: {new Date(election.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link to={`/voter/elections/${election.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                There are no upcoming elections scheduled.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
