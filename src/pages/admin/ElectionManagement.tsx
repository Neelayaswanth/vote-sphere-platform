
import { useState } from 'react';
import { useElection, Election } from '@/contexts/ElectionContext';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
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
  Calendar, 
  Download, 
  Edit, 
  FileBarChart, 
  MoreHorizontal, 
  Plus, 
  Trash, 
  Users, 
  Vote 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ElectionManagement() {
  const { elections, deleteElection } = useElection();
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const activeElections = elections.filter(election => election.status === 'active');
  const upcomingElections = elections.filter(election => election.status === 'upcoming');
  const completedElections = elections.filter(election => election.status === 'completed');
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Function to format dates consistently
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Function to handle election deletion
  const handleDeleteElection = async () => {
    if (selectedElection) {
      await deleteElection(selectedElection.id);
      setDeleteDialogOpen(false);
      setSelectedElection(null);
    }
  };
  
  // Function to prepare data for candidate chart
  const prepareCandidateData = (election: Election) => {
    return election.candidates.map(candidate => ({
      name: candidate.name,
      votes: candidate.votes,
    }));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Election Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and monitor all elections
          </p>
        </div>
        
        <Button asChild>
          <Link to="/admin/elections/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Election
          </Link>
        </Button>
      </div>
      
      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Elections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeElections.length}</div>
            <p className="text-xs text-muted-foreground">
              Elections currently receiving votes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Elections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingElections.length}</div>
            <p className="text-xs text-muted-foreground">
              Elections scheduled for the future
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Elections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedElections.length}</div>
            <p className="text-xs text-muted-foreground">
              Past elections with results
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Elections Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Elections</CardTitle>
          <CardDescription>
            Manage and view all elections in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">
                Active
                <Badge variant="outline" className="ml-2">{activeElections.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming
                <Badge variant="outline" className="ml-2">{upcomingElections.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                <Badge variant="outline" className="ml-2">{completedElections.length}</Badge>
              </TabsTrigger>
            </TabsList>
            
            {/* Active Elections */}
            <TabsContent value="active" className="pt-4">
              {activeElections.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Election</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Candidates</TableHead>
                        <TableHead>Votes Cast</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeElections.map(election => (
                        <TableRow key={election.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{election.title}</div>
                              <div className="text-sm text-muted-foreground">{election.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(election.startDate)}</TableCell>
                          <TableCell>{formatDate(election.endDate)}</TableCell>
                          <TableCell>{election.candidates.length}</TableCell>
                          <TableCell>{election.totalVotes}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/elections/${election.id}`}>
                                    <Vote className="mr-2 h-4 w-4" />
                                    <span>View Details</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/elections/${election.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit Election</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedElection(election);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Delete Election</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Vote className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No Active Elections</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    There are no active elections at the moment.<br />
                    Create a new election to get started.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link to="/admin/elections/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Election
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Upcoming Elections */}
            <TabsContent value="upcoming" className="pt-4">
              {upcomingElections.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Election</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Candidates</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingElections.map(election => (
                        <TableRow key={election.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{election.title}</div>
                              <div className="text-sm text-muted-foreground">{election.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(election.startDate)}</TableCell>
                          <TableCell>{formatDate(election.endDate)}</TableCell>
                          <TableCell>{election.candidates.length}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/elections/${election.id}`}>
                                    <Vote className="mr-2 h-4 w-4" />
                                    <span>View Details</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/elections/${election.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit Election</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedElection(election);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Delete Election</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="rounded-full bg-secondary p-3">
                    <Calendar className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No Upcoming Elections</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    There are no upcoming elections scheduled.<br />
                    Create a new election to get started.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link to="/admin/elections/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Election
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Completed Elections */}
            <TabsContent value="completed" className="pt-4">
              {completedElections.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Election</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Candidates</TableHead>
                        <TableHead>Total Votes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedElections.map(election => (
                        <TableRow key={election.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{election.title}</div>
                              <div className="text-sm text-muted-foreground">{election.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(election.endDate)}</TableCell>
                          <TableCell>{election.candidates.length}</TableCell>
                          <TableCell>{election.totalVotes}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/elections/${election.id}`}>
                                    <FileBarChart className="mr-2 h-4 w-4" />
                                    <span>View Results</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  <span>Download Report</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedElection(election);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Delete Election</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="rounded-full bg-muted p-3">
                    <FileBarChart className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No Completed Elections</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    There are no completed elections yet.<br />
                    Active elections will appear here after they end.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Results Overview (only if there are completed elections) */}
      {completedElections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Election Results Overview</CardTitle>
            <CardDescription>
              Summary of results from completed elections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Example of showing a completed election result */}
              {completedElections.slice(0, 1).map(election => (
                <div key={election.id}>
                  <h3 className="text-lg font-medium mb-4">{election.title}</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareCandidateData(election)}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="votes" fill="#0066ff" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
              
              {/* Voter participation chart */}
              <div>
                <h3 className="text-lg font-medium mb-4">Voter Participation</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Participated', value: completedElections.reduce((sum, e) => sum + e.totalVotes, 0) },
                          { name: 'Did Not Vote', value: 1000 - completedElections.reduce((sum, e) => sum + e.totalVotes, 0) }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1].map((entry, index) => (
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
          <CardFooter className="justify-end">
            <Button variant="outline" asChild>
              <Link to="/admin/analytics">
                <FileBarChart className="mr-2 h-4 w-4" />
                View Detailed Analytics
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Election Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedElection?.title}"?
              <p className="mt-2 font-semibold">This action cannot be undone.</p>
              {selectedElection?.status === 'active' && (
                <p className="mt-2 text-destructive">
                  Warning: This election is currently active. Deleting it will remove all votes and prevent further participation.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteElection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Election
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
