
import { useState, useEffect, useRef } from "react";
import { User, Message } from "@/lib/types";
import { db } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip } from "lucide-react";

export function ChatBox({ receiverId }: { receiverId: string | null }) {
  const { user } = useAuth();
  const { messages, sendMessage } = useWebSocket();
  const [inputMessage, setInputMessage] = useState("");
  const [receiver, setReceiver] = useState<User | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get receiver info
  useEffect(() => {
    if (receiverId) {
      const receiverUser = db.getUserById(receiverId);
      if (receiverUser) {
        setReceiver(receiverUser);
      }
    }
  }, [receiverId]);

  // Load saved messages on initial render
  useEffect(() => {
    // We'll load past messages from localStorage that was saved in the WebSocket service
    const messagesKey = 'echo-messages';
    const savedMessages = JSON.parse(localStorage.getItem(messagesKey) || '[]');
    
    // No need to set messages here as the WebSocketContext now handles it
  }, []);

  // Filter messages for the current conversation
  const conversationMessages = messages.filter(
    message => 
      (message.senderId === user?.id && message.receiverId === receiverId) ||
      (message.senderId === receiverId && message.receiverId === user?.id)
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !user || !receiverId) return;

    sendMessage({
      content: inputMessage,
      receiverId,
    });

    setInputMessage("");
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      {/* Chat header */}
      <div className="p-3 border-b flex items-center bg-gray-50">
        {receiver ? (
          <>
            <Avatar className="h-8 w-8">
              <AvatarImage src={receiver.avatar} />
              <AvatarFallback>{getInitials(receiver.name)}</AvatarFallback>
            </Avatar>
            <div className="ml-2">
              <p className="font-medium text-sm">{receiver.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{receiver.role}</p>
            </div>
          </>
        ) : (
          <p className="font-medium text-sm">Group Chat</p>
        )}
      </div>

      {/* Messages area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {conversationMessages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              No messages yet. Start a conversation!
            </p>
          ) : (
            conversationMessages.map(message => {
              const isCurrentUser = message.senderId === user.id;
              const messageUser = isCurrentUser ? user : receiver;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-end gap-2 max-w-[75%]">
                    {!isCurrentUser && messageUser && (
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={messageUser.avatar} />
                        <AvatarFallback>{getInitials(messageUser.name)}</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        isCurrentUser
                          ? "bg-echo-blue text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {message.content}
                      
                      {message.attachment && (
                        <div className="mt-2 p-2 bg-white/10 rounded text-xs flex items-center">
                          <Paperclip className="h-3 w-3 mr-1" />
                          {message.attachment.name}
                        </div>
                      )}
                      
                      <div className="text-right mt-1">
                        <span className={`text-xs ${isCurrentUser ? "text-white/70" : "text-gray-500"}`}>
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    
                    {isCurrentUser && (
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          title="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        
        <Input
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        
        <Button type="submit" size="icon" className="shrink-0" disabled={!inputMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
