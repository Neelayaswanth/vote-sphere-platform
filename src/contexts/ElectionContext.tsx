
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './AuthContext';

export interface Candidate {
  id: string;
  name: string;
  party?: string;
  bio?: string;
  imageUrl?: string;
  votes?: number;
  description?: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  candidates: Candidate[];
  totalVotes: number;
  rules?: string[];
}

export interface Vote {
  id: string;
  userId: string;
  electionId: string;
  candidateId: string;
  timestamp: string;
}

interface ElectionContextType {
  elections: Election[];
  userVotes: Vote[];
  getElection: (id: string) => Election | undefined;
  createElection: (election: Omit<Election, 'id' | 'totalVotes' | 'status' | 'candidates'>) => Promise<void>;
  updateElection: (id: string, electionData: Partial<Election>) => Promise<void>;
  deleteElection: (id: string) => Promise<void>;
  castVote: (electionId: string, candidateId: string) => Promise<void>;
  getUserVoteForElection: (electionId: string) => Vote | undefined;
  loading: boolean;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

export const useElection = (): ElectionContextType => {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error('useElection must be used within an ElectionProvider');
  }
  return context;
};

export const ElectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elections, setElections] = useState<Election[]>([]);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch elections and votes data
  useEffect(() => {
    const fetchElections = async () => {
      setLoading(true);
      try {
        // Fetch all elections
        const { data: electionsData, error: electionsError } = await supabase
          .from('elections')
          .select('*');

        if (electionsError) {
          throw electionsError;
        }

        // For each election, fetch its candidates
        const electionsWithCandidates = await Promise.all(
          electionsData.map(async (election) => {
            const { data: candidatesData, error: candidatesError } = await supabase
              .from('candidates')
              .select('*')
              .eq('election_id', election.id);

            if (candidatesError) {
              console.error('Error fetching candidates:', candidatesError);
              return null;
            }

            // Get total votes for this election
            const { count, error: countError } = await supabase
              .from('votes')
              .select('*', { count: 'exact', head: true })
              .eq('election_id', election.id);

            if (countError) {
              console.error('Error counting votes:', countError);
            }

            // Calculate each candidate's votes
            const candidatesWithVotes = await Promise.all(
              candidatesData.map(async (candidate) => {
                const { count: candidateVotes, error: voteCountError } = await supabase
                  .from('votes')
                  .select('*', { count: 'exact', head: true })
                  .eq('candidate_id', candidate.id);

                if (voteCountError) {
                  console.error('Error counting candidate votes:', voteCountError);
                }

                return {
                  id: candidate.id,
                  name: candidate.name,
                  description: candidate.description,
                  imageUrl: candidate.image_url,
                  votes: candidateVotes || 0
                };
              })
            );

            // Determine election status based on dates
            const now = new Date();
            const startDate = new Date(election.start_date);
            const endDate = new Date(election.end_date);

            let status: 'upcoming' | 'active' | 'completed';
            if (now < startDate) {
              status = 'upcoming';
            } else if (now > endDate) {
              status = 'completed';
            } else {
              status = 'active';
            }

            return {
              id: election.id,
              title: election.title,
              description: election.description || '',
              startDate: election.start_date,
              endDate: election.end_date,
              status,
              candidates: candidatesWithVotes,
              totalVotes: count || 0,
              rules: [] // You might want to add this field to your elections table
            };
          })
        );

        const validElections = electionsWithCandidates.filter(election => election !== null) as Election[];
        setElections(validElections);

        // If user is authenticated, fetch their votes
        if (user) {
          const { data: votesData, error: votesError } = await supabase
            .from('votes')
            .select('*')
            .eq('voter_id', user.id);

          if (votesError) {
            throw votesError;
          }

          const formattedVotes = votesData.map(vote => ({
            id: vote.id,
            userId: vote.voter_id,
            electionId: vote.election_id,
            candidateId: vote.candidate_id,
            timestamp: vote.created_at
          }));

          setUserVotes(formattedVotes);
        }

      } catch (error: any) {
        console.error('Error fetching elections data:', error.message);
        toast({
          title: "Error",
          description: "Failed to load elections data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
    
    // Setup realtime subscription for votes
    const votesChannel = supabase
      .channel('votes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => {
          // Refresh elections data when votes change
          fetchElections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votesChannel);
    };
  }, [user, toast]);

  const getElection = (id: string) => {
    return elections.find(election => election.id === id);
  };

  const createElection = async (electionData: Omit<Election, 'id' | 'totalVotes' | 'status' | 'candidates'>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create an election.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Insert the election record
      const { data: newElection, error: electionError } = await supabase
        .from('elections')
        .insert({
          title: electionData.title,
          description: electionData.description,
          start_date: electionData.startDate,
          end_date: electionData.endDate,
          created_by: user.id
        })
        .select()
        .single();

      if (electionError) throw electionError;

      // Log the activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'create_election',
        details: { election_id: newElection.id, title: electionData.title }
      });

      toast({
        title: "Success",
        description: `Election "${electionData.title}" has been created.`,
      });

      // Refresh the elections list
      const { data, error } = await supabase
        .from('elections')
        .select('*');

      if (!error && data) {
        // Process the elections data as before
        // This is simplified - you should reuse the logic from the useEffect
        const processedElections = data.map(election => ({
          id: election.id,
          title: election.title,
          description: election.description || '',
          startDate: election.start_date,
          endDate: election.end_date,
          status: 'upcoming' as const, // Simplification
          candidates: [],
          totalVotes: 0
        }));

        setElections(prev => [...processedElections]);
      }

    } catch (error: any) {
      console.error('Error creating election:', error);
      toast({
        title: "Error",
        description: `Failed to create election: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const updateElection = async (id: string, electionData: Partial<Election>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update an election.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Map from our frontend model to database model
      const dbData: any = {};
      
      if (electionData.title) dbData.title = electionData.title;
      if (electionData.description) dbData.description = electionData.description;
      if (electionData.startDate) dbData.start_date = electionData.startDate;
      if (electionData.endDate) dbData.end_date = electionData.endDate;

      const { error } = await supabase
        .from('elections')
        .update(dbData)
        .eq('id', id);

      if (error) throw error;

      // Log the activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'update_election',
        details: { election_id: id }
      });

      // Update the local state (simplified)
      setElections(prev => 
        prev.map(election => 
          election.id === id 
            ? { ...election, ...electionData } 
            : election
        )
      );

      toast({
        title: "Success",
        description: "Election has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating election:', error);
      toast({
        title: "Error",
        description: `Failed to update election: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const deleteElection = async (id: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete an election.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get election title before deletion
      const election = elections.find(e => e.id === id);
      
      const { error } = await supabase
        .from('elections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log the activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'delete_election',
        details: { election_id: id, title: election?.title }
      });

      // Update local state
      setElections(prev => prev.filter(election => election.id !== id));

      toast({
        title: "Election deleted",
        description: election 
          ? `"${election.title}" has been deleted.` 
          : "The election has been deleted.",
      });
    } catch (error: any) {
      console.error('Error deleting election:', error);
      toast({
        title: "Error",
        description: `Failed to delete election: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const castVote = async (electionId: string, candidateId: string) => {
    if (!user) {
      toast({
        title: "Vote failed",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Check if user already voted in this election
      const existingVote = userVotes.find(
        vote => vote.userId === user.id && vote.electionId === electionId
      );
      
      if (existingVote) {
        toast({
          title: "Vote failed",
          description: "You have already voted in this election.",
          variant: "destructive",
        });
        return;
      }
      
      // Cast vote in database
      const { data, error } = await supabase
        .from('votes')
        .insert({
          voter_id: user.id,
          election_id: electionId,
          candidate_id: candidateId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'cast_vote',
        details: { election_id: electionId }
      });
      
      // Add to local state
      const newVote: Vote = {
        id: data.id,
        userId: user.id,
        electionId: electionId,
        candidateId: candidateId,
        timestamp: data.created_at
      };
      
      setUserVotes(prev => [...prev, newVote]);
      
      // Update election state (simplified)
      setElections(prev => 
        prev.map(election => {
          if (election.id === electionId) {
            const updatedCandidates = election.candidates.map(candidate => 
              candidate.id === candidateId 
                ? { ...candidate, votes: (candidate.votes || 0) + 1 } 
                : candidate
            );
            
            return {
              ...election,
              candidates: updatedCandidates,
              totalVotes: election.totalVotes + 1,
            };
          }
          return election;
        })
      );
      
      toast({
        title: "Vote successful",
        description: "Your vote has been recorded successfully.",
      });
    } catch (error: any) {
      console.error('Error casting vote:', error);
      toast({
        title: "Vote failed",
        description: `${error.message}`,
        variant: "destructive",
      });
    }
  };

  const getUserVoteForElection = (electionId: string) => {
    if (!user) return undefined;
    
    return userVotes.find(
      vote => vote.userId === user.id && vote.electionId === electionId
    );
  };

  const value = {
    elections,
    userVotes,
    getElection,
    createElection,
    updateElection,
    deleteElection,
    castVote,
    getUserVoteForElection,
    loading
  };

  return <ElectionContext.Provider value={value}>{children}</ElectionContext.Provider>;
};
