import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Loader2, 
  Users as UsersIcon,
  CheckCircle2,
  XCircle,
  Calendar,
  Shield,
  Vote as VoteIcon,
  RefreshCcw
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useElection } from '@/contexts/ElectionContext';

interface UserProfile {
  id: string;
  name: string;
  role: string;
  verified: boolean;
  profileImage?: string;
  registeredDate: string;
  lastActive: string;
  status: string;
  electionsParticipated: string[];
  totalVotes: number;
}

const itemsPerPage = 10;

export default function Users() {
  const { user } = useAuth();
  const { elections } = useElection();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, elections]);

  const fetchUsers = async () => {
    setLoading(true);
    
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (profilesError) {
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // Fetch all votes to get voting history
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('voter_id, election_id, created_at');
        
      if (votesError) {
        console.error('Error fetching votes:', votesError);
      }

      // Create a map of voter_id to their votes
      const votesByUser = new Map<string, { electionId: string; votedAt: string }[]>();
      if (votesData) {
        votesData.forEach(vote => {
          if (!votesByUser.has(vote.voter_id)) {
            votesByUser.set(vote.voter_id, []);
          }
          votesByUser.get(vote.voter_id)!.push({
            electionId: vote.election_id,
            votedAt: vote.created_at
          });
        });
      }

      // Process profiles into user profiles
      const userProfiles: UserProfile[] = profiles.map(profile => {
        const userVotes = votesByUser.get(profile.id) || [];
        const electionsParticipated = userVotes.map(v => v.election_id);
        const uniqueElections = Array.from(new Set(electionsParticipated));

        return {
          id: profile.id,
          name: profile.name,
          role: profile.role,
          verified: profile.verified,
          profileImage: profile.profile_image || undefined,
          registeredDate: profile.created_at,
          lastActive: profile.updated_at,
          status: profile.status || 'active',
          electionsParticipated: uniqueElections,
          totalVotes: userVotes.length
        };
      });

      setUsers(userProfiles);
      filterAndPaginateUsers(userProfiles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndPaginateUsers = (usersList: UserProfile[] = users) => {
    // Filter users based on search query
    const filtered = searchQuery 
      ? usersList.filter(user => 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.role.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [...usersList];
    
    // Update total pages
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    
    // Paginate the results
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setFilteredUsers(filtered.slice(start, end));
  };

  useEffect(() => {
    if (users.length > 0) {
      filterAndPaginateUsers();
    }
  }, [searchQuery, currentPage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUsers();
      toast({
        title: "Refreshed",
        description: "User list has been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing users:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getElectionTitles = (electionIds: string[]): string[] => {
    return electionIds
      .map(id => elections.find(e => e.id === id)?.title)
      .filter((title): title is string => !!title);
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <Badge variant="default" className="bg-primary">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <UsersIcon className="h-3 w-3 mr-1" />
        Voter
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Blocked
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            View all registered users and their voting activity
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Browse all registered users, their profile information, and voting participation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 mb-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or role..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>

          <ScrollArea className="my-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Votes Cast</TableHead>
                    <TableHead>Elections Participated</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-muted-foreground">No users found.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map(userProfile => {
                        const electionTitles = getElectionTitles(userProfile.electionsParticipated);
                        
                        return (
                          <TableRow key={userProfile.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={userProfile.profileImage || undefined} alt={userProfile.name} />
                                  <AvatarFallback>{userProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{userProfile.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Last active: {new Date(userProfile.lastActive).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getRoleBadge(userProfile.role)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(userProfile.status)}
                            </TableCell>
                            <TableCell>
                              {userProfile.verified ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Unverified
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <VoteIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{userProfile.totalVotes}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                {electionTitles.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {electionTitles.slice(0, 2).map((title, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {title}
                                      </Badge>
                                    ))}
                                    {electionTitles.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{electionTitles.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">No participation yet</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(userProfile.registeredDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>

          {!loading && filteredUsers.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

