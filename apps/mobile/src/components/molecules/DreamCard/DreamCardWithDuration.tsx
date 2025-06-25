import React, { useEffect, useState } from 'react';
import { DreamCard } from './DreamCard';
import { Dream } from '@somni/types';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';

interface DreamCardWithDurationProps {
  dream: Dream;
  onPress?: (dream: Dream) => void;
  onAnalyzePress?: (dream: Dream) => void;
  onDeletePress?: (dream: Dream) => void;
  onRetryPress?: (dream: Dream) => void;
}

export const DreamCardWithDuration: React.FC<DreamCardWithDurationProps> = (props) => {
  const [duration, setDuration] = useState<number | undefined>(props.dream.duration);
  const { user } = useAuth();

  useEffect(() => {
    // If transcription is pending/processing, use the duration from the dream object
    if (props.dream.transcription_status === 'pending' || props.dream.transcription_status === 'processing') {
      setDuration(props.dream.duration);
      return;
    }

    // Only fetch from transcription_usage if transcription is completed
    const fetchDuration = async () => {
      if (!user?.id || !props.dream.id || props.dream.transcription_status !== 'completed') return;

      try {
        const { data, error } = await supabase
          .from('transcription_usage')
          .select('duration_seconds')
          .eq('dream_id', props.dream.id)
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          console.log(`📊 Duration for dream ${props.dream.id}:`, data.duration_seconds);
          setDuration(data.duration_seconds);
        }
      } catch (error) {
        console.error('Error fetching dream duration:', error);
      }
    };

    fetchDuration();
  }, [props.dream.id, props.dream.duration, props.dream.transcription_status, user?.id]);

  return <DreamCard {...props} duration={duration} />;
};