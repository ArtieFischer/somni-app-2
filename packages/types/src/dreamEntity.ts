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
      userId: dto.userId,
      rawTranscript: dto.rawTranscript?.trim() || '',
      duration: Math.max(0, dto.duration || 0),
      confidence: Math.min(1, Math.max(0, dto.confidence || 0)),
      wasEdited: dto.wasEdited || false,
      recordedAt: dto.recordedAt || now,
      createdAt: dto.createdAt || now,
      status: dto.status || 'pending',
      audioUri: dto.audioUri,
      fileSize: dto.fileSize ? Math.max(0, dto.fileSize) : undefined,
      tags: dto.tags ? [...new Set(dto.tags.filter(Boolean))] : [], // Remove duplicates and empty strings
      emotions: dto.emotions ? [...new Set(dto.emotions.filter(Boolean))] : [],
      updatedAt: dto.updatedAt || now,
      version: dto.version || 1,
      metadata: dto.metadata || {}
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
      userId: dream.userId,
      rawTranscript: dream.rawTranscript,
      duration: dream.duration,
      confidence: dream.confidence,
      wasEdited: dream.wasEdited,
      recordedAt: dream.recordedAt,
      createdAt: dream.createdAt,
      status: dream.status,
      audioUri: dream.audioUri,
      fileSize: dream.fileSize,
      tags: dream.tags,
      emotions: dream.emotions,
      updatedAt: dream.updatedAt,
      version: dream.version,
      metadata: dream.metadata
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
    if (!dream.userId?.trim()) {
      errors.push({
        field: 'userId',
        message: 'User ID is required',
        code: 'REQUIRED'
      });
    }

    if (!dream.rawTranscript?.trim()) {
      errors.push({
        field: 'rawTranscript',
        message: 'Transcript cannot be empty',
        code: 'REQUIRED'
      });
    }

    // Duration validation
    if (typeof dream.duration !== 'number' || dream.duration < 0) {
      errors.push({
        field: 'duration',
        message: 'Duration must be a positive number',
        code: 'INVALID_RANGE'
      });
    }

    if (dream.duration && dream.duration > 3600) { // 1 hour max
      errors.push({
        field: 'duration',
        message: 'Duration cannot exceed 1 hour',
        code: 'INVALID_RANGE'
      });
    }

    // Confidence validation
    if (typeof dream.confidence !== 'number' || dream.confidence < 0 || dream.confidence > 1) {
      errors.push({
        field: 'confidence',
        message: 'Confidence must be between 0 and 1',
        code: 'INVALID_RANGE'
      });
    }

    // Date validation
    if (dream.recordedAt && isNaN(new Date(dream.recordedAt).getTime())) {
      errors.push({
        field: 'recordedAt',
        message: 'Invalid recorded date',
        code: 'INVALID_FORMAT'
      });
    }

    if (dream.createdAt && isNaN(new Date(dream.createdAt).getTime())) {
      errors.push({
        field: 'createdAt',
        message: 'Invalid created date',
        code: 'INVALID_FORMAT'
      });
    }

    // File size validation
    if (dream.fileSize && (dream.fileSize < 0 || dream.fileSize > 100 * 1024 * 1024)) { // 100MB max
      errors.push({
        field: 'fileSize',
        message: 'File size must be between 0 and 100MB',
        code: 'INVALID_RANGE'
      });
    }

    // Tags validation
    if (dream.tags && dream.tags.length > 20) {
      errors.push({
        field: 'tags',
        message: 'Cannot have more than 20 tags',
        code: 'INVALID_RANGE'
      });
    }

    // Emotions validation
    if (dream.emotions && dream.emotions.length > 10) {
      errors.push({
        field: 'emotions',
        message: 'Cannot have more than 10 emotions',
        code: 'INVALID_RANGE'
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
    return dream.status === 'completed' || dream.status === 'failed';
  }

  /**
   * Check if dream is in progress
   */
  static isInProgress(dream: Dream): boolean {
    return dream.status === 'transcribing' || dream.status === 'pending';
  }

  /**
   * Get dream age in days
   */
  static getAgeInDays(dream: Dream): number {
    const now = new Date();
    const recordedDate = new Date(dream.recordedAt);
    const diffTime = Math.abs(now.getTime() - recordedDate.getTime());
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
   * Get dream quality rating based on confidence and duration
   */
  static getQualityRating(dream: Dream): 'excellent' | 'good' | 'fair' | 'poor' {
    const confidence = dream.confidence;
    const duration = dream.duration;
    
    if (confidence >= 0.9 && duration >= 30) return 'excellent';
    if (confidence >= 0.7 && duration >= 15) return 'good';
    if (confidence >= 0.5 && duration >= 5) return 'fair';
    return 'poor';
  }

  /**
   * Extract keywords from transcript (simple implementation)
   */
  static extractKeywords(dream: Dream): string[] {
    const words = dream.rawTranscript
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