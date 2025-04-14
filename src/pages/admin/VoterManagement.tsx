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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const itemsPerPage = 10;

export default function VoterManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [voters, setVoters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    const fetchVoters = async () => {
      if (!user || user.role !== 'admin') return;
      
      setLoading(true);
      
      try {
        let query = supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .eq('role', 'voter')
          .order('created_at', { ascending: false });
          
        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }
        
        const { data, error, count } = await query
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
          
        if (error) throw error;
        
        const voterData = data.map(profile => ({
          id: profile.id,
          name: profile.name,
          email: '',
          verified: true,
          status: profile.status || 'active',
          profileImage: profile.profile_image || '/placeholder.svg'
        }));
        
        setVoters(voterData);
        setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      } catch (error) {
        console.error('Error fetching voters:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load voter accounts."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchVoters();
  }, [user, searchQuery, currentPage]);
  
  const handleVerifyVoter = async (voterId: string) => {
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Voter Verified",
        description: "The voter account has been successfully verified.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify voter. Please try again.",
      });
    }
  };
  
  const handleBlockVoter = async (voterId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'blocked' })
        .eq('id', voterId);
        
      if (error) throw error;
      
      setVoters(prev => 
        prev.map(voter => 
          voter.id === voterId ? { ...voter, status: 'blocked' } : voter
        )
      );
      
      toast({
        title: "Voter Blocked",
        description: "The voter account has been successfully blocked.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to block voter. Please try again.",
      });
    }
  };
  
  const handleUnblockVoter = async (voterId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', voterId);
        
      if (error) throw error;
      
      setVoters(prev => 
        prev.map(voter => 
          voter.id === voterId ? { ...voter, status: 'active' } : voter
        )
      );
      
      toast({
        title: "Voter Unblocked",
        description: "The voter account has been successfully unblocked.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unblock voter. Please try again.",
      });
    }
  };
  
  const VoterItem = ({ voter, onVerify, onBlock, onUnblock }) => {
    return (
      <TableRow>
        <TableCell className="font-medium">{voter.name}</TableCell>
        <TableCell>{voter.email}</TableCell>
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
            variant={voter.status === 'active' ? 'default' : 'destructive'}
          >
            {voter.status === 'active' ? 'Active' : 'Blocked'}
          </Badge>
        </TableCell>
        <TableCell>
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
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
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
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Voter
            </Button>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="mt-2 text-sm text-muted-foreground">Loading voter accounts...</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    voters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-muted-foreground">No voter accounts found.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      voters.map(voter => (
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
    </div>
  );
}
