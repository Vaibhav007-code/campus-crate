
import { db } from './db';
import { User, UserRole } from './types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Simple in-memory password storage (in a real app, use hashing and proper auth)
const passwords = new Map<string, string>();

export const auth = {
  currentUser: null as User | null,

  login: (credentials: LoginCredentials): User | null => {
    const users = db.getUsers();
    const user = users.find(u => u.email === credentials.email);
    
    if (!user || passwords.get(user.id) !== credentials.password) {
      return null;
    }
    
    // Store current user in localStorage for session persistence
    localStorage.setItem('currentUser', JSON.stringify(user));
    auth.currentUser = user;
    return user;
  },

  register: (data: RegisterData): User | null => {
    const users = db.getUsers();
    const existingUser = users.find(u => u.email === data.email);
    
    if (existingUser) {
      return null; // User already exists
    }
    
    const newUser = db.createUser({
      name: data.name,
      email: data.email,
      role: data.role,
    });
    
    // Store password
    passwords.set(newUser.id, data.password);
    
    // Log in the user
    auth.currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return newUser;
  },

  logout: (): void => {
    localStorage.removeItem('currentUser');
    auth.currentUser = null;
  },

  // Initialize from localStorage on page load
  init: (): User | null => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      auth.currentUser = JSON.parse(storedUser);
      return auth.currentUser;
    }
    return null;
  },

  // Check permissions based on role
  can: (action: string, resource: string): boolean => {
    if (!auth.currentUser) return false;

    // Faculty can do everything
    if (auth.currentUser.role === 'faculty') return true;

    // Alumni can create/delete jobs, but cannot delete notices/events
    if (auth.currentUser.role === 'alumni') {
      if (action === 'create' && resource === 'job') return true;
      if (action === 'delete' && resource === 'job' && auth.isOwner(resource)) return true;
      if (action === 'read') return true;
      return false;
    }

    // Students can only read content and participate in events
    if (auth.currentUser.role === 'student') {
      if (action === 'read') return true;
      if (action === 'participate' && resource === 'event') return true;
      return false;
    }

    return false;
  },

  // Check if current user is the owner of a resource
  isOwner: (resourceType: string): boolean => {
    // This is a placeholder. In a real implementation, 
    // you'd check if the current user is the owner of the specific resource
    return true;
  }
};

// Initialize auth on module load
auth.init();
