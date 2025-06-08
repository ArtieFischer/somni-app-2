import { Dream as DreamType, SleepPhase } from '@somni/types';

export class Dream {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly rawTranscript: string,
    public readonly refinedNarrative?: string,
    public readonly audioUrl?: string,
    public readonly sleepPhase?: SleepPhase,
    public readonly isLucid?: boolean,
    public readonly moodBefore?: number,
    public readonly moodAfter?: number,
    public readonly createdAt?: string,
    public readonly updatedAt?: string,
    public readonly embedding?: number[]
  ) {}

  static create(dreamData: Partial<DreamType>): Dream {
    this.validateDreamData(dreamData);
    
    return new Dream(
      dreamData.id || this.generateId(),
      dreamData.user_id!,
      dreamData.raw_transcript!,
      dreamData.refined_narrative,
      dreamData.audio_url,
      dreamData.sleep_phase,
      dreamData.is_lucid,
      dreamData.mood_before,
      dreamData.mood_after,
      dreamData.created_at || new Date().toISOString(),
      dreamData.updated_at,
      dreamData.embedding
    );
  }

  private static validateDreamData(data: Partial<DreamType>): void {
    if (!data.user_id) {
      throw new Error('User ID is required');
    }
    if (!data.raw_transcript || data.raw_transcript.trim().length === 0) {
      throw new Error('Raw transcript is required');
    }
    if (data.mood_before && (data.mood_before < 1 || data.mood_before > 5)) {
      throw new Error('Mood before must be between 1 and 5');
    }
    if (data.mood_after && (data.mood_after < 1 || data.mood_after > 5)) {
      throw new Error('Mood after must be between 1 and 5');
    }
  }

  private static generateId(): string {
    return `dream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  toDTO(): DreamType {
    return {
      id: this.id,
      user_id: this.userId,
      raw_transcript: this.rawTranscript,
      refined_narrative: this.refinedNarrative,
      audio_url: this.audioUrl,
      sleep_phase: this.sleepPhase,
      is_lucid: this.isLucid,
      mood_before: this.moodBefore,
      mood_after: this.moodAfter,
      created_at: this.createdAt!,
      updated_at: this.updatedAt,
      embedding: this.embedding
    };
  }
}