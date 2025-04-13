
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { UserRole, UserStatus } from './AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './AuthContext';

export interface Voter {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  profileImage?: string;
  registeredDate: string;
  lastActive: string;
  status: UserStatus;
  votingHistory: {
    electionId: string;
    votedAt: string;
  }[];
}

interface VoterContextType {
  voters: Voter[];
  getVoter: (id: string) => Voter | undefined;
  updateVoterStatus: (id: string, status: UserStatus) => Promise<void>;
  updateVoterVerification: (id: string, verified: boolean) => Promise<void>;
  updateVoterRole: (id: string, role: UserRole) => Promise<void>;
  searchVoters: (query: string) => Voter[];
  filterVoters: (filters: { role?: UserRole; verified?: boolean; status?: UserStatus }) => Voter[];
  loading: boolean;
}

const VoterContext = createContext<VoterContextType | undefined>(undefined);

export const useVoter = (): VoterContextType => {
  const context = useContext(VoterContext);
  if (!context) {
    throw new Error('useVoter must be used within a VoterProvider');
  }
  return context;
};

export const VoterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Function to get default status value
  const getDefaultStatus = (profileStatus: string | undefined): UserStatus => {
    if (profileStatus === 'active' || profileStatus === 'blocked') {
      return profileStatus as UserStatus;
    }
    return 'active';
  };

  // Function to fetch all voter data
  const fetchVoters = async () => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    console.log("Fetching voters data...");
    setLoading(true);
    
    try {
      // Fetch all user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        console.log("No profiles found");
        setVoters([]);
        setLoading(false);
        return;
      }

      console.log(`Found ${profiles.length} profiles`);

      // For each profile, get their voting history
      const votersWithHistory = await Promise.all(
        profiles.map(async (profile) => {
          // Get voting history
          const { data: votes, error: votesError } = await supabase
            .from('votes')
            .select('election_id, created_at')
            .eq('voter_id', profile.id);
            
          if (votesError) {
            console.error(`Error fetching votes for user ${profile.id}:`, votesError);
            return null;
          }

          // Format voting history
          const votingHistory = votes ? votes.map(vote => ({
            electionId: vote.election_id,
            votedAt: vote.created_at
          })) : [];

          // Handle status property (it may not exist in older profiles)
          const status = getDefaultStatus(profile.status);

          return {
            id: profile.id,
            name: profile.name,
            email: "", // We don't have this in profiles
            role: profile.role as UserRole,
            verified: profile.verified,
            profileImage: profile.profile_image,
            registeredDate: profile.created_at,
            lastActive: profile.updated_at,
            status,
            votingHistory
          };
        })
      );

      const filteredVoters = votersWithHistory.filter(v => v !== null) as Voter[];
      console.log(`Processed ${filteredVoters.length} voter profiles with history`);
      setVoters(filteredVoters);
    } catch (error: any) {
      console.error('Error fetching voters:', error);
      toast({
        title: "Error",
        description: `Failed to load voters: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchVoters();
      
      // Set up realtime subscriptions for profiles and votes
      const profilesChannel = supabase
        .channel('profiles-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          () => {
            console.log('Profiles table changed, refreshing data...');
            fetchVoters();
          }
        )
        .subscribe();
        
      const votesChannel = supabase
        .channel('votes-for-voters')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'votes' },
          () => {
            console.log('Votes table changed, refreshing data...');
            fetchVoters();
          }
        )
        .subscribe();
  
      return () => {
        supabase.removeChannel(profilesChannel);
        supabase.removeChannel(votesChannel);
      };
    } else {
      setLoading(false);
    }
  }, [user]);

  const getVoter = (id: string) => {
    return voters.find(voter => voter.id === id);
  };

  const updateVoterStatus = async (id: string, status: 'active' | 'blocked') => {
    if (!user || user.role !== 'admin') {
      toast({
        title: "Permission denied",
        description: "You must be an admin to perform this action.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Update status in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setVoters(prev => 
        prev.map(voter => 
          voter.id === id ? { ...voter, status } : voter
        )
      );
      
      // Log the activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: `voter_${status}`,
        details: { target_user_id: id }
      });
      
      const action = status === 'active' ? 'activated' : 'blocked';
      const voterName = voters.find(v => v.id === id)?.name || 'Voter';
      
      toast({
        title: `Voter ${action}`,
        description: `${voterName} has been ${action} successfully.`,
      });
    } catch (error: any) {
      console.error('Error updating voter status:', error);
      toast({
        title: "Error",
        description: `Failed to update voter status: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const updateVoterVerification = async (id: string, verified: boolean) => {
    if (!user || user.role !== 'admin') {
      toast({
        title: "Permission denied",
        description: "You must be an admin to perform this action.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Update the verified field in profiles
      const { error } = await supabase
        .from('profiles')
        .update({ verified })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setVoters(prev => 
        prev.map(voter => 
          voter.id === id ? { ...voter, verified } : voter
        )
      );
      
      // Log the activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: verified ? 'verify_voter' : 'unverify_voter',
        details: { target_user_id: id }
      });
      
      const action = verified ? 'verified' : 'unverified';
      const voterName = voters.find(v => v.id === id)?.name || 'Voter';
      
      toast({
        title: `Voter ${action}`,
        description: `${voterName} has been ${action} successfully.`,
      });
    } catch (error: any) {
      console.error('Error updating voter verification:', error);
      toast({
        title: "Error",
        description: `Failed to update voter verification: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const updateVoterRole = async (id: string, role: UserRole) => {
    if (!user || user.role !== 'admin') {
      toast({
        title: "Permission denied",
        description: "You must be an admin to perform this action.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (!role) {
        throw new Error("Invalid role specified");
      }
      
      // Update the role in profiles
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setVoters(prev => 
        prev.map(voter => 
          voter.id === id ? { ...voter, role } : voter
        )
      );
      
      // Log the activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'update_role',
        details: { target_user_id: id, new_role: role }
      });
      
      const roleName = role === 'admin' ? 'Administrator' : 'Voter';
      const voterName = voters.find(v => v.id === id)?.name || 'User';
      
      toast({
        title: "Role updated",
        description: `${voterName}'s role has been updated to ${roleName}.`,
      });
    } catch (error: any) {
      console.error('Error updating voter role:', error);
      toast({
        title: "Error",
        description: `Failed to update voter role: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const searchVoters = (query: string) => {
    if (!query) return voters;
    
    const lowercaseQuery = query.toLowerCase();
    
    return voters.filter(
      voter => 
        voter.name.toLowerCase().includes(lowercaseQuery) ||
        voter.email.toLowerCase().includes(lowercaseQuery)
    );
  };

  const filterVoters = (filters: { role?: UserRole; verified?: boolean; status?: 'active' | 'blocked' }) => {
    return voters.filter(voter => {
      let matches = true;
      
      if (filters.role !== undefined && voter.role !== filters.role) {
        matches = false;
      }
      
      if (filters.verified !== undefined && voter.verified !== filters.verified) {
        matches = false;
      }
      
      if (filters.status !== undefined && voter.status !== filters.status) {
        matches = false;
      }
      
      return matches;
    });
  };

  const value = {
    voters,
    getVoter,
    updateVoterStatus,
    updateVoterVerification,
    updateVoterRole,
    searchVoters,
    filterVoters,
    loading
  };

  return <VoterContext.Provider value={value}>{children}</VoterContext.Provider>;
};
