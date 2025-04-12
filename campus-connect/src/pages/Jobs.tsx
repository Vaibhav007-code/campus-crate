
import { useState, useEffect } from "react";
import { Job, User } from "@/lib/types";
import { db } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CreateJobForm } from "@/components/CreateJobForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  MapPin,
  MoreVertical,
  Trash2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";

type EnrichedJob = Job & { author: User | undefined };

const Jobs = () => {
  const { user, can } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<EnrichedJob[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    const allJobs = db.getJobs();
    
    // Enrich jobs with author information
    const enrichedJobs = allJobs.map(job => {
      const author = db.getUserById(job.authorId);
      return { ...job, author };
    });
    
    setJobs(enrichedJobs);
  };

  const handleDeleteJob = (id: string) => {
    if (!user) return;
    
    // Only allow deletion if the user is the author or faculty
    const job = db.getJobById(id);
    if (!job) return;
    
    const isAuthor = job.authorId === user.id;
    const isFaculty = user.role === 'faculty';
    
    if (!isAuthor && !isFaculty) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to delete this job posting.",
        variant: "destructive",
      });
      return;
    }
    
    const success = db.deleteJob(id);
    if (success) {
      toast({
        title: "Success",
        description: "Job posting deleted successfully.",
      });
      fetchJobs();
    } else {
      toast({
        title: "Error",
        description: "Failed to delete job posting.",
        variant: "destructive",
      });
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.requirements.some(req => req.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Job Opportunities</h1>
          <p className="text-muted-foreground">
            Career opportunities shared by alumni
          </p>
        </div>
        
        <CreateJobForm onJobCreated={fetchJobs} />
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, company, or location..."
              className="pl-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">
                {searchQuery ? "No jobs match your search criteria" : "No job opportunities posted yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map(job => (
            <JobCard 
              key={job.id}
              job={job}
              onDelete={handleDeleteJob}
              canDelete={
                user?.role === 'faculty' || 
                (user?.role === 'alumni' && job.authorId === user.id)
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

interface JobCardProps {
  job: EnrichedJob;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

function JobCard({ job, onDelete, canDelete }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              {job.title}
            </CardTitle>
            
            <CardDescription>
              {job.company} • {job.location}
            </CardDescription>
          </div>
          
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => onDelete(job.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Job
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className={`relative ${!expanded && "max-h-20 overflow-hidden"}`}>
          <p className="whitespace-pre-wrap">{job.description}</p>
          
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>
        
        {job.description.length > 150 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : "Show more"}
          </Button>
        )}
        
        <div>
          <h4 className="text-sm font-medium mb-2">Requirements</h4>
          
          <div className="flex flex-wrap gap-2">
            {job.requirements.map((requirement, index) => (
              <Badge key={index} variant="outline">
                {requirement}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Apply
          </Button>
          
          {job.author && (
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-6 w-6">
                <AvatarImage src={job.author.avatar} />
                <AvatarFallback>{getInitials(job.author.name)}</AvatarFallback>
              </Avatar>
              <span>by {job.author.name}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default Jobs;
