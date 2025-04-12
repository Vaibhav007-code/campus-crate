import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import { db } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

interface UserListProps {
  onSelectUser: (userId: string) => void;
  selectedUserId: string | null;
}

export function UserList({ onSelectUser, selectedUserId }: UserListProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    
    // Initial fetch
    fetchUsers();
    
    // Listen for user updates
    const handleUserCreated = (event: CustomEvent) => {
      const { user: newUser } = event.detail;
      if (newUser.id !== currentUser.id) {
        setUsers(prevUsers => [...prevUsers, newUser]);
      }
    };

    const handleDbUpdated = (event: CustomEvent) => {
      const { key, value } = event.detail;
      if (key === 'users') {
        const updatedUsers = value.filter((u: User) => u.id !== currentUser.id);
        setUsers(updatedUsers);
      }
    };

    window.addEventListener('user-created', handleUserCreated as EventListener);
    window.addEventListener('db-updated', handleDbUpdated as EventListener);
    
    return () => {
      window.removeEventListener('user-created', handleUserCreated as EventListener);
      window.removeEventListener('db-updated', handleDbUpdated as EventListener);
    };
  }, [currentUser]);
  
  // Extract fetch users logic to its own function
  const fetchUsers = () => {
    // Fetch all users except the current user
    const allUsers = db.getUsers().filter(user => user.id !== currentUser?.id);
    setUsers(allUsers);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">
              {searchQuery ? "No users found" : "No users available"}
            </p>
          ) : (
            filteredUsers.map(user => (
              <button
                key={user.id}
                className={`w-full text-left p-2 rounded-md flex items-center hover:bg-gray-100 ${
                  selectedUserId === user.id ? "bg-gray-100" : ""
                }`}
                onClick={() => onSelectUser(user.id)}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="ml-2">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
