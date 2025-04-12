
import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  Download, 
  Filter, 
  Search, 
  CheckCircle, 
  Vote, 
  User, 
  Lock, 
  LogIn, 
  UserPlus,
  Settings 
} from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data for activity logs
const activityLogsMock = [
  {
    id: '1',
    userId: '2',
    userName: 'John Smith',
    userEmail: 'voter@example.com',
    action: 'VOTE_CAST',
    details: 'Voted in "City Council Election"',
    timestamp: '2024-04-12T08:30:45.000Z',
    ipAddress: '192.168.1.101'
  },
  {
    id: '2',
    userId: '3',
    userName: 'Maria Garcia',
    userEmail: 'unverified@example.com',
    action: 'ACCOUNT_CREATED',
    details: 'New voter account registered',
    timestamp: '2024-04-11T14:22:18.000Z',
    ipAddress: '192.168.1.102'
  },
  {
    id: '3',
    userId: '1',
    userName: 'Admin User',
    userEmail: 'admin@example.com',
    action: 'VERIFY_VOTER',
    details: 'Verified voter account for "Michael Brown"',
    timestamp: '2024-04-11T10:15:33.000Z',
    ipAddress: '192.168.1.100'
  },
  {
    id: '4',
    userId: '4',
    userName: 'James Johnson',
    userEmail: 'james@example.com',
    action: 'LOGIN_SUCCESS',
    details: 'User logged in successfully',
    timestamp: '2024-04-10T16:42:19.000Z',
    ipAddress: '192.168.1.103'
  },
  {
    id: '5',
    userId: '1',
    userName: 'Admin User',
    userEmail: 'admin@example.com',
    action: 'CREATE_ELECTION',
    details: 'Created new election "Presidential Election 2025"',
    timestamp: '2024-04-10T09:55:07.000Z',
    ipAddress: '192.168.1.100'
  },
  {
    id: '6',
    userId: '1',
    userName: 'Admin User',
    userEmail: 'admin@example.com',
    action: 'BLOCK_VOTER',
    details: 'Blocked voter account "Sarah Williams"',
    timestamp: '2024-04-09T11:20:41.000Z',
    ipAddress: '192.168.1.100'
  },
  {
    id: '7',
    userId: '6',
    userName: 'Michael Brown',
    userEmail: 'michael@example.com',
    action: 'VOTE_CAST',
    details: 'Voted in "City Council Election"',
    timestamp: '2024-04-08T13:38:24.000Z',
    ipAddress: '192.168.1.105'
  },
  {
    id: '8',
    userId: '6',
    userName: 'Michael Brown',
    userEmail: 'michael@example.com',
    action: 'PROFILE_UPDATE',
    details: 'Updated profile information',
    timestamp: '2024-04-07T15:10:12.000Z',
    ipAddress: '192.168.1.105'
  },
  {
    id: '9',
    userId: '1',
    userName: 'Admin User',
    userEmail: 'admin@example.com',
    action: 'SYSTEM_SETTINGS',
    details: 'Updated system settings',
    timestamp: '2024-04-06T10:05:33.000Z',
    ipAddress: '192.168.1.100'
  },
  {
    id: '10',
    userId: '4',
    userName: 'James Johnson',
    userEmail: 'james@example.com',
    action: 'LOGIN_FAILED',
    details: 'Failed login attempt',
    timestamp: '2024-04-05T08:30:45.000Z',
    ipAddress: '192.168.1.103'
  }
];

// Action type definitions for badges and icons
const actionTypeConfig: Record<string, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  VOTE_CAST: { 
    label: 'Vote Cast', 
    icon: <Vote className="h-3.5 w-3.5 mr-1" />, 
    variant: 'default' 
  },
  ACCOUNT_CREATED: { 
    label: 'Account Created', 
    icon: <UserPlus className="h-3.5 w-3.5 mr-1" />, 
    variant: 'secondary' 
  },
  VERIFY_VOTER: { 
    label: 'Verify Voter', 
    icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />, 
    variant: 'outline' 
  },
  LOGIN_SUCCESS: { 
    label: 'Login Success', 
    icon: <LogIn className="h-3.5 w-3.5 mr-1" />, 
    variant: 'outline' 
  },
  CREATE_ELECTION: { 
    label: 'Create Election', 
    icon: <Vote className="h-3.5 w-3.5 mr-1" />, 
    variant: 'outline' 
  },
  BLOCK_VOTER: { 
    label: 'Block Voter', 
    icon: <Lock className="h-3.5 w-3.5 mr-1" />, 
    variant: 'destructive' 
  },
  PROFILE_UPDATE: { 
    label: 'Profile Update', 
    icon: <User className="h-3.5 w-3.5 mr-1" />, 
    variant: 'outline' 
  },
  SYSTEM_SETTINGS: { 
    label: 'System Settings', 
    icon: <Settings className="h-3.5 w-3.5 mr-1" />, 
    variant: 'outline' 
  },
  LOGIN_FAILED: { 
    label: 'Login Failed', 
    icon: <LogIn className="h-3.5 w-3.5 mr-1" />, 
    variant: 'destructive' 
  }
};

export default function ActivityLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  
  // Filter activity logs based on search, action type, and date range
  const filteredLogs = activityLogsMock.filter(log => {
    // Search filter
    const searchMatch = searchQuery === '' || 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Action type filter
    const actionMatch = actionTypeFilter === 'ALL' || log.action === actionTypeFilter;
    
    // Date range filter
    const logDate = new Date(log.timestamp);
    const dateFromMatch = !dateFrom || logDate >= dateFrom;
    const dateToMatch = !dateTo || logDate <= dateTo;
    
    return searchMatch && actionMatch && dateFromMatch && dateToMatch;
  });
  
  // Sort by most recent first
  const sortedLogs = [...filteredLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">
          Track all actions and events within the voting system
        </p>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
          <CardDescription>
            Narrow down activity logs by user, action type, or date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative mt-1.5">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search users or actions"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="action-type">Action Type</Label>
              <Select 
                value={actionTypeFilter} 
                onValueChange={setActionTypeFilter}
              >
                <SelectTrigger id="action-type" className="mt-1.5">
                  <SelectValue placeholder="Filter by action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="VOTE_CAST">Vote Cast</SelectItem>
                  <SelectItem value="ACCOUNT_CREATED">Account Created</SelectItem>
                  <SelectItem value="VERIFY_VOTER">Verify Voter</SelectItem>
                  <SelectItem value="LOGIN_SUCCESS">Login Success</SelectItem>
                  <SelectItem value="CREATE_ELECTION">Create Election</SelectItem>
                  <SelectItem value="BLOCK_VOTER">Block Voter</SelectItem>
                  <SelectItem value="PROFILE_UPDATE">Profile Update</SelectItem>
                  <SelectItem value="SYSTEM_SETTINGS">System Settings</SelectItem>
                  <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date-from">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-from"
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1.5"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="date-to">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-to"
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1.5"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setActionTypeFilter('ALL');
                setDateFrom(undefined);
                setDateTo(undefined);
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Logs
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>
            Showing {sortedLogs.length} of {activityLogsMock.length} total logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLogs.length > 0 ? (
                  sortedLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{log.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{log.userName}</div>
                            <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={actionTypeConfig[log.action]?.variant || 'default'}
                          className="flex items-center w-fit"
                        >
                          {actionTypeConfig[log.action]?.icon}
                          {actionTypeConfig[log.action]?.label || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell className="text-muted-foreground">{log.ipAddress}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No activity logs found matching the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
