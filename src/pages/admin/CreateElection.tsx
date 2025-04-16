import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, PlusCircle, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { createElection, getElectionById, updateElection, Candidate } from '@/services/electionService';

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  description: z.string().optional(),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
}).refine(data => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

export default function CreateElection() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editingElectionId = id;
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateDescription, setNewCandidateDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
    },
  });
  
  // Fetch election data if editing
  useEffect(() => {
    if (editingElectionId) {
      setLoading(true);
      
      getElectionById(editingElectionId)
        .then(election => {
          if (election) {
            // Set form values
            form.reset({
              title: election.title,
              description: election.description || '',
              startDate: new Date(election.startDate),
              endDate: new Date(election.endDate),
            });
            
            // Set candidates
            if (election.candidates) {
              setCandidates(election.candidates);
            }
          }
        })
        .catch(error => {
          console.error('Error fetching election:', error);
          toast({
            title: 'Error',
            description: 'Failed to load election data',
            variant: 'destructive',
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [editingElectionId, form, toast]);
  
  const addCandidate = () => {
    if (!newCandidateName.trim()) {
      toast({
        title: 'Error',
        description: 'Candidate name is required',
        variant: 'destructive',
      });
      return;
    }
    
    const newCandidate: Candidate = {
      name: newCandidateName,
      description: newCandidateDescription,
    };
    
    setCandidates([...candidates, newCandidate]);
    setNewCandidateName('');
    setNewCandidateDescription('');
  };
  
  const removeCandidate = (index: number) => {
    const updatedCandidates = [...candidates];
    updatedCandidates.splice(index, 1);
    setCandidates(updatedCandidates);
  };
  
  const handleSubmit: SubmitHandler<FormValues> = async (values) => {
    setSaving(true);
    
    try {
      // Format dates to ISO string for API compatibility
      const electionData = {
        title: values.title,
        description: values.description || "",
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        // Make sure candidates have the correct shape expected by the API
        candidates: candidates.map(candidate => ({
          name: candidate.name,
          description: candidate.description
        }))
      };
      
      if (editingElectionId) {
        // Update existing election
        const result = await updateElection(editingElectionId, electionData);
        
        if (result) {
          toast({
            title: "Success",
            description: "Election updated successfully",
          });
          
          navigate(`/admin/elections`);
        }
      } else {
        // Create new election
        const result = await createElection(electionData);
        
        if (result) {
          toast({
            title: "Success",
            description: "Election created successfully",
          });
          
          navigate(`/admin/elections`);
        }
      }
    } catch (error) {
      console.error("Error saving election:", error);
      toast({
        title: "Error",
        description: "Failed to save election. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading election data...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">
        {editingElectionId ? 'Edit Election' : 'Create New Election'}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Election Details</CardTitle>
              <CardDescription>
                Enter the basic information about the election
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Election Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter election title" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be displayed to voters
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
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter election description" 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details about the election purpose
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
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When voting begins
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
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When voting ends
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
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
                          Save Election
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Candidates</CardTitle>
              <CardDescription>
                Add candidates for this election
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {candidates.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No candidates added yet
                  </div>
                ) : (
                  candidates.map((candidate, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 border rounded-md">
                      <div className="flex-1">
                        <h4 className="font-medium">{candidate.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {candidate.description || 'No description provided'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCandidate(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Add New Candidate</h4>
                <div className="space-y-3">
                  <div>
                    <Input
                      placeholder="Candidate Name"
                      value={newCandidateName}
                      onChange={(e) => setNewCandidateName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Candidate Description (Optional)"
                      value={newCandidateDescription}
                      onChange={(e) => setNewCandidateDescription(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addCandidate}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Candidate
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
              You must add at least one candidate to create an election.
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
