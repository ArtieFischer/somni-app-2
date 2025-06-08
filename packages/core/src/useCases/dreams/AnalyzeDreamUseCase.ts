import { Dream } from '../../entities/Dream';
import { IDreamRepository } from '../../repositories/IDreamRepository';

export interface AnalyzeDreamRequest {
  dreamId: string;
  analysisTypes: ('freudian' | 'jungian' | 'spiritual' | 'neurobiological' | 'cognitive' | 'personal_pattern')[];
}

export interface DreamAnalysis {
  id: string;
  dreamId: string;
  analysisType: string;
  content: string;
  confidence?: number;
  keyInsights: string[];
  suggestedActions: string[];
}

export class AnalyzeDreamUseCase {
  constructor(
    private dreamRepository: IDreamRepository
  ) {}

  async execute(request: AnalyzeDreamRequest): Promise<DreamAnalysis[]> {
    try {
      // Get the dream
      const dreamData = await this.dreamRepository.findById(request.dreamId);
      if (!dreamData) {
        throw new Error('Dream not found');
      }

      const dream = Dream.create(dreamData);
      
      // For now, return mock analysis - this will be replaced with actual AI service
      const analyses: DreamAnalysis[] = request.analysisTypes.map(type => ({
        id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        dreamId: dream.id,
        analysisType: type,
        content: `${type} analysis of the dream: "${dream.rawTranscript.substring(0, 50)}..."`,
        confidence: 0.85,
        keyInsights: [`Key insight from ${type} perspective`],
        suggestedActions: [`Suggested action based on ${type} analysis`]
      }));

      return analyses;
    } catch (error) {
      throw new Error(`Failed to analyze dream: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}