
import { useState, useEffect } from "react";
import { Notice, User } from "@/lib/types";
import { db } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CreateNoticeForm } from "@/components/CreateNoticeForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PinIcon,
  MoreVertical,
  Trash2,
  Star,
  Clock,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

type EnrichedNotice = Notice & { author: User | undefined };

const Notices = () => {
  const { user, can } = useAuth();
  const { toast } = useToast();
  const [notices, setNotices] = useState<EnrichedNotice[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = () => {
    const allNotices = db.getNotices();
    
    // Enrich notices with author information
    const enrichedNotices = allNotices.map(notice => {
      const author = db.getUserById(notice.authorId);
      return { ...notice, author };
    });
    
    setNotices(enrichedNotices);
  };

  const handleDeleteNotice = (id: string) => {
    if (!user || !can('delete', 'notice')) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to delete notices.",
        variant: "destructive",
      });
      return;
    }
    
    const success = db.deleteNotice(id);
    if (success) {
      toast({
        title: "Success",
        description: "Notice deleted successfully.",
      });
      fetchNotices();
    } else {
      toast({
        title: "Error",
        description: "Failed to delete notice.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePin = (id: string, currentPinned: boolean) => {
    if (!user || !can('update', 'notice')) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to pin/unpin notices.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedNotice = db.updateNotice(id, { pinned: !currentPinned });
    if (updatedNotice) {
      toast({
        title: "Success",
        description: `Notice ${currentPinned ? 'unpinned' : 'pinned'} successfully.`,
      });
      fetchNotices();
    } else {
      toast({
        title: "Error",
        description: `Failed to ${currentPinned ? 'unpin' : 'pin'} notice.`,
        variant: "destructive",
      });
    }
  };

  const filteredNotices = notices.filter(notice => {
    if (activeTab === "pinned") return notice.pinned;
    return true;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notices</h1>
          <p className="text-muted-foreground">
            Important announcements from the college
          </p>
        </div>
        
        <CreateNoticeForm onNoticeCreated={fetchNotices} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Clock className="h-4 w-4" />
            All Notices
          </TabsTrigger>
          <TabsTrigger value="pinned" className="gap-2">
            <Star className="h-4 w-4" />
            Pinned
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredNotices.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <p className="text-muted-foreground">No notices available</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotices.map(notice => (
              <NoticeCard 
                key={notice.id} 
                notice={notice} 
                onDelete={handleDeleteNotice}
                onTogglePin={handleTogglePin}
                canModify={can('delete', 'notice')}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="pinned" className="space-y-4">
          {filteredNotices.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <p className="text-muted-foreground">No pinned notices available</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotices.map(notice => (
              <NoticeCard 
                key={notice.id} 
                notice={notice} 
                onDelete={handleDeleteNotice}
                onTogglePin={handleTogglePin}
                canModify={can('delete', 'notice')}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface NoticeCardProps {
  notice: EnrichedNotice;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, currentPinned: boolean) => void;
  canModify: boolean;
}

function NoticeCard({ notice, onDelete, onTogglePin, canModify }: NoticeCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className={notice.pinned ? "border-amber-200 bg-amber-50" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-2">
            {notice.pinned && (
              <PinIcon className="h-4 w-4 text-amber-500 mt-1" />
            )}
            <CardTitle>{notice.title}</CardTitle>
          </div>
          
          {canModify && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onTogglePin(notice.id, notice.pinned)}>
                  <Star className="h-4 w-4 mr-2" />
                  {notice.pinned ? "Unpin" : "Pin"} Notice
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(notice.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Notice
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <CardDescription>
          Posted {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="whitespace-pre-wrap mb-4">{notice.content}</p>
        
        {notice.author && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarImage src={notice.author.avatar} />
              <AvatarFallback>{getInitials(notice.author.name)}</AvatarFallback>
            </Avatar>
            <span>
              Posted by {notice.author.name} ({notice.author.role})
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Notices;
