
import { useState } from 'react';
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
  Users 
} from 'lucide-react';

// Mock data for admin accounts
const adminAccountsMock = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Super Admin',
    lastActive: '2024-04-12T10:45:22.000Z',
    status: 'active',
    profileImage: '/placeholder.svg'
  },
  {
    id: '101',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    role: 'Election Admin',
    lastActive: '2024-04-10T14:30:00.000Z',
    status: 'active',
    profileImage: '/placeholder.svg'
  },
  {
    id: '102',
    name: 'David Rodriguez',
    email: 'david.r@example.com',
    role: 'Voter Admin',
    lastActive: '2024-04-11T09:15:45.000Z',
    status: 'active',
    profileImage: '/placeholder.svg'
  }
];

export default function AdminSettings() {
  const { toast } = useToast();
  
  // Platform settings state
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
  });
  
  // New admin form state
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: 'Voter Admin',
  });
  
  // Loading states
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  
  // Admin removal dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState<{id: string, name: string} | null>(null);
  
  // Handle platform settings change
  const handleSettingChange = (setting: string, value: any) => {
    setPlatformSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Handle saving platform settings
  const handleSaveSettings = async () => {
    setIsUpdatingSettings(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
  
  // Handle new admin input change
  const handleNewAdminChange = (field: string, value: string) => {
    setNewAdmin(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle adding new admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingAdmin(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Admin Added",
        description: `${newAdmin.name} has been added as ${newAdmin.role}.`,
      });
      
      // Reset form
      setNewAdmin({
        name: '',
        email: '',
        role: 'Voter Admin',
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add admin. Please try again.",
      });
    } finally {
      setIsAddingAdmin(false);
    }
  };
  
  // Handle removing admin
  const handleRemoveAdmin = async () => {
    if (!adminToRemove) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Admin Removed",
        description: `${adminToRemove.name} has been removed successfully.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove admin. Please try again.",
      });
    } finally {
      setRemoveDialogOpen(false);
      setAdminToRemove(null);
    }
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
        
        {/* Platform Settings Tab */}
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
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
                <CardDescription>
                  Configure available languages for the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>English</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>Spanish</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>French</span>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>German</span>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="default-language">Default Language</Label>
                  <Select defaultValue="english">
                    <SelectTrigger id="default-language" className="mt-1.5">
                      <SelectValue placeholder="Select default language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>
                  Configure email settings for notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email-sender">Sender Email</Label>
                  <Input
                    id="email-sender"
                    placeholder="noreply@yourvotingsystem.com"
                    className="mt-1.5"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email-service">Email Service</Label>
                  <Select defaultValue="smtp">
                    <SelectTrigger id="email-service" className="mt-1.5">
                      <SelectValue placeholder="Select email service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP Server</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="aws">Amazon SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Test Email Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Admin Accounts Tab */}
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
                    {adminAccountsMock.map(admin => (
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
                        <TableCell>{admin.role}</TableCell>
                        <TableCell>{new Date(admin.lastActive).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                          Active
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
                            disabled={admin.id === '1'} // Prevent removing super admin
                            className={admin.id === '1' ? 'opacity-50 cursor-not-allowed' : ''}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
                  <Label htmlFor="admin-role">Admin Role</Label>
                  <Select 
                    value={newAdmin.role}
                    onValueChange={(value) => handleNewAdminChange('role', value)}
                  >
                    <SelectTrigger id="admin-role">
                      <SelectValue placeholder="Select admin role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Super Admin">Super Admin</SelectItem>
                      <SelectItem value="Election Admin">Election Admin</SelectItem>
                      <SelectItem value="Voter Admin">Voter Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {newAdmin.role === 'Super Admin' 
                      ? 'Full access to all platform features and settings.'
                      : newAdmin.role === 'Election Admin'
                      ? 'Can manage elections, but cannot modify system settings.'
                      : 'Can manage and verify voters, but cannot modify elections or settings.'}
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
        
        {/* Security & Logs Tab */}
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
                  <p className="text-sm text-muted-foreground">Connected - Last backup: 12 Apr 2024</p>
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
                    <Vote className="h-4 w-4 mr-2 text-muted-foreground" />
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
                      <TableCell>2024-04-12 10:45:22</TableCell>
                      <TableCell>Admin User</TableCell>
                      <TableCell>Updated platform settings</TableCell>
                      <TableCell>192.168.1.100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2024-04-11 14:30:00</TableCell>
                      <TableCell>Sarah Johnson</TableCell>
                      <TableCell>Created new election "Presidential Election 2025"</TableCell>
                      <TableCell>192.168.1.101</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2024-04-11 09:15:45</TableCell>
                      <TableCell>David Rodriguez</TableCell>
                      <TableCell>Verified voter account "Michael Brown"</TableCell>
                      <TableCell>192.168.1.102</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2024-04-10 16:20:15</TableCell>
                      <TableCell>Admin User</TableCell>
                      <TableCell>Added new admin "Sarah Johnson"</TableCell>
                      <TableCell>192.168.1.100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2024-04-09 11:05:33</TableCell>
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
                Support resources and documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <HelpCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Admin Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    View comprehensive documentation for platform administration
                  </p>
                  <Button variant="link" className="px-0 h-auto">
                    View Admin Guide
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">User Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Documentation for voters using the platform
                  </p>
                  <Button variant="link" className="px-0 h-auto">
                    View Voter Guide
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md bg-muted p-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium">Technical Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Contact our technical support team
                    </p>
                  </div>
                  <Button>Contact Support</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Remove Admin Confirmation Dialog */}
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
