import { UserProfile } from '@somni/types';
import { IUserRepository } from '@somni/core';
import { supabaseClient } from '../api/supabase/client';

export class UserRepository implements IUserRepository {
  async save(user: UserProfile): Promise<UserProfile> {
    const { data, error } = await supabaseClient
      .from('users_profile')
      .insert({
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        is_premium: user.is_premium,
        onboarding_completed: user.onboarding_completed,
        sleep_schedule: user.sleep_schedule,
        lucid_dream_settings: user.lucid_dream_settings,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabaseClient
      .from('users_profile')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  async update(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabaseClient
      .from('users_profile')
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
      .from('users_profile')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}