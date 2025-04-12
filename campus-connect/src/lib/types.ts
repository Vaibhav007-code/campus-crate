
// User Types
export type UserRole = 'faculty' | 'student' | 'alumni';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string | null; // null means it's a group message
  content: string;
  attachment?: {
    type: 'image' | 'document' | 'pdf';
    url: string;
    name: string;
  };
  createdAt: string;
}

// Chat Types
export interface Chat {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessageAt: string;
}

// Notice Types
export interface Notice {
  id: string;
  title: string;
  content: string;
  authorId: string;
  pinned: boolean;
  createdAt: string;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  authorId: string;
  participants: string[]; // User IDs
  createdAt: string;
}

// Job Types
export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  authorId: string;
  createdAt: string;
}
