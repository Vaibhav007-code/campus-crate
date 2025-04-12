
import { useEffect, useState } from "react";
import { Notice, User } from "@/lib/types";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { PinIcon } from "lucide-react";

export function RecentNotices() {
  const [notices, setNotices] = useState<(Notice & { author: User | undefined })[]>([]);

  useEffect(() => {
    const fetchNotices = () => {
      const allNotices = db.getNotices().slice(0, 5); // Get only 5 recent notices
      
      // Enrich notices with author information
      const enrichedNotices = allNotices.map(notice => {
        const author = db.getUserById(notice.authorId);
        return { ...notice, author };
      });
      
      setNotices(enrichedNotices);
    };
    
    fetchNotices();
  }, []);

  if (notices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Notices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No notices have been posted yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Notices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notices.map(notice => (
          <div 
            key={notice.id} 
            className={`border rounded-lg p-4 ${notice.pinned ? "bg-amber-50" : ""}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">
                {notice.pinned && <PinIcon className="h-4 w-4 inline mr-1 text-amber-500" />}
                {notice.title}
              </h3>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {notice.content}
            </p>
            
            {notice.author && (
              <div className="text-xs text-echo-blue">
                Posted by {notice.author.name} ({notice.author.role})
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
