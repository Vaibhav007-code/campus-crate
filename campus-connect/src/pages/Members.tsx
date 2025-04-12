
import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import { db } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Users, UserCheck, GraduationCap, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Members = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Update this effect to run every 10 seconds to check for new users
  useEffect(() => {
    // Initial fetch
    fetchUsers();
    
    // Set up interval to periodically check for new users
    const intervalId = setInterval(fetchUsers, 10000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Extract fetch users logic to its own function
  const fetchUsers = () => {
    // Fetch all users
    const allUsers = db.getUsers();
    setUsers(allUsers);
  };

  const filteredUsers = users.filter(user => {
    // Filter by search query
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tab selection
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "faculty") return user.role === "faculty" && matchesSearch;
    if (activeTab === "students") return user.role === "student" && matchesSearch;
    if (activeTab === "alumni") return user.role === "alumni" && matchesSearch;
    
    return false;
  });

  const handleStartChat = (userId: string) => {
    navigate(`/messages?userId=${userId}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Members</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Connect with faculty, students, and alumni
        </p>
      </div>
      
      <Card className="mb-4 sm:mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="overflow-x-auto w-full flex sm:inline-flex no-scrollbar">
          <TabsTrigger value="all" className="gap-2">
            <Users className="h-4 w-4" />
            All Members
          </TabsTrigger>
          <TabsTrigger value="faculty" className="gap-2">
            <UserCheck className="h-4 w-4" />
            Faculty
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="alumni" className="gap-2">
            <Users className="h-4 w-4" />
            Alumni
          </TabsTrigger>
        </TabsList>
        
        {["all", "faculty", "students", "alumni"].map(tab => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {tab === "all" ? "All Members" : 
                   tab === "faculty" ? "Faculty" : 
                   tab === "students" ? "Students" : "Alumni"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No members found
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map(user => (
                      <div 
                        key={user.id}
                        className="flex items-start p-3 border rounded-lg"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="ml-3 flex-1">
                          <h3 className="font-medium">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs capitalize text-echo-blue">
                            {user.role}
                          </p>
                          
                          {user.id !== currentUser?.id && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2 w-full"
                              onClick={() => handleStartChat(user.id)}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Members;
