import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlarmClock, 
  BellRing, 
  Database, 
  FileKey, 
  Globe, 
  HelpCircle, 
  Loader2, 
  Lock, 
  Mail, 
  Save, 
  Server, 
  ShieldAlert, 
  User, 
  UserPlus, 
  Users,
  VoteIcon 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';

const indianLanguages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ur', name: 'Urdu' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'or', name: 'Odia' },
  { code: 'as', name: 'Assamese' },
  { code: 'mai', name: 'Maithili' },
  { code: 'sat', name: 'Santali' },
  { code: 'ks', name: 'Kashmiri' },
  { code: 'ne', name: 'Nepali' },
  { code: 'sd', name: 'Sindhi' },
  { code: 'doi', name: 'Dogri' },
  { code: 'mni', name: 'Manipuri' },
  { code: 'kok', name: 'Konkani' },
  { code: 'brx', name: 'Bodo' }
];

export default function AdminSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [platformSettings, setPlatformSettings] = useState({
    voteTimeout: 10,
    emailNotifications: true,
    verificationRequired: true,
    captchaEnabled: true,
    ipLogging: true,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    maintenanceMode: false,
    autoLogout: true,
    publishVotingResults: false,
  });
  
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as UserRole,
  });
  
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState<{id: string, name: string} | null>(null);
  
  const [adminAccounts, setAdminAccounts] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  
  const [enabledLanguages, setEnabledLanguages] = useState<Record<string, boolean>>({
    en: true,
    hi: true,
    ta: true,
    te: true,
  });
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  
  useEffect(() => {
    const fetchAdminAccounts = async () => {
      if (!user || user.role !== 'admin') return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'admin');
          
        if (error) throw error;
        
        const admins = data.map(profile => ({
          id: profile.id,
          name: profile.name,
          email: '',
          role: profile.role,
          lastActive: profile.updated_at,
          status: profile.status || 'active',
          profileImage: profile.profile_image || '/placeholder.svg'
        }));
        
        setAdminAccounts(admins);
      } catch (error) {
        console.error('Error fetching admin accounts:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load admin accounts."
        });
      } finally {
        setLoadingAdmins(false);
      }
    };
    
    fetchAdminAccounts();
  }, [user]);
  
  const handleSettingChange = (setting: string, value: any) => {
    setPlatformSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  const handleSaveSettings = async () => {
    setIsUpdatingSettings(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('enabledLanguages', JSON.stringify(enabledLanguages));
      localStorage.setItem('defaultLanguage', defaultLanguage);
      
      toast({
        title: "Settings Updated",
        description: "Platform settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update settings. Please try again.",
      });
    } finally {
      setIsUpdatingSettings(false);
    }
  };
  
  const handleNewAdminChange = (field: string, value: string) => {
    setNewAdmin(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    setIsAddingAdmin(true);
    
    try {
      const { error: signupError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
        options: {
          data: {
            name: newAdmin.name,
            role: 'admin',
          },
        },
      });
      
      if (signupError) throw signupError;
      
      toast({
        title: "Admin Added",
        description: `${newAdmin.name} has been added as an administrator.`,
      });
      
      setNewAdmin({
        name: '',
        email: '',
        password: '',
        role: 'admin',
      });
      
      setTimeout(() => {
        const fetchAdminAccounts = async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'admin');
            
          if (error) throw error;
          
          const admins = data.map(profile => ({
            id: profile.id,
            name: profile.name,
            email: '',
            role: profile.role,
            lastActive: profile.updated_at,
            status: profile.status || 'active',
            profileImage: profile.profile_image || '/placeholder.svg'
          }));
          
          setAdminAccounts(admins);
        };
        
        fetchAdminAccounts();
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add admin. Please try again.",
      });
    } finally {
      setIsAddingAdmin(false);
    }
  };
  
  const handleRemoveAdmin = async () => {
    if (!adminToRemove) return;
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'voter' })
        .eq('id', adminToRemove.id);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Admin Removed",
        description: `${adminToRemove.name} has been removed from administrators.`,
      });
      
      setAdminAccounts(prev => prev.filter(admin => admin.id !== adminToRemove.id));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove admin. Please try again.",
      });
    } finally {
      setRemoveDialogOpen(false);
      setAdminToRemove(null);
    }
  };
  
  const handleLanguageToggle = (langCode: string, enabled: boolean) => {
    setEnabledLanguages(prev => ({
      ...prev,
      [langCode]: enabled
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">
          Configure platform settings and manage admin accounts
        </p>
      </div>
      
      <Tabs defaultValue="platform">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platform">Platform Settings</TabsTrigger>
          <TabsTrigger value="admins">Admin Accounts</TabsTrigger>
          <TabsTrigger value="security">Security & Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="platform" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Platform Settings</CardTitle>
              <CardDescription>
                Configure global settings for the voting platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vote-timeout">Vote Timeout (seconds)</Label>
                    <Input
                      id="vote-timeout"
                      type="number"
                      min="0"
                      value={platformSettings.voteTimeout}
                      onChange={(e) => handleSettingChange('voteTimeout', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Waiting period before vote button becomes active
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      min="1"
                      value={platformSettings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      How long before inactive sessions are logged out
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                    <Input
                      id="max-login-attempts"
                      type="number"
                      min="1"
                      value={platformSettings.maxLoginAttempts}
                      onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum failed login attempts before temporary lockout
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Verification & Security</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="verification-required">Voter Verification Required</Label>
                      <p className="text-sm text-muted-foreground">
                        Require admin verification before voters can participate
                      </p>
                    </div>
                    <Switch
                      id="verification-required"
                      checked={platformSettings.verificationRequired}
                      onCheckedChange={(checked) => handleSettingChange('verificationRequired', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="captcha-enabled">CAPTCHA on Login</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable CAPTCHA protection on login screens
                      </p>
                    </div>
                    <Switch
                      id="captcha-enabled"
                      checked={platformSettings.captchaEnabled}
                      onCheckedChange={(checked) => handleSettingChange('captchaEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ip-logging">IP Address Logging</Label>
                      <p className="text-sm text-muted-foreground">
                        Log IP addresses for security monitoring
                      </p>
                    </div>
                    <Switch
                      id="ip-logging"
                      checked={platformSettings.ipLogging}
                      onCheckedChange={(checked) => handleSettingChange('ipLogging', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="publish-results">Publish Voting Results</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow admins to publish election results to voters
                      </p>
                    </div>
                    <Switch
                      id="publish-results"
                      checked={platformSettings.publishVotingResults}
                      onCheckedChange={(checked) => handleSettingChange('publishVotingResults', checked)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notifications & Alerts</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send email notifications for important events
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={platformSettings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-logout">Automatic Logout</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically log out inactive users
                      </p>
                    </div>
                    <Switch
                      id="auto-logout"
                      checked={platformSettings.autoLogout}
                      onCheckedChange={(checked) => handleSettingChange('autoLogout', checked)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Maintenance</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenance-mode" className="text-destructive font-medium">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable to temporarily restrict access for maintenance
                      </p>
                    </div>
                    <Switch
                      id="maintenance-mode"
                      checked={platformSettings.maintenanceMode}
                      onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isUpdatingSettings}
                >
                  {isUpdatingSettings ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
              <CardDescription>
                Configure available languages for the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {indianLanguages.map((language) => (
                    <div key={language.code} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{language.name}</span>
                      </div>
                      <Switch 
                        checked={!!enabledLanguages[language.code]} 
                        onCheckedChange={(checked) => handleLanguageToggle(language.code, checked)}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="default-language">Default Language</Label>
                  <Select 
                    value={defaultLanguage}
                    onValueChange={setDefaultLanguage}
                  >
                    <SelectTrigger id="default-language" className="mt-1.5">
                      <SelectValue placeholder="Select default language" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianLanguages
                        .filter(lang => !!enabledLanguages[lang.code])
                        .map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={isUpdatingSettings}
                  >
                    {isUpdatingSettings ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Language Settings
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admins" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Accounts</CardTitle>
              <CardDescription>
                Manage administrator accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admin</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingAdmins ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          <p className="mt-2 text-sm text-muted-foreground">Loading admin accounts...</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      adminAccounts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <p className="text-muted-foreground">No admin accounts found.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        adminAccounts.map(admin => (
                          <TableRow key={admin.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={admin.profileImage} alt={admin.name} />
                                  <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{admin.name}</div>
                                  <div className="text-sm text-muted-foreground">{admin.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{admin.role === 'admin' ? 'Administrator' : 'Voter'}</TableCell>
                            <TableCell>{new Date(admin.lastActive).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <span className="flex items-center">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                Active
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setAdminToRemove({
                                    id: admin.id,
                                    name: admin.name
                                  });
                                  setRemoveDialogOpen(true);
                                }}
                                disabled={admin.id === user?.id}
                                className={admin.id === user?.id ? 'opacity-50 cursor-not-allowed' : ''}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Add Admin Account</CardTitle>
              <CardDescription>
                Create a new administrator account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="admin-name">Admin Name</Label>
                    <Input
                      id="admin-name"
                      value={newAdmin.name}
                      onChange={(e) => handleNewAdminChange('name', e.target.value)}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="admin-email">Email Address</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => handleNewAdminChange('email', e.target.value)}
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => handleNewAdminChange('password', e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isAddingAdmin}>
                    {isAddingAdmin ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Admin
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure platform security options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center">
                      <FileKey className="h-4 w-4 mr-2 text-muted-foreground" />
                      Strong Password Policy
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce complex password requirements
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center">
                      <AlarmClock className="h-4 w-4 mr-2 text-muted-foreground" />
                      Password Expiration
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Require password change every 90 days
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center">
                      <ShieldAlert className="h-4 w-4 mr-2 text-muted-foreground" />
                      Suspicious Activity Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Send alerts on suspicious login attempts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>
                  Platform statistics and information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1 flex items-center">
                    <Server className="h-4 w-4 mr-2 text-muted-foreground" />
                    Server Status
                  </h3>
                  <div className="flex items-center">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-sm">Online - Operating normally</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1 flex items-center">
                    <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                    Database
                  </h3>
                  <p className="text-sm text-muted-foreground">Connected - Last backup: 12 Apr 2025</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    Active Users
                  </h3>
                  <p className="text-sm text-muted-foreground">Total: 6 (3 voters, 3 admins)</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1 flex items-center">
                    <VoteIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    Elections
                  </h3>
                  <p className="text-sm text-muted-foreground">Active: 1, Upcoming: 1, Completed: 1</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1 flex items-center">
                    <BellRing className="h-4 w-4 mr-2 text-muted-foreground" />
                    System Notifications
                  </h3>
                  <p className="text-sm text-destructive">1 security alert requires attention</p>
                </div>
                
                <Button variant="outline" className="w-full mt-2">
                  View System Logs
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Administrative actions and security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2025-04-12 10:45:22</TableCell>
                      <TableCell>Admin User</TableCell>
                      <TableCell>Updated platform settings</TableCell>
                      <TableCell>192.168.1.100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2025-04-11 14:30:00</TableCell>
                      <TableCell>Sarah Johnson</TableCell>
                      <TableCell>Created new election "Presidential Election 2025"</TableCell>
                      <TableCell>192.168.1.101</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2025-04-11 09:15:45</TableCell>
                      <TableCell>David Rodriguez</TableCell>
                      <TableCell>Verified voter account "Michael Brown"</TableCell>
                      <TableCell>192.168.1.102</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2025-04-10 16:20:15</TableCell>
                      <TableCell>Admin User</TableCell>
                      <TableCell>Added new admin "Sarah Johnson"</TableCell>
                      <TableCell>192.168.1.100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2025-04-09 11:05:33</TableCell>
                      <TableCell>System</TableCell>
                      <TableCell>Failed login attempt for admin account</TableCell>
                      <TableCell>203.0.113.42</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button variant="outline">
                  View Full Audit Log
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
              <CardDescription>
                Support center for voter assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSupportCenter />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {adminToRemove?.name}?
              <p className="mt-2">
                This will revoke their admin access immediately. They will no longer be able to access admin functions or view admin data.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAdmin}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
