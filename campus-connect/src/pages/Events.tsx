
import { useState, useEffect } from "react";
import { Event, User } from "@/lib/types";
import { db } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CreateEventForm } from "@/components/CreateEventForm";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  MoreVertical,
  Trash2,
  Users as UsersIcon,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format, isFuture, isPast, formatDistanceToNow } from "date-fns";

type EnrichedEvent = Event & { 
  author: User | undefined;
  participantUsers: User[];
};

const Events = () => {
  const { user, can } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    const allEvents = db.getEvents();
    
    // Enrich events with author and participant information
    const enrichedEvents = allEvents.map(event => {
      const author = db.getUserById(event.authorId);
      const participantUsers = event.participants
        .map(id => db.getUserById(id))
        .filter((user): user is User => user !== undefined);
      
      return { ...event, author, participantUsers };
    });
    
    setEvents(enrichedEvents);
  };

  const handleDeleteEvent = (id: string) => {
    if (!user || !can('delete', 'event')) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to delete events.",
        variant: "destructive",
      });
      return;
    }
    
    const success = db.deleteEvent(id);
    if (success) {
      toast({
        title: "Success",
        description: "Event deleted successfully.",
      });
      fetchEvents();
    } else {
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      });
    }
  };

  const handleParticipate = (eventId: string) => {
    if (!user || !can('participate', 'event')) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to participate in events.",
        variant: "destructive",
      });
      return;
    }
    
    const event = db.getEventById(eventId);
    if (!event) return;
    
    const alreadyParticipating = event.participants.includes(user.id);
    
    if (alreadyParticipating) {
      // Remove user from participants
      const updatedEvent = db.updateEvent(eventId, {
        participants: event.participants.filter(id => id !== user.id)
      });
      
      if (updatedEvent) {
        toast({
          title: "Success",
          description: "You have withdrawn from the event.",
        });
        fetchEvents();
      }
    } else {
      // Add user to participants
      const updatedEvent = db.updateEvent(eventId, {
        participants: [...event.participants, user.id]
      });
      
      if (updatedEvent) {
        toast({
          title: "Success",
          description: "You have joined the event.",
        });
        fetchEvents();
      }
    }
  };

  const filteredEvents = events.filter(event => {
    const eventEndDate = new Date(event.endDate);
    
    if (activeTab === "upcoming") {
      return isFuture(eventEndDate);
    } else if (activeTab === "past") {
      return isPast(eventEndDate);
    } else if (activeTab === "participating" && user) {
      return event.participants.includes(user.id);
    }
    
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            College events and activities
          </p>
        </div>
        
        <CreateEventForm onEventCreated={fetchEvents} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <Clock className="h-4 w-4" />
            Past
          </TabsTrigger>
          <TabsTrigger value="participating" className="gap-2">
            <UsersIcon className="h-4 w-4" />
            Participating
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <p className="text-muted-foreground">No upcoming events available</p>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                onDelete={handleDeleteEvent}
                onParticipate={handleParticipate}
                canModify={can('delete', 'event')}
                canParticipate={can('participate', 'event')}
                currentUserId={user?.id}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <p className="text-muted-foreground">No past events available</p>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                onDelete={handleDeleteEvent}
                onParticipate={handleParticipate}
                canModify={can('delete', 'event')}
                canParticipate={can('participate', 'event')}
                currentUserId={user?.id}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="participating" className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <p className="text-muted-foreground">You're not participating in any events</p>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                onDelete={handleDeleteEvent}
                onParticipate={handleParticipate}
                canModify={can('delete', 'event')}
                canParticipate={can('participate', 'event')}
                currentUserId={user?.id}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface EventCardProps {
  event: EnrichedEvent;
  onDelete: (id: string) => void;
  onParticipate: (id: string) => void;
  canModify: boolean;
  canParticipate: boolean;
  currentUserId?: string;
}

function EventCard({ 
  event, 
  onDelete, 
  onParticipate, 
  canModify, 
  canParticipate,
  currentUserId,
}: EventCardProps) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isParticipating = currentUserId && event.participants.includes(currentUserId);
  const isPastEvent = isPast(endDate);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{event.title}</CardTitle>
          
          {canModify && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => onDelete(event.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <CardDescription>
          {formatDistanceToNow(startDate, { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="whitespace-pre-wrap">{event.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <div>
              <div className="text-sm">Starts: {format(startDate, "PPP 'at' p")}</div>
              <div className="text-sm">Ends: {format(endDate, "PPP 'at' p")}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{event.location}</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <UsersIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            Participants ({event.participantUsers.length})
          </h4>
          
          {event.participantUsers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {event.participantUsers.map(participant => (
                <div 
                  key={participant.id} 
                  className="flex items-center bg-gray-100 rounded-full px-2 py-1"
                >
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{participant.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No participants yet</p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        {event.author && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.author.avatar} />
              <AvatarFallback>{getInitials(event.author.name)}</AvatarFallback>
            </Avatar>
            <span>
              Created by {event.author.name} ({event.author.role})
            </span>
          </div>
        )}
        
        {canParticipate && !isPastEvent && (
          <Button 
            variant={isParticipating ? "outline" : "default"}
            onClick={() => onParticipate(event.id)}
          >
            {isParticipating ? "Cancel Participation" : "Participate"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default Events;
