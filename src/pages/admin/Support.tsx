
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSupport } from '@/contexts/SupportContext';
import { Loader2 } from 'lucide-react';
import AdminSupportCenter from '@/components/support/AdminSupportCenter';

export default function Support() {
  const { loading } = useSupport();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading support messages...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Help & Support Center</h1>
      <p className="text-muted-foreground mb-6">
        Manage and respond to voter support requests and inquiries
      </p>
      
      <AdminSupportCenter />
    </div>
  );
}
