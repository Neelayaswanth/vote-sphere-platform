
import { Outlet } from 'react-router-dom';

export function VoterContent() {
  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto py-6 lg:py-8">
        <Outlet />
      </div>
    </main>
  );
}
