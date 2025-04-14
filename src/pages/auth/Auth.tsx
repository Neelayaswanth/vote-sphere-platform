
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { LockIcon, MailIcon, UserIcon, KeyIcon, ArrowRightIcon, CheckCircleIcon } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  const { login, signup, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  if (user) {
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/voter');
    }
    return null;
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "Success",
        description: "You have successfully logged in",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signup(email, password, name);
      toast({
        title: "Account Created",
        description: "Your account has been created successfully",
      });
      setActiveTab("login");
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/10 animate-fade-in">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center animate-scale-in">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Election System
          </h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Secure, transparent, and efficient digital voting platform
          </p>
        </div>

        <Card className="shadow-lg border-primary/10 animate-slide-in-right">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'login' 
                ? 'Enter your credentials to access your account' 
                : 'Sign up to start using our platform'}
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <MailIcon className="w-4 h-4" />
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="pl-10"
                        required
                      />
                      <MailIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <LockIcon className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                      <KeyIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full transition-all hover:scale-105 active:scale-95"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Logging in...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Log in
                        <ArrowRightIcon className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Full Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="pl-10"
                        required
                      />
                      <UserIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-2">
                      <MailIcon className="w-4 h-4" />
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="pl-10"
                        required
                      />
                      <MailIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-2">
                      <LockIcon className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                      <KeyIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full transition-all hover:scale-105 active:scale-95"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Create Account
                        <CheckCircleIcon className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground animate-fade-in">
          <p>Protected by encrypted authentication and storage.</p>
        </div>
      </div>
    </div>
  );
}
