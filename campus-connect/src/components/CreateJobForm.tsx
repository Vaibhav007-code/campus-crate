
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CreateJobForm({ onJobCreated }: { onJobCreated?: () => void }) {
  const { user, can } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [requirement, setRequirement] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);

  const handleAddRequirement = () => {
    if (!requirement.trim()) return;
    setRequirements([...requirements, requirement.trim()]);
    setRequirement("");
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleRequirementKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRequirement();
    }
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !can('create', 'job')) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to create job postings.",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim() || !company.trim() || !description.trim() || !location.trim()) {
      toast({
        title: "Error",
        description: "All fields except requirements are required.",
        variant: "destructive",
      });
      return;
    }
    
    const newJob = db.createJob({
      title,
      company,
      description,
      location,
      requirements,
      authorId: user.id,
    });
    
    if (newJob) {
      toast({
        title: "Success",
        description: "Job posting created successfully.",
      });
      setTitle("");
      setCompany("");
      setDescription("");
      setLocation("");
      setRequirements([]);
      setOpen(false);
      
      if (onJobCreated) {
        onJobCreated();
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to create job posting.",
        variant: "destructive",
      });
    }
  };

  // Only alumni and faculty can create job postings
  if (!user || (user.role !== 'alumni' && user.role !== 'faculty')) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Post Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Post Job Opportunity</DialogTitle>
          <DialogDescription>
            Share a job opportunity with the college community.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleCreateJob} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Software Engineer"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="e.g. Acme Inc."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or Remote"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Job description"
              required
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <div className="flex gap-2">
              <Input
                id="requirements"
                value={requirement}
                onChange={e => setRequirement(e.target.value)}
                onKeyDown={handleRequirementKeyDown}
                placeholder="e.g. 3+ years experience"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddRequirement}
              >
                Add
              </Button>
            </div>
            
            {requirements.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="py-1">
                    {req}
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(index)}
                      className="ml-2 hover:text-red-500 focus:outline-none"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Post Job</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
