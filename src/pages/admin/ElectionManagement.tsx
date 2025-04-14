import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PlusCircle, Edit, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useElection } from '@/contexts/ElectionContext';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ElectionManagement = () => {
  const { elections, deleteElection, loading, endElection } = useElection();
  const [refreshing, setRefreshing] = useState(false);
  const [electionToEnd, setElectionToEnd] = useState<string | null>(null);

  const upcomingElections = elections.filter(election => election.status === 'upcoming');
  const activeElections = elections.filter(election => election.status === 'active');
  const completedElections = elections.filter(election => election.status === 'completed');

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
        <Button variant="outline" size="sm" asChild>
          <Link to={`/admin/elections/edit/${election.id}`}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
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
