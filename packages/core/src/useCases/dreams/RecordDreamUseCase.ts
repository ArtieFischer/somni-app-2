import { Dream } from '../../entities/Dream';
import { IDreamRepository } from '../../repositories/IDreamRepository';

export interface RecordDreamRequest {
  userId: string;
  rawTranscript: string;
  audioUrl?: string;
  sleepPhase?: string;
  moodBefore?: number;
}

export class RecordDreamUseCase {
  constructor(
    private dreamRepository: IDreamRepository
  ) {}

  async execute(request: RecordDreamRequest): Promise<Dream> {
    try {
      // Create dream entity with validation
      const dream = Dream.create({
        user_id: request.userId,
        raw_transcript: request.rawTranscript,
        audio_url: request.audioUrl,
        sleep_phase: request.sleepPhase as any,
        mood_before: request.moodBefore,
        is_lucid: false, // Default to false, can be updated later
      });

      // Save to repository
      const savedDream = await this.dreamRepository.save(dream.toDTO());
      
      return Dream.create(savedDream);
    } catch (error) {
      throw new Error(`Failed to record dream: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}