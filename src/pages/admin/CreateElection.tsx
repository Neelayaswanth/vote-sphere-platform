
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Loader2, CalendarIcon, PlusCircle, XCircle, Save } from 'lucide-react';

import { useElection } from '@/contexts/ElectionContext';

// Form Schema
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
}).refine(
  data => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export type ElectionFormValues = z.infer<typeof formSchema>;

export default function CreateElection() {
  const { electionId } = useParams();
  const isEditMode = Boolean(electionId);
  
  const [candidates, setCandidates] = useState<{ name: string; description: string }[]>([]);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateDescription, setNewCandidateDescription] = useState('');
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createElection, getElection, updateElection } = useElection();
  
  console.log("CreateElection component - isEditMode:", isEditMode, "electionId:", electionId);
  
  const form = useForm<ElectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week later
    },
  });
  
  const addCandidate = () => {
    if (newCandidateName.trim()) {
      setCandidates([
        ...candidates,
        {
          name: newCandidateName,
          description: newCandidateDescription,
        },
      ]);
      setNewCandidateName('');
      setNewCandidateDescription('');
    }
  };
  
  const removeCandidate = (index: number) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };
  
  const onSubmit = async (values: ElectionFormValues) => {
    if (candidates.length < 2) {
      toast({
        title: "Error",
        description: "You need at least 2 candidates for an election",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    
    try {
      // Format dates to ISO string for API compatibility
      const electionData = {
        title: values.title,
        description: values.description || "",
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        candidates,
      };
      
      if (isEditMode && electionId) {
        console.log("Updating election with ID:", electionId);
        await updateElection(electionId, electionData);
        toast({
          title: "Success",
          description: "Election updated successfully",
        });
      } else {
        console.log("Creating new election");
        await createElection(electionData);
        toast({
          title: "Success",
          description: "Election created successfully",
        });
      }
      
      navigate('/admin/elections');
    } catch (error) {
      console.error("Error saving election:", error);
      toast({
        title: "Error",
        description: "Failed to save election. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Load election data for editing
  useEffect(() => {
    if (isEditMode && electionId) {
      console.log("Fetching election for editing:", electionId);
      
      const loadElection = async () => {
        try {
          const election = await getElection(electionId);
          
          if (election) {
            console.log("Loaded election data:", election);
            
            // Convert string dates to Date objects for the form
            form.reset({
              title: election.title,
              description: election.description || "",
              startDate: new Date(election.startDate),
              endDate: new Date(election.endDate),
            });
            
            // Set candidates
            if (election.candidates && election.candidates.length > 0) {
              setCandidates(
                election.candidates.map((candidate: any) => ({
                  name: candidate.name,
                  description: candidate.description || "",
                }))
              );
            }
          } else {
            console.error("Election not found");
            toast({
              title: "Error",
              description: "Election not found",
              variant: "destructive",
            });
            navigate('/admin/elections');
          }
        } catch (error) {
          console.error("Error loading election:", error);
          toast({
            title: "Error",
            description: "Failed to load election details",
            variant: "destructive",
          });
          navigate('/admin/elections');
        }
      };
      
      loadElection();
    } else {
      console.log("Create new election mode");
      // Reset form for create mode
      form.reset({
        title: "",
        description: "",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      setCandidates([]);
    }
  }, [electionId, getElection, form, navigate, toast, isEditMode]);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">
        {isEditMode ? "Edit Election" : "Create New Election"}
      </h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Election Details</CardTitle>
              <CardDescription>
                Enter the details for the election
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Election title" {...field} />
                    </FormControl>
                    <FormDescription>
                      A short title for the election
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the election purpose"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Additional information about this election
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="pl-3 text-left font-normal flex justify-between items-center"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="h-4 w-4 opacity-70" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the election will start
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="pl-3 text-left font-normal flex justify-between items-center"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="h-4 w-4 opacity-70" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the election will end
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Candidates</CardTitle>
              <CardDescription>
                Add candidates for this election (minimum 2 required)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {candidates.length > 0 ? (
                  candidates.map((candidate, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 border rounded-md"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{candidate.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {candidate.description || "No description provided"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCandidate(index)}
                      >
                        <XCircle className="h-5 w-5 text-destructive" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 border rounded-md text-muted-foreground">
                    No candidates added yet. Add at least 2 candidates.
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h4 className="font-medium">Add a Candidate</h4>
                <div className="grid gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-3">
                      <Input
                        placeholder="Candidate Name"
                        value={newCandidateName}
                        onChange={(e) => setNewCandidateName(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={addCandidate}
                      disabled={!newCandidateName.trim()}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Candidate Description (optional)"
                    value={newCandidateDescription}
                    onChange={(e) => setNewCandidateDescription(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/elections')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "Update Election" : "Create Election"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
