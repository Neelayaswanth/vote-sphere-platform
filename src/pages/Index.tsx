
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          // Fetch user profile to determine role
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching profile:', error);
            navigate("/auth");
            return;
          }
            
          if (profileData && profileData.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/voter');
          }
        } else {
          // Redirect to auth page if not authenticated
          navigate("/auth");
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex justify-center items-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-lg">Loading...</span>
    </div>
  );
};

export default Index;
