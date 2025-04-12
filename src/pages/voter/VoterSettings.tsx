
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bell, 
  Globe, 
  Key, 
  KeyRound, 
  Languages, 
  Loader2, 
  Moon, 
  Shield, 
  Smartphone 
} from 'lucide-react';

export default function VoterSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Notification settings state
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    browser: true,
    newElections: true,
    results: true,
    reminders: true,
  });
  
  // Language settings
  const [language, setLanguage] = useState('english');
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Your new password and confirmation do not match.",
      });
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would call an API to change the password
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: "There was a problem changing your password. Please try again.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const saveNotificationSettings = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Saving Settings",
        description: "There was a problem saving your settings. Please try again.",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <KeyRound className="h-5 w-5 mr-2 text-muted-foreground" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>
              
              <Button type="submit" disabled={isChangingPassword} className="w-full">
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Two-Factor Authentication Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-muted-foreground" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <h3 className="text-sm font-medium">Status</h3>
              <p className="text-sm text-destructive">Not Enabled</p>
            </div>
            
            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 text-muted-foreground mr-2" />
                <div>
                  <h4 className="text-sm font-medium">Authenticator App</h4>
                  <p className="text-xs text-muted-foreground">
                    Use an authenticator app like Google Authenticator or Authy to get verification codes.
                  </p>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              Set Up Two-Factor Authentication
            </Button>
          </CardContent>
        </Card>
        
        {/* Notification Settings Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-muted-foreground" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Control how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-4">Notification Channels</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="email-notifications" className="flex items-center space-x-2 cursor-pointer">
                      <span>Email Notifications</span>
                    </Label>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="sms-notifications" className="flex items-center space-x-2 cursor-pointer">
                      <span>SMS Notifications</span>
                    </Label>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="browser-notifications" className="flex items-center space-x-2 cursor-pointer">
                      <span>Browser Notifications</span>
                    </Label>
                  </div>
                  <Switch
                    id="browser-notifications"
                    checked={notifications.browser}
                    onCheckedChange={(checked) => setNotifications({...notifications, browser: checked})}
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-4">Notification Types</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Elections</p>
                    <p className="text-sm text-muted-foreground">Get notified when new elections are announced</p>
                  </div>
                  <Switch
                    checked={notifications.newElections}
                    onCheckedChange={(checked) => setNotifications({...notifications, newElections: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Election Results</p>
                    <p className="text-sm text-muted-foreground">Get notified when results are published</p>
                  </div>
                  <Switch
                    checked={notifications.results}
                    onCheckedChange={(checked) => setNotifications({...notifications, results: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Voting Reminders</p>
                    <p className="text-sm text-muted-foreground">Receive reminders before elections close</p>
                  </div>
                  <Switch
                    checked={notifications.reminders}
                    onCheckedChange={(checked) => setNotifications({...notifications, reminders: checked})}
                  />
                </div>
              </div>
            </div>
            
            <Button onClick={saveNotificationSettings}>
              Save Notification Settings
            </Button>
          </CardContent>
        </Card>
        
        {/* Language & Appearance Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-muted-foreground" />
              Language & Appearance
            </CardTitle>
            <CardDescription>
              Customize your experience and accessibility options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="language">Language</Label>
                <div className="flex items-center space-x-2 mt-1.5">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="flex-1">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Español</SelectItem>
                      <SelectItem value="french">Français</SelectItem>
                      <SelectItem value="german">Deutsch</SelectItem>
                      <SelectItem value="chinese">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Dark Mode</Label>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center space-x-2">
                    <Moon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Enable dark mode</span>
                  </div>
                  <Switch
                    checked={document.documentElement.classList.contains('dark')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        document.documentElement.classList.add('dark');
                        localStorage.setItem('theme', 'dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                        localStorage.setItem('theme', 'light');
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-4">Accessibility Options</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Larger Text</p>
                    <p className="text-sm text-muted-foreground">Increase text size for better readability</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">High Contrast</p>
                    <p className="text-sm text-muted-foreground">Enhance visual distinction between elements</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
            
            <Button>
              Save Appearance Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
