
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth page when someone visits the root route
    navigate("/auth");
  }, [navigate]);

  return null; // We don't need to render anything as we'll redirect
};

export default Index;
