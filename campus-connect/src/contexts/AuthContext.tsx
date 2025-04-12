
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, UserRole } from '@/lib/types';
import { auth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<User | null>;
  logout: () => void;
  can: (action: string, resource: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize auth state
    const currentUser = auth.init();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const user = auth.login({ email, password });
      if (user) {
        setUser(user);
        toast({
          title: "Success",
          description: "You have successfully logged in.",
        });
        return user;
      } else {
        toast({
          title: "Error",
          description: "Invalid email or password.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
      return null;
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: UserRole
  ): Promise<User | null> => {
    try {
      const user = auth.register({ name, email, password, role });
      if (user) {
        setUser(user);
        toast({
          title: "Success",
          description: "Your account has been created.",
        });
        return user;
      } else {
        toast({
          title: "Error",
          description: "Email is already in use.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "An error occurred during registration.",
        variant: "destructive",
      });
      return null;
    }
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out.",
    });
  };

  const can = (action: string, resource: string): boolean => {
    return auth.can(action, resource);
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    can,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
