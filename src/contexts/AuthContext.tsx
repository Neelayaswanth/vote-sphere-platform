
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
}

interface AuthContextType {
  user: AppUser | null;
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

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Fetch user profile from the profiles table
          setTimeout(async () => {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();
              
            if (data && !error) {
              // Ensure role is of type UserRole by validating it
              const role = validateUserRole(data.role);
              
              const userData = {
                id: data.id,
                name: data.name,
                email: currentSession.user.email || '',
                role,
                verified: data.verified,
                profileImage: data.profile_image,
              };
              
              console.log("User profile fetched:", userData);
              
              // Store user in localStorage for other contexts
              localStorage.setItem('user', JSON.stringify(userData));
              
              setUser(userData);
            } else {
              console.error('Error fetching user profile:', error);
              setUser(null);
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
        supabase
          .from('profiles')
          .select('*')
          .eq('id', initialSession.user.id)
          .single()
          .then(({ data, error }) => {
            if (data && !error) {
              // Ensure role is of type UserRole by validating it
              const role = validateUserRole(data.role);
              
              const userData = {
                id: data.id,
                name: data.name,
                email: initialSession.user.email || '',
                role,
                verified: data.verified,
                profileImage: data.profile_image,
              };
              
              console.log("Initial user profile:", userData);
              
              // Store user in localStorage for other contexts
              localStorage.setItem('user', JSON.stringify(userData));
              
              setUser(userData);
            } else {
              console.error('Error fetching initial user profile:', error);
              setUser(null);
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
    isLoading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
