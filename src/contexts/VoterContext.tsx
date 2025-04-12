
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { UserRole } from './AuthContext';

export interface Voter {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  profileImage?: string;
  registeredDate: string;
  lastActive: string;
  status: 'active' | 'blocked';
  votingHistory: {
    electionId: string;
    votedAt: string;
  }[];
}

interface VoterContextType {
  voters: Voter[];
  getVoter: (id: string) => Voter | undefined;
  updateVoterStatus: (id: string, status: 'active' | 'blocked') => Promise<void>;
  updateVoterVerification: (id: string, verified: boolean) => Promise<void>;
  updateVoterRole: (id: string, role: UserRole) => Promise<void>;
  searchVoters: (query: string) => Voter[];
  filterVoters: (filters: { role?: UserRole; verified?: boolean; status?: 'active' | 'blocked' }) => Voter[];
}

const VoterContext = createContext<VoterContextType | undefined>(undefined);

export const useVoter = (): VoterContextType => {
  const context = useContext(VoterContext);
  if (!context) {
    throw new Error('useVoter must be used within a VoterProvider');
  }
  return context;
};

// Mock data for demonstration purposes
const mockVoters: Voter[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    verified: true,
    profileImage: '/placeholder.svg',
    registeredDate: '2024-01-15T08:30:00.000Z',
    lastActive: '2024-04-12T10:45:22.000Z',
    status: 'active',
    votingHistory: []
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'voter@example.com',
    role: 'voter',
    verified: true,
    profileImage: '/placeholder.svg',
    registeredDate: '2024-02-10T14:20:00.000Z',
    lastActive: '2024-04-11T16:35:42.000Z',
    status: 'active',
    votingHistory: [
      {
        electionId: '2',
        votedAt: '2024-04-10T09:45:22.000Z'
      },
      {
        electionId: '3',
        votedAt: '2024-03-10T14:32:15.000Z'
      }
    ]
  },
  {
    id: '3',
    name: 'Maria Garcia',
    email: 'unverified@example.com',
    role: 'voter',
    verified: false,
    profileImage: '/placeholder.svg',
    registeredDate: '2024-03-05T11:10:00.000Z',
    lastActive: '2024-03-05T11:15:30.000Z',
    status: 'active',
    votingHistory: []
  },
  {
    id: '4',
    name: 'James Johnson',
    email: 'james@example.com',
    role: 'voter',
    verified: true,
    profileImage: '/placeholder.svg',
    registeredDate: '2024-01-20T09:00:00.000Z',
    lastActive: '2024-04-09T15:20:10.000Z',
    status: 'active',
    votingHistory: [
      {
        electionId: '3',
        votedAt: '2024-03-12T10:15:45.000Z'
      }
    ]
  },
  {
    id: '5',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    role: 'voter',
    verified: true,
    profileImage: '/placeholder.svg',
    registeredDate: '2024-02-15T13:45:00.000Z',
    lastActive: '2024-03-20T14:30:25.000Z',
    status: 'blocked',
    votingHistory: []
  },
  {
    id: '6',
    name: 'Michael Brown',
    email: 'michael@example.com',
    role: 'voter',
    verified: true,
    profileImage: '/placeholder.svg',
    registeredDate: '2024-01-10T10:30:00.000Z',
    lastActive: '2024-04-08T11:55:40.000Z',
    status: 'active',
    votingHistory: [
      {
        electionId: '2',
        votedAt: '2024-04-05T13:25:18.000Z'
      },
      {
        electionId: '3',
        votedAt: '2024-03-08T16:42:30.000Z'
      }
    ]
  }
];

export const VoterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [voters, setVoters] = useState<Voter[]>(mockVoters);
  const { toast } = useToast();

  const getVoter = (id: string) => {
    return voters.find(voter => voter.id === id);
  };

  const updateVoterStatus = async (id: string, status: 'active' | 'blocked') => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setVoters(prev => 
      prev.map(voter => 
        voter.id === id ? { ...voter, status } : voter
      )
    );
    
    const action = status === 'active' ? 'activated' : 'blocked';
    const voterName = voters.find(v => v.id === id)?.name || 'Voter';
    
    toast({
      title: `Voter ${action}`,
      description: `${voterName} has been ${action} successfully.`,
    });
  };

  const updateVoterVerification = async (id: string, verified: boolean) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setVoters(prev => 
      prev.map(voter => 
        voter.id === id ? { ...voter, verified } : voter
      )
    );
    
    const action = verified ? 'verified' : 'unverified';
    const voterName = voters.find(v => v.id === id)?.name || 'Voter';
    
    toast({
      title: `Voter ${action}`,
      description: `${voterName} has been ${action} successfully.`,
    });
  };

  const updateVoterRole = async (id: string, role: UserRole) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setVoters(prev => 
      prev.map(voter => 
        voter.id === id ? { ...voter, role } : voter
      )
    );
    
    const roleName = role === 'admin' ? 'Administrator' : 'Voter';
    const voterName = voters.find(v => v.id === id)?.name || 'User';
    
    toast({
      title: "Role updated",
      description: `${voterName}'s role has been updated to ${roleName}.`,
    });
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
  };

  return <VoterContext.Provider value={value}>{children}</VoterContext.Provider>;
};
