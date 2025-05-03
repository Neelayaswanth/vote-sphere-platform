
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupport } from '@/contexts/SupportContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, MessageSquare, Search, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
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
