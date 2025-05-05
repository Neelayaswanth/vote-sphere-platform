
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '../DarkModeToggle';
import { Menu } from 'lucide-react';

interface VoterHeaderProps {
  setIsSidebarOpen: (value: boolean) => void;
}

export function VoterHeader({ setIsSidebarOpen }: VoterHeaderProps) {
  return (
    <header className="lg:hidden bg-card border-b h-16 flex items-center px-4 sticky top-0 z-30">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsSidebarOpen(true)}
        className="mr-2"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      <div className="flex-1 flex justify-center">
        <h1 className="text-lg font-semibold">VoteSphere</h1>
      </div>
      <DarkModeToggle />
    </header>
  );
}
