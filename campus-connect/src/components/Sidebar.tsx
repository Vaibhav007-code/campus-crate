import { Link, useLocation } from "react-router-dom";
import { 
  Bell, Home, MessageSquare, Calendar, FileText, Briefcase, 
  Users, LogOut, User, Code2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/messages", label: "Messages", icon: MessageSquare },
    { path: "/notices", label: "Notices", icon: Bell },
    { path: "/events", label: "Events", icon: Calendar },
    { path: "/resources", label: "Resources", icon: FileText },
    { path: "/jobs", label: "Jobs", icon: Briefcase },
    { path: "/members", label: "Members", icon: Users },
    { path: "/developers", label: "Developers", icon: Code2 },
  ];

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Logo and title */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">CAMPUSCRATE</h1>
      </div>

      {/* Nav items */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center py-3 px-4 rounded-md transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100",
                "group"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="ml-3 flex-1">{item.label}</span>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="border-t border-gray-200 p-4">
        {user && (
          <div className="flex items-center mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-gray-100"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-2">Log out</span>
        </Button>
      </div>
    </div>
  );
}
