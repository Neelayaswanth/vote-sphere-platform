
import { useState } from 'react';
import { VoterHeader } from './voter/VoterHeader';
import { VoterSidebar } from './voter/VoterSidebar';
import { VoterContent } from './voter/VoterContent';

export default function VoterLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile header */}
      <VoterHeader setIsSidebarOpen={setIsSidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar components - both desktop and mobile */}
        <VoterSidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          isMobile={true} 
        />
        
        <VoterSidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          isMobile={false} 
        />

        {/* Main content */}
        <VoterContent />
      </div>
    </div>
  );
}
