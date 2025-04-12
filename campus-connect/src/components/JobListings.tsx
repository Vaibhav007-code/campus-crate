
import { useEffect, useState } from "react";
import { Job, User } from "@/lib/types";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MapPinIcon, BriefcaseIcon } from "lucide-react";

export function JobListings() {
  const [jobs, setJobs] = useState<(Job & { author: User | undefined })[]>([]);

  useEffect(() => {
    const fetchJobs = () => {
      const allJobs = db.getJobs().slice(0, 3); // Get only 3 recent jobs
      
      // Enrich jobs with author information
      const enrichedJobs = allJobs.map(job => {
        const author = db.getUserById(job.authorId);
        return { ...job, author };
      });
      
      setJobs(enrichedJobs);
    };
    
    fetchJobs();
  }, []);

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Job Postings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No job opportunities posted yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Job Postings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.map(job => (
          <div key={job.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-semibold">{job.title}</h3>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <div className="flex items-center gap-1 mb-2">
              <BriefcaseIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{job.company}</span>
              <span className="text-muted-foreground mx-1">•</span>
              <MapPinIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{job.location}</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {job.description}
            </p>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {job.requirements.slice(0, 3).map((req, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">{req}</Badge>
              ))}
              {job.requirements.length > 3 && (
                <Badge variant="outline" className="text-xs">+{job.requirements.length - 3} more</Badge>
              )}
            </div>
            
            {job.author && (
              <div className="text-xs text-echo-blue">
                Posted by {job.author.name} (Alumni)
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
