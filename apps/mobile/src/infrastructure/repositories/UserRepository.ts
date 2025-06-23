import { UserProfile } from '@somni/types';
import { IUserRepository } from '@somni/core';
import { supabaseClient } from '../api/supabase/client';

export class UserRepository implements IUserRepository {
  async save(user: UserProfile): Promise<UserProfile> {
    // Use upsert instead of insert to handle existing profiles created by trigger
    const { data, error } = await supabaseClient
      .from('profiles')
      .upsert({
        user_id: user.user_id || user.id,
        handle: user.handle,
        username: user.username || (user as any).display_name,
        sex: user.sex,
        birth_date: (user.birth_date || (user as any).date_of_birth || '').trim() || null,
        avatar_url: user.avatar_url,
        locale: user.locale || user.language || 'en',
        dream_interpreter: user.dream_interpreter,
        is_premium: user.is_premium || false,
        onboarding_complete: user.onboarding_complete || user.onboarding_completed || false,
        location: user.location,
        location_accuracy: user.location_accuracy || 'none',
        location_country: user.location_country,
        location_city: user.location_city,
        settings: user.settings || {
          location_sharing: 'none',
          sleep_schedule: user.sleep_schedule || null,
          improve_sleep_quality: (user as any).improve_sleep_quality || null,
          interested_in_lucid_dreaming: (user as any).interested_in_lucid_dreaming || null,
        },
      })
      .select()
      .single();

    if (error) throw error;
    // Map user_id back to id for backward compatibility
    return { ...data, id: data.user_id };
  }

  async findById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    // Map user_id back to id for backward compatibility
    return data ? { ...data, id: data.user_id } : null;
  }

  async update(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    // Map frontend fields to database fields
    const dbUpdates: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Handle field name mappings for backward compatibility
    if (updates.display_name && !updates.username) {
      dbUpdates.username = updates.display_name;
      delete dbUpdates.display_name;
    }
    if ('date_of_birth' in updates && !updates.birth_date) {
      dbUpdates.birth_date = updates.date_of_birth || null;
      delete dbUpdates.date_of_birth;
    }
    if ('birth_date' in updates) {
      dbUpdates.birth_date = updates.birth_date || null;
    }
    if (updates.language && !updates.locale) {
      dbUpdates.locale = updates.language;
      delete dbUpdates.language;
    }
    if (updates.onboarding_completed !== undefined) {
      dbUpdates.onboarding_complete = updates.onboarding_completed;
      delete dbUpdates.onboarding_completed;
    }
    
    // Remove fields that don't exist in database
    delete dbUpdates.id; // Use user_id instead
    delete dbUpdates.sleep_schedule; // This should be in settings
    delete dbUpdates.lucid_dream_settings; // This doesn't exist
    delete dbUpdates.improve_sleep_quality; // This should be in settings
    delete dbUpdates.interested_in_lucid_dreaming; // This should be in settings
    
    // Ensure all profile fields are included if provided
    if (updates.sex) dbUpdates.sex = updates.sex;
    if (updates.avatar_url) dbUpdates.avatar_url = updates.avatar_url;
    if (updates.dream_interpreter) dbUpdates.dream_interpreter = updates.dream_interpreter;
    if (updates.handle) dbUpdates.handle = updates.handle;

    // Handle location data - convert object to PostGIS Point format if needed
    if (updates.location && typeof updates.location === 'object' && 'lat' in updates.location) {
      dbUpdates.location = `POINT(${updates.location.lng} ${updates.location.lat})`;
    }

    // Clean up any empty string values that should be null
    Object.keys(dbUpdates).forEach(key => {
      if (typeof dbUpdates[key] === 'string' && dbUpdates[key].trim() === '') {
        dbUpdates[key] = null;
      }
    });

    const { data, error } = await supabaseClient
      .from('profiles')
      .update(dbUpdates)
      .eq('user_id', id)
      .select()
      .single();

    if (error) throw error;
    // Map user_id back to id for backward compatibility
    return { ...data, id: data.user_id };
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('profiles')
      .delete()
      .eq('user_id', id);

    if (error) throw error;
  }

  async uploadAvatar(userId: string, formData: FormData): Promise<string> {
    const fileName = `${userId}/${Date.now()}_avatar.jpg`;
    
    // Extract file from FormData
    const file = formData.get('file') as any;
    if (!file) {
      throw new Error('No file provided');
    }

    // Convert to blob for Supabase upload
    const response = await fetch(file.uri);
    const blob = await response.blob();
    
    // Upload to Supabase Storage
    const { error } = await supabaseClient.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }
}