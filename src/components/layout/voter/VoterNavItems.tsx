
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  Github,
  HelpCircle,
  Settings, 
  User, 
  Vote
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoterNavItemsProps {
  onNavigate?: () => void;
}

export function VoterNavItems({ onNavigate }: VoterNavItemsProps) {
  const navItems = [
    { path: '/voter', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { path: '/voter/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { path: '/voter/elections', label: 'Elections', icon: <Vote className="w-4 h-4" /> },
    { path: '/voter/history', label: 'Voting History', icon: <Calendar className="w-4 h-4" /> },
    { path: '/voter/support', label: 'Help & Support', icon: <HelpCircle className="w-4 h-4" /> },
    { path: '/voter/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
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
          onClick={onNavigate}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
      
      <div className="py-2">
        <div className="h-px bg-border my-2"></div>
      </div>
      
      <NavLink
        to="/voter/developer"
        className={({ isActive }) =>
          cn(
            "nav-link",
            isActive ? "active" : "hover:bg-secondary"
          )
        }
        onClick={onNavigate}
      >
        <Github className="w-4 h-4" />
        <span>Developer</span>
      </NavLink>
    </nav>
  );
}
