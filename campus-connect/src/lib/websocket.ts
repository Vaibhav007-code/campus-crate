
// Simple WebSocket service implementation
// In a real application, you would use a proper WebSocket server
// For the demo, we'll use a simulated WebSocket with localStorage events

import { Message } from './types';

type MessageHandler = (message: Message) => void;

class WebSocketService {
  private handlers: MessageHandler[] = [];
  private storageListener: (event: StorageEvent) => void;
  private processedMessageIds: Set<string> = new Set(); // Track processed message IDs

  constructor() {
    // Listen for localStorage events as a simulation of WebSockets
    this.storageListener = (event: StorageEvent) => {
      if (event.key === 'websocket-message') {
        try {
          const message = JSON.parse(event.newValue || '{}') as Message;
          
          // Skip if we've already processed this message
          if (this.processedMessageIds.has(message.id)) {
            return;
          }
          
          // Store the ID to prevent duplicate processing
          this.processedMessageIds.add(message.id);
          
          // Limit the size of the processed IDs set to prevent memory issues
          if (this.processedMessageIds.size > 1000) {
            const idsArray = Array.from(this.processedMessageIds);
            this.processedMessageIds = new Set(idsArray.slice(idsArray.length - 500));
          }
          
          this.notifyHandlers(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      }
    };
  }

  connect(): void {
    // Start listening for localStorage events
    window.addEventListener('storage', this.storageListener);
    console.log('WebSocket connected');
  }

  disconnect(): void {
    // Stop listening for localStorage events
    window.removeEventListener('storage', this.storageListener);
    console.log('WebSocket disconnected');
  }

  sendMessage(message: Message): void {
    // Store in localStorage for persistence across sessions
    const messagesKey = 'echo-messages';
    const savedMessages = JSON.parse(localStorage.getItem(messagesKey) || '[]');
    savedMessages.push(message);
    localStorage.setItem(messagesKey, JSON.stringify(savedMessages));
    
    // For the current tab, directly notify handlers
    this.notifyHandlers(message);
    
    // For other tabs, use localStorage event
    localStorage.setItem('websocket-message', JSON.stringify(message));
    
    // Dispatch a storage event to notify other windows/tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'websocket-message',
      newValue: JSON.stringify(message)
    }));
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.push(handler);
    
    // Return a function to unsubscribe
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  private notifyHandlers(message: Message): void {
    this.handlers.forEach(handler => handler(message));
  }
}

export const webSocket = new WebSocketService();
