import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'voter' | 'admin' | null;

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  profileImage?: string;
  status?: 'active' | 'blocked';
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to validate that a role value is of type UserRole
function validateUserRole(role: string): UserRole {
  if (role === 'voter' || role === 'admin') {
    return role as UserRole;
  }
  console.warn(`Invalid role value "${role}" found, defaulting to null`);
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Fetch user profile function to avoid code duplication
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      if (!data) {
        console.warn('No profile found for user:', userId);
        return null;
      }
      
      // Ensure role is of type UserRole
      const role = validateUserRole(data.role);
      
      return {
        id: data.id,
        name: data.name,
        email: '', // Email is from auth, not profile
        role,
        verified: data.verified,
        profileImage: data.profile_image,
        status: data.status || 'active',
      };
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    console.log("Auth Provider initializing...");
    setIsLoading(true);
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Fetch user profile after a brief timeout
          // This helps prevent recursion in Supabase client
          setTimeout(async () => {
            const userData = await fetchUserProfile(currentSession.user.id);
            
            if (userData) {
              console.log("User profile fetched on auth change:", userData);
              
              // Include email from session
              const fullUserData = {
                ...userData,
                email: currentSession.user.email || '',
              };
              
              // Store user in localStorage for other contexts
              localStorage.setItem('user', JSON.stringify(fullUserData));
              
              setUser(fullUserData);
            } else {
              console.error('Error fetching user profile on auth change');
              setUser(null);
              localStorage.removeItem('user');
            }
            
            setIsLoading(false);
          }, 0);
        } else {
          localStorage.removeItem('user');
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("Initial session check:", initialSession?.user?.id);
      
      if (initialSession?.user) {
        setSession(initialSession);
        
        // Fetch user profile
        fetchUserProfile(initialSession.user.id).then(userData => {
          if (userData) {
            console.log("Initial user profile:", userData);
            
            // Include email from session
            const fullUserData = {
              ...userData,
              email: initialSession.user.email || '',
            };
            
            // Store user in localStorage for other contexts
            localStorage.setItem('user', JSON.stringify(fullUserData));
            
            setUser(fullUserData);
          } else {
            console.error('Error fetching initial user profile');
            setUser(null);
            localStorage.removeItem('user');
          }
          
          setIsLoading(false);
        });
      } else {
        localStorage.removeItem('user');
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting login for:", email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting signup for:", email, "with role:", role);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: role || 'voter',
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Signup successful",
        description: "Your account has been created successfully. Please check your email for verification.",
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateUser = async (userData: Partial<AppUser>) => {
    if (!user) return;
    
    try {
      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          profile_image: userData.profileImage,
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
