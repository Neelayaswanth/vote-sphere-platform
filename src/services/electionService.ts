
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
    // Validate required fields
    if (!electionData.title || electionData.title.trim() === '') {
      throw new Error('Election title is required');
    }
    
    if (!electionData.startDate || !electionData.endDate) {
      throw new Error('Start date and end date are required');
    }

    if (new Date(electionData.endDate) <= new Date(electionData.startDate)) {
      throw new Error('End date must be after start date');
    }

    // Validate candidates
    if (!electionData.candidates || electionData.candidates.length === 0) {
      throw new Error('At least one candidate is required');
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be logged in to create an election');
    }

    console.log('Creating election with user:', user.id);
    console.log('Election data:', {
      title: electionData.title,
      description: electionData.description,
      startDate: electionData.startDate,
      endDate: electionData.endDate,
      candidatesCount: electionData.candidates.length
    });

    // Insert election data
    const { data: electionResult, error: electionError } = await supabase
      .from('elections')
      .insert({
        title: electionData.title.trim(),
        description: electionData.description || null,
        start_date: electionData.startDate,
        end_date: electionData.endDate,
        created_by: user.id,
        active: true
      })
      .select()
      .single();

    if (electionError) {
      console.error('Error creating election:', electionError);
      throw new Error(electionError.message || 'Failed to create election');
    }

    if (!electionResult) {
      throw new Error('Failed to create election - no data returned');
    }

    console.log('Election created successfully:', electionResult.id);

    // Filter out empty candidates and insert them
    const validCandidates = electionData.candidates.filter(c => c.name && c.name.trim() !== '');
    
    if (validCandidates.length === 0) {
      // If no valid candidates, delete the election we just created
      await supabase.from('elections').delete().eq('id', electionResult.id);
      throw new Error('At least one valid candidate with a name is required');
    }

    const candidatesWithElectionId = validCandidates.map(candidate => ({
      name: candidate.name.trim(),
      description: candidate.description?.trim() || null,
      election_id: electionResult.id
    }));

    console.log('Inserting candidates:', candidatesWithElectionId);

    const { data: candidatesResult, error: candidatesError } = await supabase
      .from('candidates')
      .insert(candidatesWithElectionId)
      .select();

    if (candidatesError) {
      console.error('Error creating candidates:', candidatesError);
      // Delete the election if candidates insertion fails
      await supabase.from('elections').delete().eq('id', electionResult.id);
      throw new Error(candidatesError.message || 'Failed to create candidates');
    }

    console.log('Election and candidates created successfully');

    return {
      ...electionResult,
      candidates: candidatesResult || []
    };
  } catch (error: any) {
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
