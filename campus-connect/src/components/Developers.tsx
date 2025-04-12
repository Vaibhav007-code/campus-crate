import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LinkedinIcon } from "lucide-react";

interface Developer {
  name: string;
  linkedin: string;
  role: string;
}

const developers: Developer[] = [
  {
    name: "Nishant Kumar",
    linkedin: "https://www.linkedin.com/in/nishant-kumar-b9aab92b7",
    role: "Frontend Developer"
  },
  {
    name: "Sagar Singh",
    linkedin: "https://www.linkedin.com/in/sagarsingh-coder",
    role: "Backend Developer"
  },
  {
    name: "Anushka Singh",
    linkedin: "https://www.linkedin.com/in/anushka-singh-3b1440285",
    role: "Overall project manager"
  },
  {
    name: "Vaibhav Pathak",
    linkedin: "https://www.linkedin.com/in/vaibhav-pathak-8b8991214",
    role: "Frontend Developer"
  }
];

export function Developers() {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Our Development Team</CardTitle>
        <CardDescription>
          Meet the talented developers behind CAMPUSCRATE
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {developers.map((developer) => (
            <div 
              key={developer.name}
              className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-white">
                  {getInitials(developer.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{developer.name}</h3>
                <p className="text-sm text-muted-foreground">{developer.role}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center"
                onClick={() => window.open(developer.linkedin, '_blank')}
              >
                <LinkedinIcon className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 