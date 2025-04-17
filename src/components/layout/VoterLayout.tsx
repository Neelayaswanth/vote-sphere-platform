
import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarSection } from "@/components/ui/sidebar";
import { SidebarItem } from "@/components/ui/sidebar";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useSupport } from "@/contexts/SupportContext";
import { 
  Home, 
  User, 
  Vote, 
  History, 
  MessageSquare, 
  Settings,
  LogOut,
  Info
} from "lucide-react";
import SupportDialog from "@/components/support/SupportDialog";

export default function VoterLayout() {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const { unreadMessagesCount } = useSupport();
  
  // Check if user is authenticated and is a voter
  useEffect(() => {
    if (!loading && user && user.role !== 'voter') {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access voter pages",
      });
    }
  }, [user, loading, toast]);
  
  // Handle loading state
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect if not authenticated or not a voter
  if (!user || user.role !== 'voter') {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <SidebarSection>
          <SidebarItem icon={<Home size={20} />} title="Dashboard" as={Link} to="/voter" />
          <SidebarItem icon={<User size={20} />} title="My Profile" as={Link} to="/voter/profile" />
          <SidebarItem icon={<Vote size={20} />} title="Elections" as={Link} to="/voter/elections" />
          <SidebarItem icon={<History size={20} />} title="Voting History" as={Link} to="/voter/history" />
        </SidebarSection>
        
        <SidebarSection title="Support">
          <SidebarItem 
            icon={<MessageSquare size={20} />} 
            title="Help & Support" 
            as={Link} 
            to="/voter/support"
            notification={unreadMessagesCount > 0 ? unreadMessagesCount : undefined}
          />
          <SidebarItem 
            icon={<Info size={20} />} 
            title="Developer Contact" 
            as={Link} 
            to="/voter/developer" 
          />
        </SidebarSection>
        
        <SidebarSection>
          <SidebarItem icon={<Settings size={20} />} title="Settings" as={Link} to="/voter/settings" />
          <SidebarItem
            icon={<LogOut size={20} />}
            title="Logout"
            onClick={() => {
              signOut();
              toast({ title: "Logged out", description: "You have been logged out successfully" });
            }}
          />
        </SidebarSection>
      </Sidebar>
      
      <div className="flex-1">
        <div className="p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </div>
      
      <div className="fixed bottom-4 right-4 md:hidden">
        <SupportDialog />
      </div>
    </div>
  );
}
