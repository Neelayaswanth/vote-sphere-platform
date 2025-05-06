
import { useState } from 'react';
import { VoterHeader } from './voter/VoterHeader';
import { VoterSidebar } from './voter/VoterSidebar';
import { VoterContent } from './voter/VoterContent';

export default function VoterLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col bg-pattern-1">
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

        {/* Main content with glass effect */}
        <div className="flex-1 overflow-hidden glass-panel m-4 md:m-6">
          <VoterContent />
        </div>
      </div>
    </div>
  );
}
