
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Github, 
  Instagram, 
  Linkedin, 
  Facebook,
  Mail, 
  User,
  GraduationCap,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DeveloperContact() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Developer Contact</h1>
      <p className="text-muted-foreground mb-6">
        Information about the developer of this voting application
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Neela Yaswanth</CardTitle>
            <CardDescription>Student Developer</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-48 w-48 mb-6">
              <AvatarImage 
                src="/lovable-uploads/44dea54a-9a4a-4a16-979f-cd931d1a73c5.png" 
                alt="Neela Yaswanth" 
              />
              <AvatarFallback>NY</AvatarFallback>
            </Avatar>
            
            <div className="flex items-center mb-3">
              <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">Akshaya College of Engineering and Technology</span>
            </div>
            
            <div className="flex items-center mb-3">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">Contact via social media</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>About the Developer</CardTitle>
            <CardDescription>Connect with Neela Yaswanth</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              Neela Yaswanth is a student developer from Akshaya College of Engineering and Technology with a passion for creating secure and user-friendly voting applications.
            </p>
            
            <h3 className="text-lg font-medium mb-4">Connect with me</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="flex justify-start gap-3" asChild>
                <a href="https://www.instagram.com/the__real_yash_/" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5 text-pink-500" />
                  <span>Instagram</span>
                  <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </a>
              </Button>
              
              <Button variant="outline" className="flex justify-start gap-3" asChild>
                <a href="https://www.linkedin.com/in/neela-yaswanth-220b492b9/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5 text-blue-600" />
                  <span>LinkedIn</span>
                  <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </a>
              </Button>
              
              <Button variant="outline" className="flex justify-start gap-3" asChild>
                <a href="https://www.facebook.com/n.yaswanth" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5 text-blue-700" />
                  <span>Facebook</span>
                  <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </a>
              </Button>
              
              <Button variant="outline" className="flex justify-start gap-3" asChild>
                <a href="https://github.com/Neelayaswanth" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                  <span>GitHub</span>
                  <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </a>
              </Button>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Skills & Technologies</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">TypeScript</span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Tailwind CSS</span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Supabase</span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Web Development</span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">UI/UX Design</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
