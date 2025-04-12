
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
import { CalendarIcon, MapPinIcon, PlusIcon } from "lucide-react";
import { format } from "date-fns";

export function CreateEventForm({ onEventCreated }: { onEventCreated?: () => void }) {
  const { user, can } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !can('create', 'event')) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to create events.",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim() || !description.trim() || !location.trim() || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "All fields are required.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      toast({
        title: "Error",
        description: "End date cannot be before start date.",
        variant: "destructive",
      });
      return;
    }
    
    const newEvent = db.createEvent({
      title,
      description,
      location,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      authorId: user.id,
      participants: [], // No participants initially
    });
    
    if (newEvent) {
      toast({
        title: "Success",
        description: "Event created successfully.",
      });
      setTitle("");
      setDescription("");
      setLocation("");
      setStartDate("");
      setEndDate("");
      setOpen(false);
      
      if (onEventCreated) {
        onEventCreated();
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to create event.",
        variant: "destructive",
      });
    }
  };

  if (!user || !can('create', 'event')) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>
            Create a new event that others can participate in.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleCreateEvent} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Event description"
              required
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Event location"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Start Date & Time
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                End Date & Time
              </Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
