import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // If no user is authenticated, redirect to auth page
      navigate("/auth");
    } else if (user.role === 'admin') {
      // If user is admin, redirect to admin dashboard
      navigate('/admin');
    } else {
      // Otherwise, redirect to voter dashboard
      navigate('/voter');
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex justify-center items-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-lg">Loading...</span>
    </div>
  );
};

export default Index;
