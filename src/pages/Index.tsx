
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // Fetch user profile to determine role
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
          
        if (profileData && profileData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/voter');
        }
      } else {
        // Redirect to auth page if not authenticated
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate]);

  return null; // We don't need to render anything as we'll redirect
};

export default Index;
