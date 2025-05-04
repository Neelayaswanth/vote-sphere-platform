
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isLoading) return;

    console.log("Auth state in Index:", { user, isLoading });

    if (!user) {
      // If no user is authenticated, redirect to auth page
      navigate("/auth");
    } else if (user.role === 'admin') {
      // If user is admin, redirect to admin dashboard
      navigate('/admin');
      
      toast({
        title: "Admin Dashboard",
        description: "Welcome to the admin dashboard",
      });
    } else {
      // Otherwise, redirect to voter dashboard
      navigate('/voter');
      
      toast({
        title: "Voter Dashboard",
        description: "Welcome to your dashboard",
      });
    }
  }, [user, isLoading, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <span className="text-lg font-medium">Loading your dashboard...</span>
    </div>
  );
};

export default Index;
