
import { DashboardStats } from "@/components/DashboardStats";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { RecentNotices } from "@/components/RecentNotices";
import { JobListings } from "@/components/JobListings";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Here's what's happening in your college community
        </p>
      </div>
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <UpcomingEvents />
        </div>
        
        <div>
          <RecentNotices />
        </div>
        
        <div className="lg:col-span-3">
          <JobListings />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
