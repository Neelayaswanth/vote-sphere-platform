
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DarkModeToggle } from './DarkModeToggle';
import { Button } from '@/components/ui/button';
import { BarChart3, Calendar, LogOut, Menu, Settings, User, Vote, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function VoterLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    { path: '/voter', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { path: '/voter/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { path: '/voter/elections', label: 'Elections', icon: <Vote className="w-4 h-4" /> },
    { path: '/voter/history', label: 'Voting History', icon: <Calendar className="w-4 h-4" /> },
    { path: '/voter/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden bg-card border-b h-16 flex items-center px-4 sticky top-0 z-30">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for desktop */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-card">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">VoteSphere</h1>
          </div>
          
          <div className="flex-1 overflow-auto py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/voter'}
                  className={({ isActive }) =>
                    cn(
                      "nav-link",
                      isActive ? "active" : "hover:bg-secondary"
                    )
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
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

        {/* Mobile sidebar (off-canvas) */}
        <div
          className={`fixed inset-0 z-40 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:hidden transition-transform duration-300 ease-in-out`}
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
          
          <aside className="relative w-64 max-w-[80%] h-full bg-card shadow-xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h1 className="text-xl font-bold">VoteSphere</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto py-4">
              <nav className="space-y-1 px-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/voter'}
                    className={({ isActive }) =>
                      cn(
                        "nav-link",
                        isActive ? "active" : "hover:bg-secondary"
                      )
                    }
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
            
            <div className="p-4 border-t flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
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

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="voting-container py-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
