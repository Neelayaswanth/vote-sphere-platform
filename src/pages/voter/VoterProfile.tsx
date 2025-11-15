
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Phone, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VoterProfile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '', // Can be added to database later if needed
    address: '', // Can be added to database later if needed
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        address: '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await updateUser({
        name: formData.name,
      });
      
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your personal information
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>
              Your personal information and verification status
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={user?.profileImage} alt={user?.name} />
              <AvatarFallback className="text-4xl">
                {user?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-bold">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            
            <div className="mt-4">
              {user?.verified ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                  Verified Voter
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                  Awaiting Verification
                </span>
              )}
            </div>
            
            <div className="mt-6 w-full max-w-xs">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profile Completeness</span>
                <span className="font-medium">75%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                <div className="h-2 w-3/4 rounded-full bg-primary"></div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Add a phone number and address to complete your profile.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-2">
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
            <Button variant="outline" asChild>
              <Link to="/voter/settings">
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Profile Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Profile' : 'Profile Details'}</CardTitle>
            <CardDescription>
              {isEditing 
                ? 'Update your personal information' 
                : 'Your personal information and contact details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Smith"
                    className="pl-10"
                    value={formData.name}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="(123) 456-7890"
                    className="pl-10"
                    value={formData.phone}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main St, Anytown, USA"
                  value={formData.address}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
              
              {isEditing && (
                <div className="flex items-center justify-end space-x-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: '',
                        address: '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>
            Information about your account verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-medium">Email Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Your email address has been verified
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                Verified
              </span>
            </div>
            
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-medium">ID Verification</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.verified 
                    ? 'Your ID has been verified by an administrator' 
                    : 'Your ID is pending verification by an administrator'}
                </p>
              </div>
              {user?.verified ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                  Pending
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Enable 2FA for additional security
                </p>
              </div>
              <Button variant="outline" size="sm">
                Set Up 2FA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
