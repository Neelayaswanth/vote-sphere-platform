
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
import { useToast } from '@/components/ui/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download,
  Filter,
  Loader2, 
  Search, 
  UserPlus,
  MessageSquare,
  Send,
  RefreshCcw
} from 'lucide-react';
import { useVoter } from '@/contexts/VoterContext';
import { useElection } from '@/contexts/ElectionContext';
import { useSupport } from '@/contexts/SupportContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VoterVotingStatus from '@/components/admin/VoterVotingStatus';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const itemsPerPage = 10;

export default function VoterManagement() {
  const { toast } = useToast();
  const { voters, updateVoterVerification, updateVoterStatus, exportVotersList, loading: votersLoading } = useVoter();
  const { elections } = useElection();
  const { sendMessage } = useSupport();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [localLoading, setLocalLoading] = useState(true);
  const [filteredVoters, setFilteredVoters] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>("");
  const [reminderMessage, setReminderMessage] = useState("Hello! This is a friendly reminder that there is an active election waiting for your vote. Please login to cast your vote as soon as possible.");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<any>(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const refreshVoters = async () => {
    setRefreshing(true);
    try {
      // Force refresh by triggering a state change
      setLocalLoading(true);
      // Wait a bit to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Re-filter the voters with current search query
      filterAndPaginateVoters();
      
      toast({
        title: "Refreshed",
        description: "Voter list has been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing voters:", error);
    } finally {
      setRefreshing(false);
      setLocalLoading(false);
    }
  };
  
  const filterAndPaginateVoters = () => {
    // Filter voters based on search query
    const filtered = searchQuery 
      ? voters.filter(voter => 
          voter.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [...voters];
    
    // Update total pages
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    
    // Paginate the results
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setFilteredVoters(filtered.slice(start, end));
  };
  
  useEffect(() => {
    if (!votersLoading) {
      setLocalLoading(false);
      filterAndPaginateVoters();
    }
  }, [voters, searchQuery, currentPage, votersLoading]);
  
  const handleVerifyVoter = async (voterId: string) => {
    try {
      console.log("Verifying voter:", voterId);
      await updateVoterVerification(voterId, true);
      
      toast({
        title: "Voter Verified",
        description: "The voter account has been successfully verified.",
      });
    } catch (error) {
      console.error("Error verifying voter:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify voter. Please try again.",
      });
    }
  };
  
  const handleBlockVoter = async (voterId: string) => {
    try {
      await updateVoterStatus(voterId, 'blocked');
    } catch (error) {
      console.error("Error blocking voter:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to block voter. Please try again.",
      });
    }
  };
  
  const handleUnblockVoter = async (voterId: string) => {
    try {
      await updateVoterStatus(voterId, 'active');
    } catch (error) {
      console.error("Error unblocking voter:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unblock voter. Please try again.",
      });
    }
  };
  
  const handleExport = async () => {
    try {
      await exportVotersList();
      toast({
        title: "Export Successful",
        description: "The voters list has been exported successfully.",
      });
    } catch (error) {
      console.error("Error exporting voters list:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export voters list. Please try again.",
      });
    }
  };
  
  const handleSendVoteReminder = async () => {
    if (!selectedVoter) return;
    
    setMessageLoading(true);
    
    try {
      await sendMessage(reminderMessage, selectedVoter.id);
      toast({
        title: "Reminder Sent",
        description: `Vote reminder sent to ${selectedVoter.name}.`,
      });
      setMessageDialogOpen(false);
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send reminder. Please try again.",
      });
    } finally {
      setMessageLoading(false);
    }
  };
  
  const openReminderDialog = (voter: any) => {
    setSelectedVoter(voter);
    setMessageDialogOpen(true);
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'blocked':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  const activeElections = elections.filter(election => 
    election.status === 'active' || election.status === 'completed'
  );
  
  const VoterItem = ({ voter, onVerify, onBlock, onUnblock }) => {
    const hasVoted = selectedElection ? 
      voter.votingHistory.some(vh => vh.electionId === selectedElection) : 
      false;

    return (
      <TableRow>
        <TableCell className="font-medium">{voter.name}</TableCell>
        <TableCell>{voter.email || 'No email provided'}</TableCell>
        <TableCell>
          {voter.verified ? (
            <Badge variant="secondary">Verified</Badge>
          ) : (
            <div className="flex gap-2 items-center">
              <Badge variant="outline">Unverified</Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onVerify(voter.id)}
              >
                Verify
              </Button>
            </div>
          )}
        </TableCell>
        <TableCell>
          <Badge 
            variant={getStatusBadgeVariant(voter.status)}
          >
            {voter.status === 'active' ? 'Active' : 'Blocked'}
          </Badge>
        </TableCell>
        <TableCell>
          {selectedElection && (
            <VoterVotingStatus 
              voter={voter}
              electionId={selectedElection} 
            />
          )}
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            {selectedElection && !hasVoted && voter.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openReminderDialog(voter)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Remind
              </Button>
            )}
            
            {voter.status === 'active' ? (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive hover:bg-destructive/10"
                onClick={() => onBlock(voter.id)}
              >
                Block
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUnblock(voter.id)}
              >
                Unblock
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Voter Management</h1>
        <p className="text-muted-foreground">
          Manage voter accounts and permissions
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Voter Accounts</CardTitle>
          <CardDescription>
            View, verify, and manage voter accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 mb-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              <Button 
                variant="outline"
                onClick={refreshVoters}
                disabled={refreshing}
              >
                <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleExport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Voter
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            <Select
              value={selectedElection}
              onValueChange={setSelectedElection}
            >
              <SelectTrigger className="w-full md:w-[240px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by election" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All voters</SelectItem>
                {activeElections.map((election) => (
                  <SelectItem key={election.id} value={election.id}>
                    {election.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <ScrollArea className="my-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Voting Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="mt-2 text-sm text-muted-foreground">Loading voter accounts...</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVoters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-muted-foreground">No voter accounts found.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVoters.map(voter => (
                        <VoterItem 
                          key={voter.id}
                          voter={voter}
                          onVerify={handleVerifyVoter}
                          onBlock={handleBlockVoter}
                          onUnblock={handleUnblockVoter}
                        />
                      ))
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
          
          <div className="flex items-center justify-between">
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
        </CardContent>
      </Card>

      {/* Dialog to send vote reminder */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Vote Reminder</DialogTitle>
            <DialogDescription>
              {selectedVoter && `Send a reminder to ${selectedVoter.name} to vote in the current election.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              placeholder="Enter your message here..."
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleSendVoteReminder}
              disabled={messageLoading}
            >
              {messageLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Reminder
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
