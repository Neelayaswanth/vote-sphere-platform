
import { useState, useEffect } from 'react';
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
  Settings,
  Loader2
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
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Activity log interface
interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

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

// Helper function to get action config with defaults
const getActionConfig = (action: string) => {
  const actionKey = action.toUpperCase().replace(/_/g, '_');
  return actionTypeConfig[actionKey] || { 
    label: action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), 
    icon: <Settings className="h-3.5 w-3.5 mr-1" />, 
    variant: 'outline' 
  };
};

export default function ActivityLogs() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Function to fetch activity logs
  const fetchActivityLogs = async () => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // Query activity logs with user profiles
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles:user_id (name)
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Transform data to match our ActivityLog interface
      const formattedLogs: ActivityLog[] = data.map(log => ({
        id: log.id,
        userId: log.user_id,
        userName: log.profiles?.name || 'Unknown User',
        userEmail: '', // We don't get email from the database
        action: log.action,
        details: typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || ''),
        timestamp: log.created_at,
        ipAddress: log.details?.ip_address || '127.0.0.1'
      }));
      
      setActivityLogs(formattedLogs);
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: "Error",
        description: `Failed to load activity logs: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Set up initial data fetch and realtime subscription
  useEffect(() => {
    fetchActivityLogs();
    
    // Set up realtime subscription for new activity logs
    const channel = supabase
      .channel('activity-logs-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_logs' },
        () => {
          console.log('Activity logs table changed, refreshing data...');
          fetchActivityLogs();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchActivityLogs();
  };
  
  // Filter activity logs based on search, action type, and date range
  const filteredLogs = activityLogs.filter(log => {
    // Search filter
    const searchMatch = searchQuery === '' || 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Action type filter
    const actionMatch = actionTypeFilter === 'ALL' || log.action.toUpperCase() === actionTypeFilter;
    
    // Date range filter
    const logDate = new Date(log.timestamp);
    const dateFromMatch = !dateFrom || logDate >= dateFrom;
    const dateToMatch = !dateTo || logDate <= dateTo;
    
    return searchMatch && actionMatch && dateFromMatch && dateToMatch;
  });
  
  // Handle data export
  const exportLogs = () => {
    const dataToExport = filteredLogs.map(log => ({
      Date: new Date(log.timestamp).toLocaleDateString(),
      Time: new Date(log.timestamp).toLocaleTimeString(),
      User: log.userName,
      Action: getActionConfig(log.action).label,
      Details: log.details,
      'IP Address': log.ipAddress
    }));
    
    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      Object.keys(dataToExport[0]).join(",") + "\n" +
      dataToExport.map(row => 
        Object.values(row)
          .map(value => `"${value}"`)
          .join(",")
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: `${filteredLogs.length} logs exported to CSV`,
    });
  };

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
                  {Object.entries(actionTypeConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
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
            
            <Button variant="outline" onClick={exportLogs}>
              <Download className="mr-2 h-4 w-4" />
              Export Logs
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Activity Logs Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>
              {loading ? 'Loading logs...' : `Showing ${filteredLogs.length} of ${activityLogs.length} total logs`}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Loader2 className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
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
                  <TableHead className="hidden md:table-cell">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                      <div className="mt-2">Loading activity logs...</div>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map(log => {
                    const actionConfig = getActionConfig(log.action);
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" />
                              <AvatarFallback>{log.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="truncate">
                              <div className="font-medium">{log.userName}</div>
                              {log.userEmail && (
                                <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={actionConfig.variant}
                            className="flex items-center w-fit whitespace-nowrap"
                          >
                            {actionConfig.icon}
                            {actionConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{log.details}</TableCell>
                        <TableCell className="text-muted-foreground hidden md:table-cell">{log.ipAddress}</TableCell>
                      </TableRow>
                    );
                  })
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
