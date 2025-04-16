
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, Edit, Trash2, RefreshCw, Users } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useElection } from '@/contexts/ElectionContext';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useVoter } from '@/contexts/VoterContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X } from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';

const ElectionManagement = () => {
  const { elections, deleteElection, loading, endElection } = useElection();
  const { voters } = useVoter();
  const [refreshing, setRefreshing] = useState(false);
  const [electionToEnd, setElectionToEnd] = useState<string | null>(null);
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [votesMapping, setVotesMapping] = useState<{[key: string]: Set<string>}>({});
  const navigate = useNavigate();

  const upcomingElections = elections.filter(election => election.status === 'upcoming');
  const activeElections = elections.filter(election => election.status === 'active');
  const completedElections = elections.filter(election => election.status === 'completed');

  // Fetch votes data for each election
  useEffect(() => {
    const fetchVotesData = async () => {
      try {
        const { data, error } = await supabase
          .from('votes')
          .select('election_id, voter_id');
        
        if (error) {
          console.error('Error fetching votes data:', error);
          return;
        }
        
        // Create a mapping of election_id to a set of voter_ids
        const mapping: {[key: string]: Set<string>} = {};
        data?.forEach(vote => {
          if (!mapping[vote.election_id]) {
            mapping[vote.election_id] = new Set();
          }
          mapping[vote.election_id].add(vote.voter_id);
        });
        
        setVotesMapping(mapping);
      } catch (error) {
        console.error('Error in votes fetch operation:', error);
      }
    };
    
    fetchVotesData();
  }, []);

  const refreshData = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteElection(id);
    } catch (error) {
      console.error('Error deleting election:', error);
    }
  };

  const handleEndElection = async () => {
    if (electionToEnd) {
      await endElection(electionToEnd);
      setElectionToEnd(null);
    }
  };

  const handleEditElection = (election: any) => {
    console.log("Editing election with ID:", election.id);
    // Navigate to edit page with ID
    navigate(`/admin/elections/edit/${election.id}`);
  };

  const hasVotedInElection = (voterId: string, electionId: string) => {
    // Check if this voter has voted in this election using our mapping
    return votesMapping[electionId]?.has(voterId) || false;
  };

  const ElectionCard = ({ election }: { election: any }) => (
    <Card key={election.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">{election.title}</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {format(new Date(election.startDate), 'MMM d, yyyy')} - {format(new Date(election.endDate), 'MMM d, yyyy')}
            </CardDescription>
          </div>
          <Badge className={getBadgeColor(election.status)}>
            {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm mb-2 line-clamp-2">{election.description}</p>
        <div className="flex items-center text-sm text-gray-500">
          <FileText className="h-4 w-4 mr-1" />
          <span>{election.candidates.length} Candidates</span>
          <span className="mx-2">•</span>
          <span>{election.totalVotes} Votes</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-end space-x-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-1" />
              Voter Status
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Voter Participation: {election.title}</DialogTitle>
              <DialogDescription>
                Track which voters have cast their ballots in this election
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voter Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        No voters found
                      </TableCell>
                    </TableRow>
                  ) : (
                    voters.map(voter => (
                      <TableRow key={voter.id}>
                        <TableCell className="font-medium">{voter.name}</TableCell>
                        <TableCell>{voter.email}</TableCell>
                        <TableCell>
                          {hasVotedInElection(voter.id, election.id) ? (
                            <Badge className="bg-green-500">
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Voted
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-red-200 text-red-500">
                              <X className="h-3.5 w-3.5 mr-1" />
                              Not Voted
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {voter.verified ? (
                            <Badge variant="outline" className="border-green-200 text-green-500">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-yellow-200 text-yellow-500">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        <Button variant="outline" size="sm" onClick={() => handleEditElection(election)}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the "{election.title}" election and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(election.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {election.status === 'active' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm" 
                className="mr-2"
              >
                End Election
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End Election</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to end this election now? This action cannot be undone.
                  Voters will no longer be able to cast votes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => endElection(election.id)}>
                  End Election
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="py-8 text-center">
      <p className="text-gray-500">{message}</p>
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Election Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/admin/elections/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Election
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading elections data...</p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({elections.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingElections.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeElections.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedElections.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {elections.length === 0 ? (
              <EmptyState message="No elections found." />
            ) : (
              elections.map(election => <ElectionCard key={election.id} election={election} />)
            )}
          </TabsContent>
          
          <TabsContent value="upcoming">
            {upcomingElections.length === 0 ? (
              <EmptyState message="No upcoming elections found." />
            ) : (
              upcomingElections.map(election => <ElectionCard key={election.id} election={election} />)
            )}
          </TabsContent>
          
          <TabsContent value="active">
            {activeElections.length === 0 ? (
              <EmptyState message="No active elections found." />
            ) : (
              activeElections.map(election => <ElectionCard key={election.id} election={election} />)
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {completedElections.length === 0 ? (
              <EmptyState message="No completed elections found." />
            ) : (
              completedElections.map(election => <ElectionCard key={election.id} election={election} />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ElectionManagement;
