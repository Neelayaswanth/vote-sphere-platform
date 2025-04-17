
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, AlertTriangle, BookOpen, FileQuestion, Info } from "lucide-react";

export default function Content() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">E-Voting Information</h1>
      <p className="text-muted-foreground mb-6">
        Learn about our electronic voting system, process, and guidelines
      </p>
      
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="guidelines">Voting Guidelines</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                About Our E-Voting System
              </CardTitle>
              <CardDescription>
                Understanding the electronic voting platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">What is E-Voting?</h3>
              <p>
                Electronic voting (e-voting) refers to voting using electronic means to either aid or take care of casting and counting votes. Our system provides a secure, accessible, and convenient way for eligible voters to participate in various elections.
              </p>
              
              <h3 className="text-lg font-medium">How It Works</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Voter registration and identity verification</li>
                <li>Secure login to the voting platform</li>
                <li>View available elections and candidate information</li>
                <li>Cast your vote securely</li>
                <li>Receive confirmation of your vote submission</li>
                <li>View election results after official announcement</li>
              </ol>
              
              <h3 className="text-lg font-medium">Benefits of E-Voting</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Increased accessibility for voters with disabilities</li>
                <li>Convenience of voting from any location</li>
                <li>Reduction in voting errors and spoiled ballots</li>
                <li>Faster counting and result declaration</li>
                <li>Lower long-term costs compared to traditional voting</li>
                <li>Environmentally friendly (paperless)</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="guidelines" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Voting Guidelines
              </CardTitle>
              <CardDescription>
                Important rules and procedures for casting your vote
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Before Voting</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Ensure your voter profile information is up-to-date</li>
                <li>Verify your eligibility for specific elections</li>
                <li>Research candidates and proposals before election day</li>
                <li>Check the election schedule and voting time window</li>
              </ul>
              
              <h3 className="text-lg font-medium">During Voting</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use a secure and private device for voting</li>
                <li>Ensure a stable internet connection</li>
                <li>Do not share your login credentials with anyone</li>
                <li>Take your time to review all choices before submission</li>
                <li>Keep your confirmation receipt for future reference</li>
              </ul>
              
              <h3 className="text-lg font-medium">After Voting</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Log out completely from the voting system</li>
                <li>Clear your browser cache if using a shared device</li>
                <li>Check your voting history to confirm your participation</li>
                <li>Follow official channels for election results</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Security Measures
              </CardTitle>
              <CardDescription>
                How we protect your vote and personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">System Security</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>End-to-end encryption of all voting data</li>
                <li>Multi-factor authentication for voter accounts</li>
                <li>Regular security audits and penetration testing</li>
                <li>Compliance with international security standards</li>
                <li>Backup systems and disaster recovery protocols</li>
              </ul>
              
              <h3 className="text-lg font-medium">Vote Integrity</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Tamper-evident ballot records</li>
                <li>Cryptographic verification of vote integrity</li>
                <li>Anonymous vote storage separated from voter identities</li>
                <li>Transparent audit trails for verification</li>
              </ul>
              
              <h3 className="text-lg font-medium">Your Role in Security</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use strong, unique passwords for your voter account</li>
                <li>Keep your authentication details confidential</li>
                <li>Report any suspicious activities to our support team</li>
                <li>Update your devices with the latest security patches</li>
                <li>Verify the website URL before entering credentials</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="faq" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Common questions about the e-voting process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Can I change my vote after submission?</h3>
                <p>No, once you have confirmed and submitted your vote, it cannot be changed. Please review your selections carefully before final submission.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">What if I encounter technical issues during voting?</h3>
                <p>If you experience any technical difficulties, please contact our support team immediately through the Help & Support section. We recommend taking a screenshot of any error messages.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">How do I know my vote was counted?</h3>
                <p>After successfully casting your vote, you will receive a digital receipt with a unique identifier. You can verify your participation in your voting history section.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Is my vote anonymous?</h3>
                <p>Yes, our system separates your identity from your vote after verification. Administrators can see that you voted but cannot see who you voted for.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Can I vote from my mobile device?</h3>
                <p>Yes, our e-voting platform is fully responsive and works on smartphones and tablets. We recommend using the latest version of your browser for the best experience.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
