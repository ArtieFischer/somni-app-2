import { Dream, DreamDTO, DreamValidationError, DreamValidationResult } from './dream';

/**
 * Dream Entity - Domain logic for Dream objects
 * Handles creation, validation, and transformations
 */
export class DreamEntity {
  /**
   * Create a Dream from DTO with proper defaults and validation
   */
  static create(dto: DreamDTO): Dream {
    const now = new Date().toISOString();
    
    const dream: Dream = {
      id: dto.id || DreamEntity.generateId(),
      user_id: dto.user_id,
      raw_transcript: dto.raw_transcript?.trim() || '',
      title: dto.title,
      is_lucid: dto.is_lucid || false,
      mood: dto.mood,
      clarity: dto.clarity,
      location_metadata: dto.location_metadata,
      transcription_status: dto.transcription_status || 'pending',
      transcription_metadata: dto.transcription_metadata,
      transcription_job_id: dto.transcription_job_id,
      image_prompt: dto.image_prompt,
      created_at: dto.created_at || now,
      updated_at: dto.updated_at || now,
      
      // Legacy fields for backward compatibility
      userId: dto.user_id,
      rawTranscript: dto.raw_transcript?.trim() || '',
      createdAt: dto.created_at || now,
      updatedAt: dto.updated_at || now,
      recordedAt: dto.created_at || now,
      duration: dto.duration || (dto as any).duration || 0, // Preserve duration for display
      confidence: 1, // Deprecated
      wasEdited: false, // Deprecated
      status: (dto.transcription_status === 'completed' || dto.transcription_status === 'done') ? 'completed' : 
              (dto.transcription_status === 'failed' || dto.transcription_status === 'error') ? 'failed' :
              dto.transcription_status === 'processing' ? 'transcribing' : 'pending',
      audioUri: (dto as any).audioUri, // Preserve audioUri for postponed dreams
      fileSize: (dto as any).fileSize, // Preserve fileSize if provided
      tags: [], // Deprecated
      emotions: [] // Deprecated
    };

    const validation = DreamEntity.validate(dream);
    if (!validation.isValid) {
      throw new Error(`Invalid dream data: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    return dream;
  }

  /**
   * Convert Dream to DTO for API/storage
   */
  static toDTO(dream: Dream): DreamDTO {
    return {
      id: dream.id,
      user_id: dream.user_id,
      raw_transcript: dream.raw_transcript,
      title: dream.title,
      is_lucid: dream.is_lucid,
      mood: dream.mood,
      clarity: dream.clarity,
      location_metadata: dream.location_metadata,
      transcription_status: dream.transcription_status,
      transcription_metadata: dream.transcription_metadata,
      transcription_job_id: dream.transcription_job_id,
      image_prompt: dream.image_prompt,
      created_at: dream.created_at,
      updated_at: dream.updated_at
    };
  }

  /**
   * Update dream with new data, preserving immutability
   */
  static update(dream: Dream, updates: Partial<DreamDTO>): Dream {
    const updatedDTO: DreamDTO = {
      ...DreamEntity.toDTO(dream),
      ...updates,
      updatedAt: new Date().toISOString(),
      version: (dream.version || 1) + 1
    };

    return DreamEntity.create(updatedDTO);
  }

  /**
   * Generate unique dream ID
   */
  static generateId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `dream_${timestamp}_${random}`;
  }

  /**
   * Validate dream data
   */
  static validate(dream: Partial<Dream>): DreamValidationResult {
    const errors: DreamValidationError[] = [];

    // Required fields
    if (!dream.user_id?.trim()) {
      errors.push({
        field: 'user_id' as keyof Dream,
        message: 'User ID is required',
        code: 'REQUIRED'
      });
    }

    // Allow empty transcript for pending/processing dreams and legacy completed dreams
    if (!dream.raw_transcript?.trim() && 
        dream.transcription_status !== 'pending' && 
        dream.transcription_status !== 'processing' &&
        dream.transcription_status !== 'completed' &&
        dream.transcription_status !== 'done') {
      errors.push({
        field: 'raw_transcript' as keyof Dream,
        message: 'Transcript cannot be empty',
        code: 'REQUIRED'
      });
    }

    // Mood validation (1-5)
    if (dream.mood !== undefined && (dream.mood < 1 || dream.mood > 5)) {
      errors.push({
        field: 'mood' as keyof Dream,
        message: 'Mood must be between 1 and 5',
        code: 'INVALID_RANGE'
      });
    }

    // Clarity validation (1-100)
    if (dream.clarity !== undefined && (dream.clarity < 1 || dream.clarity > 100)) {
      errors.push({
        field: 'clarity' as keyof Dream,
        message: 'Clarity must be between 1 and 100',
        code: 'INVALID_RANGE'
      });
    }

    // Date validation
    if (dream.created_at && isNaN(new Date(dream.created_at).getTime())) {
      errors.push({
        field: 'created_at' as keyof Dream,
        message: 'Invalid created date',
        code: 'INVALID_FORMAT'
      });
    }

    if (dream.updated_at && isNaN(new Date(dream.updated_at).getTime())) {
      errors.push({
        field: 'updated_at' as keyof Dream,
        message: 'Invalid updated date',
        code: 'INVALID_FORMAT'
      });
    }

    // Location metadata validation
    if (dream.location_metadata) {
      if (dream.location_metadata.method && 
          !['manual', 'gps'].includes(dream.location_metadata.method)) {
        errors.push({
          field: 'location_metadata' as keyof Dream,
          message: 'Location method must be either "manual" or "gps"',
          code: 'INVALID_VALUE'
        });
      }
    }

    // Transcription status validation (including legacy values)
    if (dream.transcription_status && 
        !['pending', 'processing', 'completed', 'failed', 'done', 'error'].includes(dream.transcription_status)) {
      errors.push({
        field: 'transcription_status' as keyof Dream,
        message: 'Invalid transcription status',
        code: 'INVALID_VALUE'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if dream is editable
   */
  static isEditable(dream: Dream): boolean {
    return dream.transcription_status === 'done' || dream.transcription_status === 'error';
  }

  /**
   * Check if dream is in progress
   */
  static isInProgress(dream: Dream): boolean {
    return dream.transcription_status === 'processing' || dream.transcription_status === 'pending';
  }

  /**
   * Get dream age in days
   */
  static getAgeInDays(dream: Dream): number {
    const now = new Date();
    const createdDate = new Date(dream.created_at);
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Format duration as human readable string
   */
  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }

  /**
   * Get dream quality rating based on mood and clarity
   */
  static getQualityRating(dream: Dream): 'excellent' | 'good' | 'fair' | 'poor' {
    const mood = dream.mood || 3;
    const clarity = dream.clarity || 50;
    
    if (mood >= 4 && clarity >= 80) return 'excellent';
    if (mood >= 3 && clarity >= 60) return 'good';
    if (mood >= 2 && clarity >= 40) return 'fair';
    return 'poor';
  }

  /**
   * Extract keywords from transcript (simple implementation)
   */
  static extractKeywords(dream: Dream): string[] {
    const words = (dream.raw_transcript || '')
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Simple frequency analysis
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .filter(([_, count]) => count > 1)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }
}