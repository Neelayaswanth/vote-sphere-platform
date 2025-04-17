
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, BarChart, FileEdit, FileText, Info, Settings } from "lucide-react";

export default function Content() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Knowledge Base</h1>
      <p className="text-muted-foreground mb-6">
        Resources and information for e-voting system administrators
      </p>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="guides">Admin Guides</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          <TabsTrigger value="bestpractices">Best Practices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                E-Voting System Overview
              </CardTitle>
              <CardDescription>
                Understanding the administrative components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">System Architecture</h3>
              <p>
                Our e-voting platform consists of several interconnected modules that handle voter management, election creation, vote casting, and result tabulation. The system is built with multiple security layers and redundant verification mechanisms.
              </p>
              
              <h3 className="text-lg font-medium">Key Administrative Features</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Voter Management:</strong> Registration, verification, and credential management</li>
                <li><strong>Election Management:</strong> Creation, configuration, and scheduling of elections</li>
                <li><strong>Candidate Management:</strong> Registration and profile management of candidates</li>
                <li><strong>Results Processing:</strong> Tabulation, verification, and publication of results</li>
                <li><strong>Audit System:</strong> Comprehensive logging and activity tracking</li>
                <li><strong>Support System:</strong> Communication with voters and issue resolution</li>
              </ul>
              
              <h3 className="text-lg font-medium">Administrative Roles</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>System Administrator:</strong> Manages system configuration and security</li>
                <li><strong>Election Administrator:</strong> Creates and manages elections</li>
                <li><strong>Voter Administrator:</strong> Handles voter registration and verification</li>
                <li><strong>Support Administrator:</strong> Addresses voter inquiries and issues</li>
                <li><strong>Audit Administrator:</strong> Reviews system logs and activities</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="guides" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Administrative Guides
              </CardTitle>
              <CardDescription>
                Step-by-step instructions for common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Creating a New Election</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                      <li>Navigate to Election Management</li>
                      <li>Click "Create New Election"</li>
                      <li>Fill in all required election details</li>
                      <li>Add candidates and positions</li>
                      <li>Set election schedule and parameters</li>
                      <li>Review and publish the election</li>
                    </ol>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="outline" size="sm" className="w-full">
                      <FileEdit className="mr-2 h-4 w-4" />
                      View Detailed Guide
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Managing Voters</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                      <li>Access Voter Management section</li>
                      <li>Add voters individually or bulk import</li>
                      <li>Verify voter identities and credentials</li>
                      <li>Assign voters to specific elections</li>
                      <li>Monitor voter registration status</li>
                      <li>Handle verification exceptions</li>
                    </ol>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="outline" size="sm" className="w-full">
                      <FileEdit className="mr-2 h-4 w-4" />
                      View Detailed Guide
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Running Reports</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                      <li>Navigate to Activity Logs section</li>
                      <li>Select report type and parameters</li>
                      <li>Choose date range and filters</li>
                      <li>Generate and review the report</li>
                      <li>Export data in required format</li>
                      <li>Schedule recurring reports if needed</li>
                    </ol>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart className="mr-2 h-4 w-4" />
                      View Detailed Guide
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">System Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                      <li>Access Settings section</li>
                      <li>Configure security parameters</li>
                      <li>Set up email notifications</li>
                      <li>Customize voter interface</li>
                      <li>Configure backup and recovery options</li>
                      <li>Test configuration changes</li>
                    </ol>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      View Detailed Guide
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="troubleshooting" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Troubleshooting Common Issues
              </CardTitle>
              <CardDescription>
                Solutions for frequently encountered problems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Voter Cannot Access Election</h3>
                <p className="text-sm text-muted-foreground">Common causes and solutions:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Verify voter's eligibility for the specific election</li>
                  <li>Check if the election is currently active and within schedule</li>
                  <li>Confirm voter's account is verified and not locked</li>
                  <li>Check for any IP restrictions or geolocation issues</li>
                  <li>Clear browser cache or try an alternative browser</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Election Results Not Generating</h3>
                <p className="text-sm text-muted-foreground">Common causes and solutions:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Verify the election has properly concluded according to schedule</li>
                  <li>Check if minimum voter participation threshold was met</li>
                  <li>Look for any unresolved vote validation exceptions</li>
                  <li>Review election configuration for results display settings</li>
                  <li>Check system logs for calculation errors or interruptions</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Voter Authentication Failures</h3>
                <p className="text-sm text-muted-foreground">Common causes and solutions:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Reset voter credentials if they've been forgotten</li>
                  <li>Check for account lockouts due to multiple failed attempts</li>
                  <li>Verify email address accuracy for password resets</li>
                  <li>Ensure multi-factor authentication is properly configured</li>
                  <li>Review recent system changes that might affect authentication</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Vote Submission Errors</h3>
                <p className="text-sm text-muted-foreground">Common causes and solutions:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Check for connectivity issues during submission</li>
                  <li>Verify the election hasn't closed during the voting session</li>
                  <li>Look for ballot validation errors (incomplete selections)</li>
                  <li>Check if voter has already cast a vote</li>
                  <li>Review system logs for specific error codes and details</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bestpractices" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Administrative Best Practices
              </CardTitle>
              <CardDescription>
                Guidelines for effective system administration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Security Best Practices</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Implement strong password policies for all admin accounts</li>
                <li>Use multi-factor authentication for administrative access</li>
                <li>Regularly rotate administrative credentials</li>
                <li>Conduct security audits before each major election</li>
                <li>Restrict administrative access to secure networks</li>
                <li>Monitor and review all administrative actions regularly</li>
              </ul>
              
              <h3 className="text-lg font-medium">Election Setup Guidelines</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Create elections well in advance of scheduled dates</li>
                <li>Run test elections with sample voters before going live</li>
                <li>Provide clear descriptions and instructions for each election</li>
                <li>Include contact information for voter support</li>
                <li>Configure notifications for key election events</li>
                <li>Schedule buffer time between election phases</li>
              </ul>
              
              <h3 className="text-lg font-medium">Voter Support Recommendations</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Establish clear support hours and response time expectations</li>
                <li>Create a knowledge base of common voter questions</li>
                <li>Provide multiple channels for voter assistance</li>
                <li>Document all support interactions for future reference</li>
                <li>Train support staff on common issues and resolutions</li>
                <li>Collect feedback to improve voter experience</li>
              </ul>
              
              <h3 className="text-lg font-medium">System Maintenance</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Schedule regular backups of all system data</li>
                <li>Apply security patches promptly but avoid changes during active elections</li>
                <li>Maintain a test environment to validate changes before production</li>
                <li>Archive completed elections according to retention policies</li>
                <li>Regularly clean up temporary data and logs</li>
                <li>Document all system configurations and changes</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
