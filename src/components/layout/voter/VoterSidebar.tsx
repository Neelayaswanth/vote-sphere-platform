
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DarkModeToggle } from '../DarkModeToggle';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  X 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { VoterNavItems } from './VoterNavItems';

interface VoterSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  isMobile?: boolean;
}

export function VoterSidebar({ isSidebarOpen, setIsSidebarOpen, isMobile = false }: VoterSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <>
      {isMobile && (
        <div
          className={`fixed inset-0 z-40 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:hidden transition-transform duration-300 ease-in-out`}
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
          
          <aside className="relative w-64 max-w-[80%] h-full bg-card shadow-xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/bf1b1ff3-12c0-47bd-a774-a5197f3a9004.png"
                  alt="VoteSphere Logo"
                  className="h-6 w-6 mr-2"
                />
                <h1 className="text-xl font-bold">VoteSphere</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto py-4">
              <VoterNavItems onNavigate={() => setIsSidebarOpen(false)} />
            </div>
            
            <div className="p-4 border-t flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-sm flex-1">
                <p className="font-medium">{user?.name}</p>
                <p className="text-muted-foreground">Voter</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </aside>
        </div>
      )}

      {!isMobile && (
        <aside className="hidden lg:flex w-64 flex-col border-r bg-card">
          <div className="p-4 border-b flex items-center">
            <img 
              src="/lovable-uploads/bf1b1ff3-12c0-47bd-a774-a5197f3a9004.png"
              alt="VoteSphere Logo"
              className="h-6 w-6 mr-2" 
            />
            <h1 className="text-xl font-bold">VoteSphere</h1>
          </div>
          
          <div className="flex-1 overflow-auto py-4">
            <VoterNavItems />
          </div>
          
          <div className="p-4 border-t flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-muted-foreground">Voter</p>
              </div>
            </div>
            <div className="flex items-center">
              <DarkModeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="ml-1"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
