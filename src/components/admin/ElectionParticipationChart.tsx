
import { useState, useEffect } from 'react';
import { 
  BarChart as CustomBarChart 
} from '@/components/ui/custom-charts';
import { Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';
import { format, subDays } from 'date-fns';

interface ElectionData {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

interface ChartDataPoint {
  name: string;
  voted: number;
  notVoted: number;
}

const ElectionParticipationChart = ({ electionId }: { electionId: string }) => {
  const [loading, setLoading] = useState(true);
  const [participationData, setParticipationData] = useState<ChartDataPoint[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!electionId) return;
    
    const fetchData = async () => {
      setLoading(true);

      try {
        // Get all voters count
        const { data: votersData, error: votersError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'voter')
          .eq('status', 'active');

        if (votersError) throw votersError;
        
        const totalVoters = votersData ? votersData.length : 0;
        
        // Get votes for this election
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('voter_id, created_at')
          .eq('election_id', electionId);

        if (votesError) throw votesError;
        
        // Create data for last 7 days
        const today = new Date();
        const data: ChartDataPoint[] = [];
        
        // Process vote data by day for the last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = subDays(today, i);
          const formattedDate = format(date, 'MMM dd');
          
          // Filter votes for this specific day
          const votesOnDay = votesData ? votesData.filter(vote => {
            const voteDate = new Date(vote.created_at);
            return format(voteDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
          }) : [];
          
          const voted = votesOnDay.length;
          const notVoted = Math.max(totalVoters - voted, 0); // Ensure non-negative
          
          data.push({
            name: formattedDate,
            voted,
            notVoted
          });
        }

        setParticipationData(data);
      } catch (error: any) {
        console.error('Error fetching participation data:', error);
        toast({
          title: "Data Error",
          description: `Failed to load participation data: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up real-time subscription for vote changes
    const votesChannel = supabase
      .channel('votes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `election_id=eq.${electionId}` },
        () => {
          console.log('Votes table changed, refreshing participation data...');
          fetchData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(votesChannel);
    };
  }, [electionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading participation data...</span>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <CustomBarChart
        data={participationData}
        index="name"
        categories={["voted", "notVoted"]}
        colors={["primary", "destructive"]}
        valueFormatter={(value: number) => `${value} voters`}
      />
    </div>
  );
};

export default ElectionParticipationChart;
