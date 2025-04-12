
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
import { Switch } from "@/components/ui/switch";
import { PlusIcon } from "lucide-react";

export function CreateNoticeForm({ onNoticeCreated }: { onNoticeCreated?: () => void }) {
  const { user, can } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !can('create', 'notice')) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to create notices.",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }
    
    const newNotice = db.createNotice({
      title,
      content,
      authorId: user.id,
      pinned,
    });
    
    if (newNotice) {
      toast({
        title: "Success",
        description: "Notice created successfully.",
      });
      setTitle("");
      setContent("");
      setPinned(false);
      setOpen(false);
      
      if (onNoticeCreated) {
        onNoticeCreated();
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to create notice.",
        variant: "destructive",
      });
    }
  };

  if (!user || !can('create', 'notice')) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Notice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Notice</DialogTitle>
          <DialogDescription>
            Create a new notice that will be visible to all users.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleCreateNotice} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Notice title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Notice content"
              required
              rows={5}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="pinned"
              checked={pinned}
              onCheckedChange={setPinned}
            />
            <Label htmlFor="pinned">Pin this notice</Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Notice</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
