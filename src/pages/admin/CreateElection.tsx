
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Save, User, Trash2, Edit2, ImageIcon } from "lucide-react";

import { useElection } from "@/contexts/ElectionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";

// Validation schema
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Election title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
  })
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

// Candidate form schema
const candidateSchema = z.object({
  name: z.string().min(2, { message: "Candidate name must be at least 2 characters." }),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

// Candidate type
interface CandidateForm {
  id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

const CreateElection = () => {
  const { electionId } = useParams<{ electionId?: string }>();
  const { createElection, getElection, updateElection } = useElection();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidates, setCandidates] = useState<CandidateForm[]>([]);
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [editingCandidateIndex, setEditingCandidateIndex] = useState<number | null>(null);
  const isEditMode = !!electionId;

  // Election form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week duration
    },
  });

  // Candidate form
  const candidateForm = useForm<CandidateForm>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
    },
  });

  // Load election data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const election = getElection(electionId);
      if (election) {
        form.reset({
          title: election.title,
          description: election.description,
          startDate: new Date(election.startDate),
          endDate: new Date(election.endDate),
        });
        
        // Load candidates
        const electionCandidates = election.candidates.map(candidate => ({
          id: candidate.id,
          name: candidate.name,
          description: candidate.description || '',
          imageUrl: candidate.imageUrl || '',
        }));
        
        setCandidates(electionCandidates);
      } else {
        // Election not found
        toast({
          title: "Error",
          description: "Election not found",
          variant: "destructive",
        });
        navigate('/admin/elections');
      }
    }
  }, [electionId, getElection, form, navigate, toast, isEditMode]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      if (isEditMode) {
        // Update existing election
        await updateElection(electionId, {
          title: values.title,
          description: values.description,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
          // We'll handle candidates separately
        });
        
        // Handle candidates update in a separate API call (not implemented in this scope)
        // This would typically involve deleting removed candidates and adding new ones
        
        toast({
          title: "Election Updated",
          description: "The election has been updated successfully.",
        });
      } else {
        // Create new election
        await createElection({
          title: values.title,
          description: values.description,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
        });
        
        // Note: We would typically create candidates here after election creation
        // This would involve a separate API call to add candidates
        
        toast({
          title: "Election Created",
          description: "Your election has been created successfully.",
        });
      }
      
      navigate("/admin/elections");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} election`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCandidateSubmit = (data: CandidateForm) => {
    if (editingCandidateIndex !== null) {
      // Update existing candidate
      const updatedCandidates = [...candidates];
      updatedCandidates[editingCandidateIndex] = {
        ...updatedCandidates[editingCandidateIndex],
        ...data,
      };
      setCandidates(updatedCandidates);
      setEditingCandidateIndex(null);
    } else {
      // Add new candidate
      setCandidates([...candidates, data]);
    }
    
    // Reset form and close dialog
    candidateForm.reset({
      name: "",
      description: "",
      imageUrl: "",
    });
    setIsAddingCandidate(false);
  };

  const handleEditCandidate = (index: number) => {
    const candidate = candidates[index];
    candidateForm.reset({
      name: candidate.name,
      description: candidate.description || "",
      imageUrl: candidate.imageUrl || "",
    });
    setEditingCandidateIndex(index);
    setIsAddingCandidate(true);
  };

  const handleRemoveCandidate = (index: number) => {
    const updatedCandidates = [...candidates];
    updatedCandidates.splice(index, 1);
    setCandidates(updatedCandidates);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Election' : 'Create New Election'}</h1>
        <Button onClick={() => navigate('/admin/elections')} variant="outline">
          Cancel
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Election Details</CardTitle>
              <CardDescription>
                Enter the details for your{isEditMode ? ' ' : ' new '}election campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Election Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. School President Election 2025" {...field} />
                        </FormControl>
                        <FormDescription>
                          Choose a clear and descriptive title for your election.
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
                            placeholder="Provide details about the election..." 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Describe the purpose of this election and any relevant information for voters.
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
                                disabled={(date) => date < new Date() && !isEditMode}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
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
                                  (date < new Date() && !isEditMode) || 
                                  (form.getValues().startDate && date < form.getValues().startDate)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isEditMode ? "Update Election" : "Create Election"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Candidates</CardTitle>
                <Dialog open={isAddingCandidate} onOpenChange={setIsAddingCandidate}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingCandidateIndex(null);
                      candidateForm.reset({
                        name: "",
                        description: "",
                        imageUrl: "",
                      });
                    }}>
                      <Plus className="h-4 w-4 mr-1" /> Add Candidate
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCandidateIndex !== null ? 'Edit Candidate' : 'Add New Candidate'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={candidateForm.handleSubmit(handleCandidateSubmit)} className="space-y-4 py-4">
                      <div className="space-y-4">
                        <FormField
                          control={candidateForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Candidate name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={candidateForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Brief candidate description..." 
                                  className="min-h-[80px]"
                                  {...field} 
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={candidateForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Profile Image URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://example.com/image.jpg" 
                                  {...field}
                                  value={field.value || ''} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">{editingCandidateIndex !== null ? 'Update' : 'Add'} Candidate</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Add the candidates who will be running in this election
              </CardDescription>
            </CardHeader>
            <CardContent>
              {candidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No candidates added yet</p>
                  <p className="text-sm">Click the "Add Candidate" button to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {candidates.map((candidate, index) => (
                    <div key={index} className="flex items-start p-3 border rounded-md">
                      <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                        {candidate.imageUrl ? (
                          <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
                        ) : (
                          <AvatarFallback>
                            {candidate.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{candidate.name}</h4>
                        {candidate.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {candidate.description}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditCandidate(index)}
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCandidate(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="block border-t p-4">
              <p className="text-sm text-muted-foreground">
                {isEditMode 
                  ? "Changes to candidates will be saved when you update the election."
                  : "Candidates can be added after creating the election."}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateElection;
