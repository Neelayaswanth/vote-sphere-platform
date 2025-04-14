
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'voter' | 'admin' | null;
export type UserStatus = 'active' | 'blocked';

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  profileImage?: string;
  status: UserStatus;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<AppUser>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function validateUserRole(role: string): UserRole {
  if (role === 'voter' || role === 'admin') {
    return role as UserRole;
  }
  console.warn(`Invalid role value "${role}" found, defaulting to null`);
  return null;
}

function validateUserStatus(status: string | undefined): UserStatus {
  if (status === 'active' || status === 'blocked') {
    return status as UserStatus;
  }
  return 'active'; // Default value
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

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
      
      const role = validateUserRole(data.role);
      const status = validateUserStatus(data.status);
      
      return {
        id: data.id,
        name: data.name,
        email: '', // Email is from auth, not profile
        role,
        verified: data.verified,
        profileImage: data.profile_image,
        status,
      };
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    console.log("Auth Provider initializing...");
    setIsLoading(true);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setSession(currentSession);
        
        if (currentSession?.user) {
          setTimeout(async () => {
            const userData = await fetchUserProfile(currentSession.user.id);
            
            if (userData) {
              console.log("User profile fetched on auth change:", userData);
              
              const fullUserData = {
                ...userData,
                email: currentSession.user.email || '',
              };
              
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

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("Initial session check:", initialSession?.user?.id);
      
      if (initialSession?.user) {
        setSession(initialSession);
        
        fetchUserProfile(initialSession.user.id).then(userData => {
          if (userData) {
            console.log("Initial user profile:", userData);
            
            const fullUserData = {
              ...userData,
              email: initialSession.user.email || '',
            };
            
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
      const updateData: Record<string, any> = {};
      
      if (userData.name) updateData.name = userData.name;
      if (userData.profileImage) updateData.profile_image = userData.profileImage;
      if (userData.status) updateData.status = userData.status;
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
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

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to change your password.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });
      
      if (signInError) {
        throw new Error("Current password is incorrect");
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error: any) {
      console.error("Password change error:", error);
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadProfileImage = async (file: File): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to upload a profile image.",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `profile_images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      const publicUrl = data.publicUrl;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image: publicUrl })
        .eq('id', user.id);
        
      if (updateError) {
        throw updateError;
      }
      
      setUser(prev => prev ? { ...prev, profileImage: publicUrl } : null);
      
      toast({
        title: "Profile image updated",
        description: "Your profile image has been uploaded successfully.",
      });
      
      return publicUrl;
    } catch (error: any) {
      console.error("Profile image upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
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
    changePassword,
    uploadProfileImage
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
