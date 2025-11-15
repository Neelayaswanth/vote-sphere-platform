
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
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
import { 
  Loader2, 
  UserPlus, 
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function AdminSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as UserRole,
  });
  
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState<{id: string, name: string} | null>(null);
  
  const [adminAccounts, setAdminAccounts] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  
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
  }, [user, toast]);
  
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
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div variants={itemVariants} initial="hidden" animate="show">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-muted-foreground">
            Manage administrator accounts and permissions
          </p>
        </div>
      </motion.div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div className="space-y-6 mt-6">
            <motion.div variants={itemVariants}>
              <Card className="border border-muted/60 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/30 h-16 w-full" />
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
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card className="border border-muted/60 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/30 h-16 w-full" />
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
                      <Button 
                        type="submit" 
                        disabled={isAddingAdmin}
                        className="transition-all hover:shadow-md"
                      >
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
            </motion.div>
        </div>
      </motion.div>
      
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent className="border border-muted/60 shadow-sm">
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
    </motion.div>
  );
}
