
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { webSocket } from '@/lib/websocket';
import { Message } from '@/lib/types';
import { useAuth } from './AuthContext';
import { db } from '@/lib/db';

interface WebSocketContextType {
  sendMessage: (message: Omit<Message, 'id' | 'createdAt' | 'senderId'>) => void;
  messages: Message[];
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();

  // Load existing messages from db
  useEffect(() => {
    if (!user) return;
    
    // Get all messages relevant to the current user
    const existingMessages = db.getMessages().filter(msg => 
      msg.senderId === user.id || msg.receiverId === user.id
    );
    
    setMessages(existingMessages);
  }, [user]);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    webSocket.connect();

    // Set up message handler
    const unsubscribe = webSocket.onMessage((message) => {
      // Check if this message already exists in our state to prevent duplicates
      setMessages((prevMessages) => {
        // Check if we already have this message
        if (prevMessages.some(m => m.id === message.id)) {
          return prevMessages; // Don't add duplicates
        }
        
        // Add the new message
        const updatedMessages = [...prevMessages, message];
        
        // Sort messages by creation time
        return updatedMessages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      webSocket.disconnect();
    };
  }, []);

  const sendMessage = (messageData: Omit<Message, 'id' | 'createdAt' | 'senderId'>) => {
    if (!user) return;

    const message: Message = {
      ...messageData,
      id: crypto.randomUUID(),
      senderId: user.id,
      createdAt: new Date().toISOString(),
    };

    // Save the message to the database
    db.createMessage(message);
    
    // Send via WebSocket
    webSocket.sendMessage(message);
  };

  return (
    <WebSocketContext.Provider value={{ messages, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
