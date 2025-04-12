
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export interface Candidate {
  id: string;
  name: string;
  party: string;
  bio: string;
  imageUrl: string;
  votes: number;
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
  rules: string[];
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
  createElection: (election: Omit<Election, 'id' | 'totalVotes'>) => Promise<void>;
  updateElection: (id: string, electionData: Partial<Election>) => Promise<void>;
  deleteElection: (id: string) => Promise<void>;
  castVote: (electionId: string, candidateId: string) => Promise<void>;
  getUserVoteForElection: (electionId: string) => Vote | undefined;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

export const useElection = (): ElectionContextType => {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error('useElection must be used within an ElectionProvider');
  }
  return context;
};

// Mock data for demonstration purposes
const mockElections: Election[] = [
  {
    id: '1',
    title: 'Presidential Election 2025',
    description: 'Vote for the next president of our nation.',
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-01-10T23:59:59.999Z',
    status: 'upcoming',
    candidates: [
      {
        id: '101',
        name: 'Jane Smith',
        party: 'Progressive Party',
        bio: 'Former governor with 10 years of experience.',
        imageUrl: '/placeholder.svg',
        votes: 0
      },
      {
        id: '102',
        name: 'John Doe',
        party: 'Conservative Party',
        bio: 'Business leader and entrepreneur.',
        imageUrl: '/placeholder.svg',
        votes: 0
      },
      {
        id: '103',
        name: 'Alice Johnson',
        party: 'Independent',
        bio: 'Civil rights activist and community leader.',
        imageUrl: '/placeholder.svg',
        votes: 0
      }
    ],
    totalVotes: 0,
    rules: [
      'You must be a registered voter to participate.',
      'You can only vote once in this election.',
      'Your vote is confidential and secure.',
      'Results will be announced within 24 hours of the election closing.'
    ]
  },
  {
    id: '2',
    title: 'City Council Election',
    description: 'Choose your local city council representative.',
    startDate: '2024-04-01T00:00:00.000Z',
    endDate: '2025-05-01T23:59:59.999Z',
    status: 'active',
    candidates: [
      {
        id: '201',
        name: 'Robert Brown',
        party: 'Community First',
        bio: 'Local business owner focused on economic development.',
        imageUrl: '/placeholder.svg',
        votes: 156
      },
      {
        id: '202',
        name: 'Lisa Wang',
        party: 'Green Future',
        bio: 'Environmental scientist and advocate for sustainability.',
        imageUrl: '/placeholder.svg',
        votes: 142
      }
    ],
    totalVotes: 298,
    rules: [
      'You must be a resident of the city to vote.',
      'Proof of residence may be requested.',
      'You can only vote for one candidate.'
    ]
  },
  {
    id: '3',
    title: 'School Board Election',
    description: 'Select representatives for the local school board.',
    startDate: '2024-03-01T00:00:00.000Z',
    endDate: '2024-03-15T23:59:59.999Z',
    status: 'completed',
    candidates: [
      {
        id: '301',
        name: 'Michael Johnson',
        party: 'Education First',
        bio: 'Former teacher with 15 years of experience.',
        imageUrl: '/placeholder.svg',
        votes: 523
      },
      {
        id: '302',
        name: 'Sarah Davis',
        party: 'Future Leaders',
        bio: 'Parent advocate and community volunteer.',
        imageUrl: '/placeholder.svg',
        votes: 489
      },
      {
        id: '303',
        name: 'David Martinez',
        party: 'Independent',
        bio: 'School administrator focused on budget efficiency.',
        imageUrl: '/placeholder.svg',
        votes: 367
      }
    ],
    totalVotes: 1379,
    rules: [
      'All parents and legal guardians of students are eligible to vote.',
      'Community members within the school district may also vote.',
      'You may vote for up to two candidates.'
    ]
  }
];

const mockVotes: Vote[] = [
  {
    id: '1001',
    userId: '2', // Voter user
    electionId: '3', // School Board Election
    candidateId: '301', // Michael Johnson
    timestamp: '2024-03-10T14:32:15.000Z'
  },
  {
    id: '1002',
    userId: '2', // Voter user
    electionId: '2', // City Council Election
    candidateId: '202', // Lisa Wang
    timestamp: '2024-04-15T09:45:22.000Z'
  }
];

export const ElectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elections, setElections] = useState<Election[]>(mockElections);
  const [userVotes, setUserVotes] = useState<Vote[]>(mockVotes);
  const { toast } = useToast();

  const getElection = (id: string) => {
    return elections.find(election => election.id === id);
  };

  const createElection = async (electionData: Omit<Election, 'id' | 'totalVotes'>) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newElection: Election = {
      ...electionData,
      id: String(Date.now()),
      totalVotes: 0,
    };
    
    setElections(prev => [...prev, newElection]);
    
    toast({
      title: "Election created",
      description: `"${newElection.title}" has been created successfully.`,
    });
  };

  const updateElection = async (id: string, electionData: Partial<Election>) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setElections(prev => 
      prev.map(election => 
        election.id === id ? { ...election, ...electionData } : election
      )
    );
    
    toast({
      title: "Election updated",
      description: "The election has been updated successfully.",
    });
  };

  const deleteElection = async (id: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find election to get title for toast message
    const electionToDelete = elections.find(e => e.id === id);
    
    setElections(prev => prev.filter(election => election.id !== id));
    
    toast({
      title: "Election deleted",
      description: electionToDelete 
        ? `"${electionToDelete.title}" has been deleted.` 
        : "The election has been deleted.",
    });
  };

  const castVote = async (electionId: string, candidateId: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    
    if (!userId) {
      toast({
        title: "Vote failed",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user already voted in this election
    const existingVote = userVotes.find(
      vote => vote.userId === userId && vote.electionId === electionId
    );
    
    if (existingVote) {
      toast({
        title: "Vote failed",
        description: "You have already voted in this election.",
        variant: "destructive",
      });
      return;
    }
    
    // Create new vote
    const newVote: Vote = {
      id: String(Date.now()),
      userId,
      electionId,
      candidateId,
      timestamp: new Date().toISOString(),
    };
    
    // Add to user votes
    setUserVotes(prev => [...prev, newVote]);
    
    // Update election candidate votes
    setElections(prev => 
      prev.map(election => {
        if (election.id === electionId) {
          const updatedCandidates = election.candidates.map(candidate => 
            candidate.id === candidateId 
              ? { ...candidate, votes: candidate.votes + 1 } 
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
  };

  const getUserVoteForElection = (electionId: string) => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    
    if (!userId) return undefined;
    
    return userVotes.find(
      vote => vote.userId === userId && vote.electionId === electionId
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
  };

  return <ElectionContext.Provider value={value}>{children}</ElectionContext.Provider>;
};
