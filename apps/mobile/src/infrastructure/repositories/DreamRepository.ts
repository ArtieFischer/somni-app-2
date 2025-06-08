import { Dream } from '@somni/types';
import { IDreamRepository } from '@somni/core';
import { supabaseClient } from '../api/supabase/client';

export class DreamRepository implements IDreamRepository {
  async save(dream: Dream): Promise<Dream> {
    const { data, error } = await supabaseClient
      .from('dreams')
      .insert({
        user_id: dream.user_id,
        raw_transcript: dream.raw_transcript,
        refined_narrative: dream.refined_narrative,
        audio_url: dream.audio_url,
        sleep_phase: dream.sleep_phase,
        is_lucid: dream.is_lucid,
        mood_before: dream.mood_before,
        mood_after: dream.mood_after,
        embedding: dream.embedding,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findById(id: string): Promise<Dream | null> {
    const { data, error } = await supabaseClient
      .from('dreams')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  async findByUserId(userId: string): Promise<Dream[]> {
    const { data, error } = await supabaseClient
      .from('dreams')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async update(id: string, updates: Partial<Dream>): Promise<Dream> {
    const { data, error } = await supabaseClient
      .from('dreams')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('dreams')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async search(query: string, userId?: string): Promise<Dream[]> {
    let dbQuery = supabaseClient
      .from('dreams')
      .select('*')
      .or(`raw_transcript.ilike.%${query}%,refined_narrative.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (userId) {
      dbQuery = dbQuery.eq('user_id', userId);
    }

    const { data, error } = await dbQuery;
    if (error) throw error;

    return data || [];
  }
}