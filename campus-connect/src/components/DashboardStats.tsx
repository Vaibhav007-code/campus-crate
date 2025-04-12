
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bell, Calendar, Briefcase } from "lucide-react";
import { db } from "@/lib/db";

export function DashboardStats() {
  const userCount = db.getUsers().length;
  const noticeCount = db.getNotices().length;
  const eventCount = db.getEvents().length;
  const jobCount = db.getJobs().length;

  const stats = [
    {
      title: "Members",
      value: userCount,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Notices",
      value: noticeCount,
      icon: Bell,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Events",
      value: eventCount,
      icon: Calendar,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Job Postings",
      value: jobCount,
      icon: Briefcase,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.color}`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
