
import { useEffect, useState } from "react";
import { Event } from "@/lib/types";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow, format } from "date-fns";

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const { user, can } = useAuth();

  useEffect(() => {
    const allEvents = db.getEvents();
    // Get the upcoming events (current date or future)
    const now = new Date();
    const upcoming = allEvents.filter(
      event => new Date(event.endDate) >= now
    ).slice(0, 3); // Get only 3 upcoming events
    
    setEvents(upcoming);
  }, []);

  const participateInEvent = (eventId: string) => {
    if (!user) return;
    
    const event = db.getEventById(eventId);
    if (!event) return;
    
    const alreadyParticipating = event.participants.includes(user.id);
    
    if (alreadyParticipating) {
      // Remove user from participants
      const updatedEvent = db.updateEvent(eventId, {
        participants: event.participants.filter(id => id !== user.id)
      });
      
      if (updatedEvent) {
        setEvents(events.map(e => e.id === eventId ? updatedEvent : e));
      }
    } else {
      // Add user to participants
      const updatedEvent = db.updateEvent(eventId, {
        participants: [...event.participants, user.id]
      });
      
      if (updatedEvent) {
        setEvents(events.map(e => e.id === eventId ? updatedEvent : e));
      }
    }
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No upcoming events scheduled</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map(event => {
          const isParticipating = user && event.participants.includes(user.id);
          
          return (
            <div key={event.id} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {event.description}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground mb-3">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>
                    {format(new Date(event.startDate), "MMM d, h:mm a")}
                  </span>
                </div>
                <div className="hidden sm:block">•</div>
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>{event.location}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-echo-blue">
                  {formatDistanceToNow(new Date(event.startDate), { addSuffix: true })}
                </div>
                
                {can('participate', 'event') && (
                  <Button 
                    variant={isParticipating ? "outline" : "default"} 
                    size="sm"
                    onClick={() => participateInEvent(event.id)}
                  >
                    {isParticipating ? "Cancel" : "Participate"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
