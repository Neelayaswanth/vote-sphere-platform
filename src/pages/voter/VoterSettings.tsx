
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Eye, EyeOff, Lock, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SupportDialog from '@/components/support/SupportDialog';
import { motion } from 'framer-motion';

export default function VoterSettings() {
  const { user, updateUser, changePassword, uploadProfileImage } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  useEffect(() => {
    if (user) {
      setName(user.name);
      setImagePreview(user.profileImage || null);
    }
  }, [user]);
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      await updateUser({ name });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "New password and confirmation do not match.",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }
    
    setChangingPassword(true);
    
    try {
      await changePassword(currentPassword, newPassword);
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to change password",
        description: error.message || "Please check your current password and try again."
      });
    } finally {
      setChangingPassword(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleImageUpload = async () => {
    if (!imageFile) return;
    
    setUploadingImage(true);
    
    try {
      const imageUrl = await uploadProfileImage(imageFile);
      
      if (imageUrl) {
        toast({
          title: "Image uploaded",
          description: "Your profile image has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload profile image. Please try again.",
      });
    } finally {
      setUploadingImage(false);
      setImageFile(null);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <motion.div 
      className="container max-w-4xl pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
        variants={itemVariants}
        initial="hidden"
        animate="show"
      >
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and security
          </p>
        </div>
        <SupportDialog />
      </motion.div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <TabsContent value="account" className="space-y-6 mt-6">
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border border-muted/60 shadow-sm">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/30 h-32 w-full relative">
                  <div className="absolute -bottom-12 left-8">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                      <AvatarImage src={imagePreview || user?.profileImage} />
                      <AvatarFallback className="text-2xl">{user?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <CardContent className="pt-16 space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div>
                        <Label htmlFor="profile-image" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors">
                          <Camera className="h-4 w-4" />
                          Change Picture
                        </Label>
                        <Input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </div>
                      
                      {imageFile && (
                        <Button 
                          variant="outline" 
                          onClick={handleImageUpload}
                          disabled={uploadingImage}
                          className="transition-all hover:shadow-md"
                        >
                          {uploadingImage ? 'Uploading...' : 'Upload New Image'}
                        </Button>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="display-name">Display Name</Label>
                        <Input
                          id="display-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="max-w-md"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="bg-muted max-w-md"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email address cannot be changed
                        </p>
                      </div>
                      
                      <Button 
                        onClick={handleSaveProfile}
                        className="mt-2 transition-all hover:shadow-md"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6 mt-6">
            <motion.div variants={itemVariants}>
              <Card className="border border-muted/60 shadow-sm">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        disabled={changingPassword} 
                        className="transition-all hover:shadow-md"
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        {changingPassword ? 'Changing Password...' : 'Change Password'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </motion.div>
      </Tabs>
    </motion.div>
  );
}
