
import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sidebar, 
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar";
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
  Info,
  FileText
} from "lucide-react";
import SupportDialog from "@/components/support/SupportDialog";

export default function VoterLayout() {
  const { user, logout, isLoading } = useAuth();
  const { toast } = useToast();
  const { unreadMessagesCount } = useSupport();
  
  // Check if user is authenticated and is a voter
  useEffect(() => {
    if (!isLoading && user && user.role !== 'voter') {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access voter pages",
      });
    }
  }, [user, isLoading, toast]);
  
  // Handle loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect if not authenticated or not a voter
  if (!user || user.role !== 'voter') {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <SidebarHeader>
          <div className="px-3 py-2">
            <h2 className="text-lg font-semibold">E-Voting Portal</h2>
            <p className="text-xs text-muted-foreground">Voter Dashboard</p>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link to="/voter">
                    <Home size={20} />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="My Profile">
                  <Link to="/voter/profile">
                    <User size={20} />
                    <span>My Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Elections">
                  <Link to="/voter/elections">
                    <Vote size={20} />
                    <span>Elections</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Voting History">
                  <Link to="/voter/history">
                    <History size={20} />
                    <span>Voting History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Content">
                  <Link to="/voter/content">
                    <FileText size={20} />
                    <span>Content</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel>Support</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Help & Support">
                  <Link to="/voter/support">
                    <MessageSquare size={20} />
                    <span>Help & Support</span>
                    {unreadMessagesCount > 0 && (
                      <SidebarMenuBadge>{unreadMessagesCount}</SidebarMenuBadge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Developer Contact">
                  <Link to="/voter/developer">
                    <Info size={20} />
                    <span>Developer Contact</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link to="/voter/settings">
                  <Settings size={20} />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Logout" 
                onClick={() => {
                  logout();
                  toast({ title: "Logged out", description: "You have been logged out successfully" });
                }}
              >
                <LogOut size={20} />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
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
