import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface DreamDuration {
  dreamId: string;
  duration: number;
}

export const useDreamDurations = (dreamIds: string[]) => {
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id || dreamIds.length === 0) return;

    const fetchDurations = async () => {
      setLoading(true);
      try {
        console.log('🔍 Fetching durations for dreams:', dreamIds);
        
        const { data, error } = await supabase
          .from('transcription_usage')
          .select('dream_id, duration_seconds')
          .in('dream_id', dreamIds)
          .eq('user_id', user.id);

        if (error) {
          console.error('❌ Error fetching durations:', error);
        } else if (data) {
          console.log('✅ Duration data received:', data);
          const durationMap = data.reduce((acc, item) => {
            acc[item.dream_id] = item.duration_seconds;
            return acc;
          }, {} as Record<string, number>);
          
          console.log('📊 Duration map:', durationMap);
          setDurations(durationMap);
        } else {
          console.log('⚠️ No duration data found');
        }
      } catch (error) {
        console.error('Error fetching dream durations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDurations();
  }, [dreamIds.join(','), user?.id]);

  return { durations, loading };
};