import React, { useState } from 'react';
import { useVoter } from '@/contexts/VoterContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole, UserStatus } from '@/contexts/AuthContext';
import { Download, Filter, RefreshCw, UserCheck, UserMinus, UserPlus, Search } from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

const VoterManagement = () => {
  const { 
    voters, 
    updateVoterStatus, 
    updateVoterVerification, 
    updateVoterRole, 
    searchVoters, 
    filterVoters,
    exportVotersList,
    loading 
  } = useVoter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<UserStatus | 'all'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // The data is automatically refreshed by the context
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleExport = () => {
    exportVotersList();
  };

  const filteredVoters = React.useMemo(() => {
    let results = searchQuery ? searchVoters(searchQuery) : voters;
    
    if (activeFilter !== 'all') {
      results = results.filter(voter => voter.status === activeFilter);
    }
    
    if (verifiedFilter !== 'all') {
      results = results.filter(voter => voter.verified === verifiedFilter);
    }
    
    return results;
  }, [voters, searchQuery, activeFilter, verifiedFilter, searchVoters]);

  const activeVoters = voters.filter(voter => voter.status === 'active');
  const blockedVoters = voters.filter(voter => voter.status === 'blocked');
  const verifiedVoters = voters.filter(voter => voter.verified);
  const unverifiedVoters = voters.filter(voter => !voter.verified);

  const renderVoterRow = (voter: any) => (
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
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge 
          variant={voter.role === 'admin' ? 'default' : 'secondary'}
        >
          {voter.role === 'admin' ? 'Admin' : 'Voter'}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge 
          variant={voter.verified ? 'success' : 'outline'}
        >
          {voter.verified ? 'Verified' : 'Unverified'}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge 
          variant={voter.status === 'active' ? 'default' : 'destructive'}
        >
          {voter.status === 'active' ? 'Active' : 'Blocked'}
        </Badge>
      </TableCell>
      <TableCell>{format(new Date(voter.registeredDate), 'MMM d, yyyy')}</TableCell>
      <TableCell>{voter.votingHistory.length}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem 
              onClick={() => updateVoterVerification(voter.id, !voter.verified)}
            >
              {voter.verified ? 'Remove Verification' : 'Verify User'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => updateVoterStatus(voter.id, voter.status === 'active' ? 'blocked' : 'active')}
            >
              {voter.status === 'active' ? 'Block User' : 'Activate User'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => updateVoterRole(voter.id, voter.role === 'admin' ? 'voter' : 'admin')}
            >
              {voter.role === 'admin' ? 'Make Voter' : 'Make Admin'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  const renderSkeletonRows = (count: number) => (
    Array(count).fill(0).map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Voter Management</h1>
        <p className="text-muted-foreground">Manage and monitor all registered voters</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Voter
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Voter Statistics</CardTitle>
          <CardDescription>Overview of voter accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-lg border text-center">
              <h3 className="text-xl md:text-2xl font-bold">{voters.length}</h3>
              <p className="text-muted-foreground text-sm">Total Users</p>
            </div>
            <div className="bg-card p-4 rounded-lg border text-center">
              <h3 className="text-xl md:text-2xl font-bold text-green-600">{activeVoters.length}</h3>
              <p className="text-muted-foreground text-sm">Active Users</p>
            </div>
            <div className="bg-card p-4 rounded-lg border text-center">
              <h3 className="text-xl md:text-2xl font-bold text-yellow-600">{verifiedVoters.length}</h3>
              <p className="text-muted-foreground text-sm">Verified Users</p>
            </div>
            <div className="bg-card p-4 rounded-lg border text-center">
              <h3 className="text-xl md:text-2xl font-bold text-red-600">{blockedVoters.length}</h3>
              <p className="text-muted-foreground text-sm">Blocked Users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle>Registered Voters</CardTitle>
              <CardDescription>
                {loading ? 'Loading voters data...' : `Showing ${filteredVoters.length} of ${voters.length} voters`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              <div className="flex items-center gap-2">
                <Switch 
                  id="verified-filter" 
                  checked={verifiedFilter === true} 
                  onCheckedChange={() => {
                    setVerifiedFilter(curr => {
                      if (curr === 'all') return true;
                      if (curr === true) return false;
                      return 'all';
                    });
                  }} 
                />
                <Label htmlFor="verified-filter">Verified</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="active-filter" 
                  checked={activeFilter === 'active'} 
                  onCheckedChange={() => {
                    setActiveFilter(curr => {
                      if (curr === 'all') return 'active';
                      if (curr === 'active') return 'blocked';
                      return 'all';
                    });
                  }} 
                />
                <Label htmlFor="active-filter">Active</Label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Votes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading 
                  ? renderSkeletonRows(5)
                  : filteredVoters.length === 0 
                  ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No voters found
                      </TableCell>
                    </TableRow>
                  )
                  : filteredVoters.map(renderVoterRow)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoterManagement;
