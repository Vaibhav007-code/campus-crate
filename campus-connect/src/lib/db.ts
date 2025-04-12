import { User, Message, Notice, Event, Job, UserRole, Chat } from './types';

// Simulating SQLite database with localStorage for the demo
// In a real application, this would connect to SQLite using better-sqlite3 or similar

class LocalDatabase {
  private getItem<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setItem<T>(key: string, value: T[]): void {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('db-updated', { 
      detail: { key, value }
    }));
  }

  // User methods
  getUsers(): User[] {
    return this.getItem<User>('users');
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(user => user.id === id);
  }

  getUsersByRole(role: UserRole): User[] {
    return this.getUsers().filter(user => user.role === role);
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.setItem('users', [...users, newUser]);
    // Dispatch specific user created event
    window.dispatchEvent(new CustomEvent('user-created', { 
      detail: { user: newUser }
    }));
    return newUser;
  }

  updateUser(id: string, data: Partial<User>): User | undefined {
    const users = this.getUsers();
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return undefined;
    
    const updatedUser = { ...users[index], ...data };
    users[index] = updatedUser;
    this.setItem('users', users);
    return updatedUser;
  }

  // Message methods
  getMessages(): Message[] {
    return this.getItem<Message>('messages');
  }

  getMessagesBetweenUsers(user1Id: string, user2Id: string): Message[] {
    return this.getMessages().filter(
      message => 
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  createMessage(message: Omit<Message, 'id' | 'createdAt'>): Message {
    const messages = this.getMessages();
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.setItem('messages', [...messages, newMessage]);
    return newMessage;
  }

  // Chat methods
  getChats(): Chat[] {
    return this.getItem<Chat>('chats');
  }

  getChatById(id: string): Chat | undefined {
    return this.getChats().find(chat => chat.id === id);
  }

  getUserChats(userId: string): Chat[] {
    return this.getChats().filter(chat => 
      chat.participants.some(participant => participant.id === userId)
    );
  }

  createChat(participants: User[]): Chat {
    const chats = this.getChats();
    const newChat: Chat = {
      id: crypto.randomUUID(),
      participants,
      messages: [],
      lastMessageAt: new Date().toISOString(),
    };
    this.setItem('chats', [...chats, newChat]);
    return newChat;
  }

  updateChat(id: string, data: Partial<Chat>): Chat | undefined {
    const chats = this.getChats();
    const index = chats.findIndex(chat => chat.id === id);
    if (index === -1) return undefined;
    
    const updatedChat = { ...chats[index], ...data };
    chats[index] = updatedChat;
    this.setItem('chats', chats);
    return updatedChat;
  }

  // Notice methods
  getNotices(): Notice[] {
    return this.getItem<Notice>('notices').sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getNoticeById(id: string): Notice | undefined {
    return this.getNotices().find(notice => notice.id === id);
  }

  createNotice(notice: Omit<Notice, 'id' | 'createdAt'>): Notice {
    const notices = this.getNotices();
    const newNotice: Notice = {
      ...notice,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.setItem('notices', [...notices, newNotice]);
    return newNotice;
  }

  updateNotice(id: string, data: Partial<Notice>): Notice | undefined {
    const notices = this.getNotices();
    const index = notices.findIndex(notice => notice.id === id);
    if (index === -1) return undefined;
    
    const updatedNotice = { ...notices[index], ...data };
    notices[index] = updatedNotice;
    this.setItem('notices', notices);
    return updatedNotice;
  }

  deleteNotice(id: string): boolean {
    const notices = this.getNotices();
    const filteredNotices = notices.filter(notice => notice.id !== id);
    if (filteredNotices.length === notices.length) return false;
    
    this.setItem('notices', filteredNotices);
    return true;
  }

  // Event methods
  getEvents(): Event[] {
    return this.getItem<Event>('events').sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }

  getEventById(id: string): Event | undefined {
    return this.getEvents().find(event => event.id === id);
  }

  createEvent(event: Omit<Event, 'id' | 'createdAt'>): Event {
    const events = this.getEvents();
    const newEvent: Event = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.setItem('events', [...events, newEvent]);
    return newEvent;
  }

  updateEvent(id: string, data: Partial<Event>): Event | undefined {
    const events = this.getEvents();
    const index = events.findIndex(event => event.id === id);
    if (index === -1) return undefined;
    
    const updatedEvent = { ...events[index], ...data };
    events[index] = updatedEvent;
    this.setItem('events', events);
    return updatedEvent;
  }

  deleteEvent(id: string): boolean {
    const events = this.getEvents();
    const filteredEvents = events.filter(event => event.id !== id);
    if (filteredEvents.length === events.length) return false;
    
    this.setItem('events', filteredEvents);
    return true;
  }

  // Job methods
  getJobs(): Job[] {
    return this.getItem<Job>('jobs').sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getJobById(id: string): Job | undefined {
    return this.getJobs().find(job => job.id === id);
  }

  createJob(job: Omit<Job, 'id' | 'createdAt'>): Job {
    const jobs = this.getJobs();
    const newJob: Job = {
      ...job,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.setItem('jobs', [...jobs, newJob]);
    return newJob;
  }

  updateJob(id: string, data: Partial<Job>): Job | undefined {
    const jobs = this.getJobs();
    const index = jobs.findIndex(job => job.id === id);
    if (index === -1) return undefined;
    
    const updatedJob = { ...jobs[index], ...data };
    jobs[index] = updatedJob;
    this.setItem('jobs', jobs);
    return updatedJob;
  }

  deleteJob(id: string): boolean {
    const jobs = this.getJobs();
    const filteredJobs = jobs.filter(job => job.id !== id);
    if (filteredJobs.length === jobs.length) return false;
    
    this.setItem('jobs', filteredJobs);
    return true;
  }
}

export const db = new LocalDatabase();
