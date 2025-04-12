
import { useState, useEffect } from "react";
import { UserList } from "@/components/UserList";
import { ChatBox } from "@/components/ChatBox";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

const Messages = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const location = useLocation();

  useEffect(() => {
    // Get userId from URL if it exists (when navigating from Members page)
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    if (userId) {
      setSelectedUserId(userId);
    }
  }, [location.search]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Messages</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Chat with faculty, students, and alumni
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Show UserList on mobile only when no chat is selected */}
        {(isMobile && !selectedUserId) || !isMobile ? (
          <div className={`${isMobile && selectedUserId ? 'hidden' : ''} md:col-span-1`}>
            <UserList 
              onSelectUser={(userId) => {
                setSelectedUserId(userId);
              }}
              selectedUserId={selectedUserId}
            />
          </div>
        ) : null}
        
        {/* Show ChatBox on mobile only when a chat is selected */}
        {(isMobile && selectedUserId) || !isMobile ? (
          <div className={`${isMobile && !selectedUserId ? 'hidden' : ''} md:col-span-2 relative`}>
            {selectedUserId ? (
              <>
                {isMobile && (
                  <button 
                    onClick={() => setSelectedUserId(null)} 
                    className="absolute top-2 left-2 z-10 p-2 rounded-full bg-background border text-foreground flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                  </button>
                )}
                <ChatBox receiverId={selectedUserId} />
              </>
            ) : (
              <div className="h-full border rounded-lg flex items-center justify-center p-6">
                <div className="text-center">
                  <h3 className="font-medium text-lg">No conversation selected</h3>
                  <p className="text-muted-foreground">
                    Select a user from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Messages;
