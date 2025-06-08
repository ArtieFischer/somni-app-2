# API Reference

This document provides comprehensive information about Supabase integration, API calls, and backend services used in the Somni project.

## Supabase Configuration

### Environment Variables

#### Mobile App (`.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Web App (`.env.local`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Client Initialization

#### Mobile (React Native)
```typescript
// apps/mobile/src/lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

#### Web (React)
```typescript
// apps/web/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Database Schema

### Tables Structure

#### Users Profile Table
```sql
CREATE TABLE users_profile (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE NOT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
  sleep_schedule JSONB,
  lucid_dream_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 24)
);

-- Enable RLS
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON users_profile
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users_profile
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users_profile
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### Dreams Table
```sql
-- Custom enum for sleep phases
CREATE TYPE sleep_phase AS ENUM ('rem', 'nrem', 'light', 'deep', 'awake');

CREATE TABLE dreams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  raw_transcript TEXT,
  refined_narrative TEXT,
  audio_url TEXT,
  sleep_phase sleep_phase,
  is_lucid BOOLEAN DEFAULT FALSE,
  mood_before SMALLINT CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after SMALLINT CHECK (mood_after >= 1 AND mood_after <= 5),
  embedding vector(1536) -- For OpenAI's text-embedding-3-small model
);

-- Enable RLS
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own dreams" ON dreams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dreams" ON dreams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dreams" ON dreams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dreams" ON dreams
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_dreams_user_id ON dreams(user_id);
CREATE INDEX idx_dreams_created_at ON dreams(created_at DESC);
CREATE INDEX idx_dreams_embedding ON dreams USING hnsw (embedding vector_cosine_ops) WHERE embedding IS NOT NULL;
```

#### Dream Analysis Table
```sql
CREATE TABLE dream_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dream_id UUID REFERENCES dreams(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('freudian', 'jungian', 'spiritual', 'neurobiological', 'cognitive', 'personal_pattern')),
  content TEXT NOT NULL,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  key_insights TEXT[] DEFAULT '{}',
  suggested_actions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE dream_analysis ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view analysis of own dreams" ON dream_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = dream_analysis.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );
```

#### Dream Symbols Table
```sql
CREATE TABLE dream_symbols (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dream_id UUID REFERENCES dreams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  position INTEGER,
  personal_meaning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE dream_symbols ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view symbols of own dreams" ON dream_symbols
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = dream_symbols.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );
```

## Authentication API

### User Registration
```typescript
// services/authService.ts
export class AuthService {
  static async signUp(email: string, password: string, displayName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) throw error;
    return data;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
}
```

### Authentication State Management
```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
};
```

## Dreams API

### Dream Service
```typescript
// services/dreamService.ts
import { Dream, UserProfile } from '@somni/types';
import { supabase } from '../lib/supabase';

export class DreamService {
  static async createDream(dream: Omit<Dream, 'id' | 'created_at' | 'updated_at'>): Promise<Dream> {
    const { data, error } = await supabase
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
    return this.mapDreamFromDB(data);
  }

  static async getDreams(userId?: string): Promise<Dream[]> {
    let query = supabase
      .from('dreams')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data?.map(this.mapDreamFromDB) || [];
  }

  static async getDreamById(id: string): Promise<Dream | null> {
    const { data, error } = await supabase
      .from('dreams')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return this.mapDreamFromDB(data);
  }

  static async updateDream(id: string, updates: Partial<Dream>): Promise<Dream> {
    const { data, error } = await supabase
      .from('dreams')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapDreamFromDB(data);
  }

  static async deleteDream(id: string): Promise<void> {
    const { error } = await supabase
      .from('dreams')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async searchDreams(query: string, userId?: string): Promise<Dream[]> {
    let dbQuery = supabase
      .from('dreams')
      .select('*')
      .or(`raw_transcript.ilike.%${query}%,refined_narrative.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (userId) {
      dbQuery = dbQuery.eq('user_id', userId);
    }

    const { data, error } = await dbQuery;
    if (error) throw error;

    return data?.map(this.mapDreamFromDB) || [];
  }

  // Helper method to map database fields to TypeScript interface
  private static mapDreamFromDB(dbDream: any): Dream {
    return {
      id: dbDream.id,
      user_id: dbDream.user_id,
      created_at: dbDream.created_at,
      updated_at: dbDream.updated_at,
      raw_transcript: dbDream.raw_transcript,
      refined_narrative: dbDream.refined_narrative,
      audio_url: dbDream.audio_url,
      sleep_phase: dbDream.sleep_phase,
      is_lucid: dbDream.is_lucid,
      mood_before: dbDream.mood_before,
      mood_after: dbDream.mood_after,
      embedding: dbDream.embedding,
    };
  }
}
```

### Real-time Dream Updates
```typescript
// hooks/useDreamSubscription.ts
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useDreamStore } from '../stores/dreamStore';

export const useDreamSubscription = (userId: string) => {
  const { addDream, updateDream, removeDream } = useDreamStore();

  useEffect(() => {
    const subscription = supabase
      .channel('dreams')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dreams',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          addDream(DreamService.mapDreamFromDB(payload.new));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dreams',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          updateDream(payload.new.id, DreamService.mapDreamFromDB(payload.new));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'dreams',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          removeDream(payload.old.id);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, addDream, updateDream, removeDream]);
};
```

## Vector Embeddings API

### Vector Search Function
The database includes a `match_dreams` function for semantic similarity search:

```sql
CREATE OR REPLACE FUNCTION match_dreams(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10,
  filter_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  raw_transcript text,
  refined_narrative text,
  created_at timestamp with time zone,
  similarity float
)
```

### Embedding Generation Service
```typescript
// services/embeddingService.ts
import { pipeline } from '@xenova/transformers';

export class EmbeddingService {
  private static embeddingModel: any = null;

  static async initializeModel() {
    if (!this.embeddingModel) {
      this.embeddingModel = await pipeline(
        'feature-extraction',
        'Supabase/gte-small'
      );
    }
    return this.embeddingModel;
  }

  static async generateEmbedding(text: string): Promise<number[]> {
    const model = await this.initializeModel();
    
    const output = await model(text, {
      pooling: 'mean',
      normalize: true,
    });

    return Array.from(output.data);
  }

  static async searchSimilarDreams(
    query: string,
    userId?: string,
    threshold: number = 0.78,
    limit: number = 10
  ): Promise<Dream[]> {
    const queryEmbedding = await this.generateEmbedding(query);

    const { data, error } = await supabase.rpc('match_dreams', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_user_id: userId,
    });

    if (error) throw error;
    return data || [];
  }

  static async updateDreamEmbedding(dreamId: string, content: string): Promise<void> {
    const embedding = await this.generateEmbedding(content);

    const { error } = await supabase
      .from('dreams')
      .update({ embedding })
      .eq('id', dreamId);

    if (error) throw error;
  }
}
```

## Database Functions and Triggers

### Automatic Profile Creation
The database includes an automatic trigger that creates a user profile when a new user signs up:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users_profile (id, username, display_name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'username', 'user_' || substr(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Automatic Timestamp Updates
The database includes triggers to automatically update the `updated_at` timestamp:

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$;

CREATE TRIGGER handle_users_profile_updated_at
  BEFORE UPDATE ON public.users_profile
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_dreams_updated_at
  BEFORE UPDATE ON public.dreams
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
```

## File Storage API

### Audio Recording Storage
```typescript
// services/storageService.ts
export class StorageService {
  static async uploadAudioRecording(
    dreamId: string,
    audioBlob: Blob,
    userId: string
  ): Promise<string> {
    const fileName = `${userId}/${dreamId}/recording.webm`;
    
    const { data, error } = await supabase.storage
      .from('dream-recordings')
      .upload(fileName, audioBlob, {
        contentType: 'audio/webm',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('dream-recordings')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  static async deleteAudioRecording(dreamId: string, userId: string): Promise<void> {
    const fileName = `${userId}/${dreamId}/recording.webm`;
    
    const { error } = await supabase.storage
      .from('dream-recordings')
      .remove([fileName]);

    if (error) throw error;
  }

  static async uploadProfileAvatar(
    userId: string,
    imageBlob: Blob
  ): Promise<string> {
    const fileName = `${userId}/avatar.jpg`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, imageBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }
}
```

## Error Handling

### API Error Types
```typescript
// types/errors.ts
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export class SupabaseError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export const handleSupabaseError = (error: any): never => {
  if (error.code) {
    throw new SupabaseError(error.code, error.message, error.details);
  }
  throw new Error(error.message || 'Unknown error occurred');
};
```

### Error Handling Wrapper
```typescript
// utils/apiWrapper.ts
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    console.error('API Error:', error);
    
    if (error.code === 'PGRST116') {
      throw new Error('Resource not found');
    }
    
    if (error.code === '23505') {
      throw new Error('Resource already exists');
    }
    
    if (error.message?.includes('JWT')) {
      throw new Error('Authentication required');
    }
    
    throw error;
  }
};
```

## Rate Limiting and Optimization

### Request Batching
```typescript
// utils/batchRequests.ts
export class RequestBatcher {
  private static batches: Map<string, any[]> = new Map();
  private static timeouts: Map<string, NodeJS.Timeout> = new Map();

  static async batchRequest<T>(
    key: string,
    request: () => Promise<T>,
    delay: number = 100
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(key)) {
        this.batches.set(key, []);
      }

      this.batches.get(key)!.push({ resolve, reject, request });

      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key)!);
      }

      this.timeouts.set(key, setTimeout(async () => {
        const batch = this.batches.get(key) || [];
        this.batches.delete(key);
        this.timeouts.delete(key);

        try {
          const results = await Promise.all(
            batch.map(item => item.request())
          );
          batch.forEach((item, index) => {
            item.resolve(results[index]);
          });
        } catch (error) {
          batch.forEach(item => {
            item.reject(error);
          });
        }
      }, delay));
    });
  }
}
```

This API reference provides a comprehensive guide to all backend integrations and data operations in the Somni project. Use these patterns and examples as the foundation for all API-related development.