import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export interface Theme {
  code: string;
  name: string;
  description: string;
  similarity: number;
  chunk_index?: number;
}

interface UseDreamThemesReturn {
  themes: Theme[];
  loading: boolean;
  error: string | null;
}

export const useDreamThemes = (dreamId: string | null): UseDreamThemesReturn => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!dreamId || !session?.access_token) {
      setThemes([]);
      return;
    }

    const fetchThemes = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Fetching themes for dream:', dreamId);
        
        // Try the Supabase RPC approach as documented
        const { data, error: rpcError } = await supabase
          .rpc('get_dream_themes', {
            p_dream_id: dreamId,
            p_min_similarity: 0.5
          });
        
        if (rpcError) {
          console.error('❌ RPC Error:', rpcError);
          
          // Fallback to direct query if RPC doesn't exist
          // First get the dream themes
          const { data: dreamThemesData, error: dreamThemesError } = await supabase
            .from('dream_themes')
            .select('theme_code, similarity, chunk_index')
            .eq('dream_id', dreamId)
            .gte('similarity', 0.5)
            .order('similarity', { ascending: false });
          
          if (dreamThemesError) {
            throw dreamThemesError;
          }
          
          if (!dreamThemesData || dreamThemesData.length === 0) {
            setThemes([]);
            return;
          }
          
          // Then get the theme details
          const themeCodes = dreamThemesData.map(dt => dt.theme_code);
          const { data: themesData, error: themesError } = await supabase
            .from('themes')
            .select('code, name, description')
            .in('code', themeCodes);
          
          if (themesError) {
            throw themesError;
          }
          
          // Combine the data
          const themesMap = new Map(themesData?.map(t => [t.code, t]) || []);
          const transformedThemes = dreamThemesData.map(dt => ({
            code: dt.theme_code,
            name: themesMap.get(dt.theme_code)?.name || '',
            description: themesMap.get(dt.theme_code)?.description || '',
            similarity: dt.similarity,
            chunk_index: dt.chunk_index
          }));
          
          setThemes(transformedThemes);
        } else {
          // Use RPC data if successful
          // Map the RPC response to our expected format
          const mappedThemes = (data || []).map(item => ({
            code: item.theme_code,
            name: item.theme_label || 'Unknown',
            description: item.theme_description || '',
            similarity: item.similarity,
            chunk_index: item.chunk_index
          }));
          setThemes(mappedThemes);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dream themes';
        console.error('Error fetching dream themes:', err);
        setError(errorMessage);
        setThemes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, [dreamId, session?.access_token]);

  return {
    themes,
    loading,
    error,
  };
};