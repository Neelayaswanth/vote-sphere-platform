
import { useState } from 'react';
import { useVoter } from '@/contexts/VoterContext';
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
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
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
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  CheckCircle, 
  Clock, 
  Download, 
  Lock, 
  MoreHorizontal, 
  Search, 
  ShieldCheck, 
  Unlock, 
  Users, 
  XCircle 
} from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';

export default function VoterManagement() {
  const { voters, updateVoterStatus, updateVoterVerification, updateVoterRole } = useVoter();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<{
    type: 'block' | 'unblock' | 'verify' | 'unverify' | 'changeRole';
    voterId: string;
    voterName: string;
    newRole?: UserRole;
  } | null>(null);
  
  // Filter and sort the voters
  const filteredVoters = voters.filter(voter => {
    // Search query filter
    const searchMatch = searchQuery === '' ||
      voter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voter.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Role filter
    const roleMatch = filterRole === 'all' || voter.role === filterRole;
    
    // Verification filter
    const verifiedMatch = filterVerified === 'all' ||
      (filterVerified === 'verified' && voter.verified) ||
      (filterVerified === 'unverified' && !voter.verified);
    
    // Status filter
    const statusMatch = filterStatus === 'all' ||
      (filterStatus === 'active' && voter.status === 'active') ||
      (filterStatus === 'blocked' && voter.status === 'blocked');
    
    return searchMatch && roleMatch && verifiedMatch && statusMatch;
  });
  
  // Sort by most recently active
  const sortedVoters = [...filteredVoters].sort(
    (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  );
  
  const handleActionConfirm = async () => {
    if (!dialogAction) return;
    
    try {
      switch (dialogAction.type) {
        case 'block':
          await updateVoterStatus(dialogAction.voterId, 'blocked');
          break;
        case 'unblock':
          await updateVoterStatus(dialogAction.voterId, 'active');
          break;
        case 'verify':
          await updateVoterVerification(dialogAction.voterId, true);
          break;
        case 'unverify':
          await updateVoterVerification(dialogAction.voterId, false);
          break;
        case 'changeRole':
          if (dialogAction.newRole) {
            await updateVoterRole(dialogAction.voterId, dialogAction.newRole);
          }
          break;
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setDialogOpen(false);
      setDialogAction(null);
    }
  };
  
  const getActionVerb = (actionType: string) => {
    switch (actionType) {
      case 'block': return 'block';
      case 'unblock': return 'unblock';
      case 'verify': return 'verify';
      case 'unverify': return 'unverify';
      case 'changeRole': return 'change the role of';
      default: return 'update';
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Voter Management</h1>
        <p className="text-muted-foreground">
          View, verify, and manage all registered voters
        </p>
      </div>
      
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter and search for specific voters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative mt-1.5">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="filter-role">Role</Label>
              <Select
                value={filterRole}
                onValueChange={(value) => setFilterRole(value as UserRole | 'all')}
              >
                <SelectTrigger id="filter-role" className="mt-1.5">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>User Roles</SelectLabel>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="voter">Voters</SelectItem>
                    <SelectItem value="admin">Administrators</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-verified">Verification</Label>
              <Select
                value={filterVerified}
                onValueChange={setFilterVerified}
              >
                <SelectTrigger id="filter-verified" className="mt-1.5">
                  <SelectValue placeholder="Filter by verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Verification Status</SelectLabel>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-status">Status</Label>
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger id="filter-status" className="mt-1.5">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Account Status</SelectLabel>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setFilterRole('all');
                setFilterVerified('all');
                setFilterStatus('all');
              }}
            >
              Reset Filters
            </Button>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export User List
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Voters Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Registered Voters</CardTitle>
              <CardDescription>
                Showing {sortedVoters.length} of {voters.length} total voters
              </CardDescription>
            </div>
            <Button>
              <Users className="mr-2 h-4 w-4" />
              Add New Voter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Voting History</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVoters.length > 0 ? (
                  sortedVoters.map(voter => (
                    <TableRow key={voter.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={voter.profileImage} alt={voter.name} />
                            <AvatarFallback>{voter.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{voter.name}</div>
                            <div className="text-sm text-muted-foreground">{voter.email}</div>
                            <div className="flex items-center gap-1 mt-1">
                              {voter.role === 'admin' ? (
                                <Badge variant="outline" className="bg-primary/10 text-primary">
                                  Admin
                                </Badge>
                              ) : (
                                <Badge variant="outline">Voter</Badge>
                              )}
                              
                              {voter.verified ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Unverified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {voter.status === 'active' ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                            Blocked
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(voter.registeredDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {voter.votingHistory.length} elections
                      </TableCell>
                      <TableCell>
                        {new Date(voter.lastActive).toLocaleDateString()}
                      </TableCell>
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
                            
                            {/* Verification actions */}
                            {voter.verified ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setDialogAction({
                                    type: 'unverify',
                                    voterId: voter.id,
                                    voterName: voter.name,
                                  });
                                  setDialogOpen(true);
                                }}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                <span>Unverify User</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setDialogAction({
                                    type: 'verify',
                                    voterId: voter.id,
                                    voterName: voter.name,
                                  });
                                  setDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                <span>Verify User</span>
                              </DropdownMenuItem>
                            )}
                            
                            {/* Account status actions */}
                            {voter.status === 'active' ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setDialogAction({
                                    type: 'block',
                                    voterId: voter.id,
                                    voterName: voter.name,
                                  });
                                  setDialogOpen(true);
                                }}
                              >
                                <Lock className="mr-2 h-4 w-4" />
                                <span>Block User</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setDialogAction({
                                    type: 'unblock',
                                    voterId: voter.id,
                                    voterName: voter.name,
                                  });
                                  setDialogOpen(true);
                                }}
                              >
                                <Unlock className="mr-2 h-4 w-4" />
                                <span>Unblock User</span>
                              </DropdownMenuItem>
                            )}
                            
                            {/* Role change actions */}
                            {voter.role === 'voter' ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setDialogAction({
                                    type: 'changeRole',
                                    voterId: voter.id,
                                    voterName: voter.name,
                                    newRole: 'admin',
                                  });
                                  setDialogOpen(true);
                                }}
                              >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                <span>Promote to Admin</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setDialogAction({
                                    type: 'changeRole',
                                    voterId: voter.id,
                                    voterName: voter.name,
                                    newRole: 'voter',
                                  });
                                  setDialogOpen(true);
                                }}
                              >
                                <Users className="mr-2 h-4 w-4" />
                                <span>Demote to Voter</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No voters found matching the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm Action
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {getActionVerb(dialogAction?.type || '')} {dialogAction?.voterName}?
              {dialogAction?.type === 'changeRole' && dialogAction.newRole && (
                <p className="mt-2">
                  This will change their role from <strong>{dialogAction.newRole === 'admin' ? 'Voter' : 'Administrator'}</strong> to <strong>{dialogAction.newRole === 'admin' ? 'Administrator' : 'Voter'}</strong>.
                </p>
              )}
              This action can be reversed later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleActionConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
