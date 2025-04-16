
import { supabase } from '@/integrations/supabase/client';

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  totalVotes: number;
  candidates: Candidate[];
}

export interface Candidate {
  id?: string;
  name: string;
  description: string;
}

export const createElection = async (electionData: Omit<Election, 'id' | 'candidates' | 'status' | 'totalVotes'> & { candidates: Omit<Candidate, 'id'>[] }) => {
  try {
    // Insert election data
    const { data: electionResult, error: electionError } = await supabase
      .from('elections')
      .insert({
        title: electionData.title,
        description: electionData.description,
        start_date: electionData.startDate,
        end_date: electionData.endDate,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (electionError) {
      console.error('Error creating election:', electionError);
      throw electionError;
    }

    if (!electionResult) {
      throw new Error('Failed to create election');
    }

    // Insert candidates
    const candidatesWithElectionId = electionData.candidates.map(candidate => ({
      name: candidate.name,
      description: candidate.description,
      election_id: electionResult.id
    }));

    const { data: candidatesResult, error: candidatesError } = await supabase
      .from('candidates')
      .insert(candidatesWithElectionId)
      .select();

    if (candidatesError) {
      console.error('Error creating candidates:', candidatesError);
      throw candidatesError;
    }

    return {
      ...electionResult,
      candidates: candidatesResult || []
    };
  } catch (error) {
    console.error('Error in createElection:', error);
    throw error;
  }
};

export const updateElection = async (id: string, electionData: Partial<Election>) => {
  try {
    // Update election data
    const { data: electionResult, error: electionError } = await supabase
      .from('elections')
      .update({
        title: electionData.title,
        description: electionData.description,
        start_date: electionData.startDate,
        end_date: electionData.endDate,
      })
      .eq('id', id)
      .select()
      .single();

    if (electionError) {
      console.error('Error updating election:', electionError);
      throw electionError;
    }

    // Handle candidates if provided
    if (electionData.candidates && electionData.candidates.length > 0) {
      // Delete existing candidates
      const { error: deleteError } = await supabase
        .from('candidates')
        .delete()
        .eq('election_id', id);

      if (deleteError) {
        console.error('Error deleting existing candidates:', deleteError);
        throw deleteError;
      }

      // Insert new candidates
      const candidatesWithElectionId = electionData.candidates.map(candidate => ({
        name: candidate.name,
        description: candidate.description,
        election_id: id
      }));

      const { data: candidatesResult, error: candidatesError } = await supabase
        .from('candidates')
        .insert(candidatesWithElectionId)
        .select();

      if (candidatesError) {
        console.error('Error updating candidates:', candidatesError);
        throw candidatesError;
      }
    }

    return electionResult;
  } catch (error) {
    console.error('Error in updateElection:', error);
    throw error;
  }
};

export const getElectionById = async (id: string): Promise<Election | null> => {
  try {
    // Get election data
    const { data: election, error: electionError } = await supabase
      .from('elections')
      .select('*')
      .eq('id', id)
      .single();

    if (electionError) {
      console.error('Error fetching election:', electionError);
      throw electionError;
    }

    // Get candidates for this election
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .eq('election_id', id);

    if (candidatesError) {
      console.error('Error fetching candidates:', candidatesError);
      throw candidatesError;
    }

    // Get vote count for this election
    const { count, error: countError } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true })
      .eq('election_id', id);

    if (countError) {
      console.error('Error counting votes:', countError);
      throw countError;
    }

    // Determine status based on dates
    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);
    
    let status: 'upcoming' | 'active' | 'completed';
    if (now < startDate) {
      status = 'upcoming';
    } else if (now > endDate || !election.active) {
      status = 'completed';
    } else {
      status = 'active';
    }

    return {
      id: election.id,
      title: election.title,
      description: election.description,
      startDate: election.start_date,
      endDate: election.end_date,
      status,
      totalVotes: count || 0,
      candidates: candidates || []
    };
  } catch (error) {
    console.error('Error in getElectionById:', error);
    return null;
  }
};
