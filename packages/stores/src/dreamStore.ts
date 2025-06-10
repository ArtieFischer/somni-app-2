import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Dream, 
  DreamDTO, 
  DreamStore,
  DreamStats,
  DreamSearchQuery,
  DreamSearchResult,
  RecordingSession 
} from '@somni/types';
import { DreamEntity } from '@somni/types/dreamEntity';

// Create the store
export const useDreamStore = create<DreamStore>()(
  persist(
    (set, get) => ({
      // Initial state
      dreams: [],
      recordingSession: null,
      isRecording: false,
      error: null,
      isLoading: false,
      totalDreams: 0,
      totalRecordingTime: 0,
      lastRecordingDate: null,

      // Recording session actions
      startRecording: () => {
        const sessionId = DreamEntity.generateId().replace('dream_', 'session_');
        const startTime = new Date().toISOString();
        
        set({
          isRecording: true,
          recordingSession: {
            id: sessionId,
            status: 'recording',
            startTime,
            duration: 0,
            deviceInfo: {
              platform: 'mobile',
              version: '1.0.0'
            }
          },
          error: null
        });
        
        console.log('🎤 Started recording session:', sessionId);
      },

      stopRecording: () => {
        const currentSession = get().recordingSession;
        if (!currentSession) return;

        const endTime = new Date().toISOString();
        const duration = currentSession.startTime 
          ? Math.floor((new Date(endTime).getTime() - new Date(currentSession.startTime).getTime()) / 1000)
          : 0;

        set({
          isRecording: false,
          recordingSession: {
            ...currentSession,
            status: 'processing',
            endTime,
            duration
          }
        });
        
        console.log('⏹️ Stopped recording session:', currentSession.id, `Duration: ${duration}s`);
      },

      updateRecordingSession: (updates) => {
        const currentSession = get().recordingSession;
        if (!currentSession) return;

        set({
          recordingSession: {
            ...currentSession,
            ...updates
          }
        });
        
        console.log('📝 Updated recording session:', currentSession.id, updates);
      },

      clearRecordingSession: () => {
        set({ recordingSession: null });
        console.log('🗑️ Cleared recording session');
      },

      setRecordingError: (error) => {
        const currentSession = get().recordingSession;
        if (!currentSession) return;

        set({
          isRecording: false,
          recordingSession: {
            ...currentSession,
            status: 'error',
            error
          },
          error
        });
        
        console.error('❌ Recording session error:', error);
      },

      // Dream management actions
      addDream: (dreamDTO) => {
        try {
          const dream = DreamEntity.create(dreamDTO);
          
          set(state => {
            const existingIndex = state.dreams.findIndex(d => d.id === dream.id);
            let updatedDreams;
            
            if (existingIndex >= 0) {
              // Update existing dream
              updatedDreams = [...state.dreams];
              updatedDreams[existingIndex] = dream;
            } else {
              // Add new dream at the beginning (most recent first)
              updatedDreams = [dream, ...state.dreams];
            }
            
            return { dreams: updatedDreams };
          });

          // Update stats
          get().updateStats();
          
          console.log('💭 Added/Updated dream:', dream.id);
          return dream;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create dream';
          get().setError(errorMessage);
          throw error;
        }
      },

      updateDream: (dreamId, updates) => {
        try {
          set(state => ({
            dreams: state.dreams.map(dream => 
              dream.id === dreamId 
                ? DreamEntity.update(dream, updates)
                : dream
            )
          }));
          
          // Update stats
          get().updateStats();
          
          console.log('📝 Updated dream:', dreamId, updates);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update dream';
          get().setError(errorMessage);
        }
      },

      deleteDream: (dreamId) => {
        set(state => ({
          dreams: state.dreams.filter(dream => dream.id !== dreamId)
        }));
        
        // Update stats
        get().updateStats();
        
        console.log('🗑️ Deleted dream:', dreamId);
      },

      getDreamById: (id) => {
        return get().dreams.find(dream => dream.id === id);
      },

      getDreamsByStatus: (status) => {
        return get().dreams.filter(dream => dream.status === status);
      },

      // Enhanced search with full query support
      searchDreams: (query) => {
        const { dreams } = get();
        let filteredDreams = [...dreams];

        // Text search
        if (query.text) {
          const searchTerm = query.text.toLowerCase();
          filteredDreams = filteredDreams.filter(dream => 
            dream.rawTranscript.toLowerCase().includes(searchTerm) ||
            dream.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            dream.emotions?.some(emotion => emotion.toLowerCase().includes(searchTerm))
          );
        }

        // Status filter
        if (query.status && query.status.length > 0) {
          filteredDreams = filteredDreams.filter(dream => 
            query.status!.includes(dream.status)
          );
        }

        // Date range filter
        if (query.dateFrom || query.dateTo) {
          filteredDreams = filteredDreams.filter(dream => {
            const dreamDate = new Date(dream.recordedAt);
            const fromDate = query.dateFrom ? new Date(query.dateFrom) : new Date(0);
            const toDate = query.dateTo ? new Date(query.dateTo) : new Date();
            return dreamDate >= fromDate && dreamDate <= toDate;
          });
        }

        // Duration filter
        if (query.minDuration !== undefined || query.maxDuration !== undefined) {
          filteredDreams = filteredDreams.filter(dream => {
            const minDur = query.minDuration ?? 0;
            const maxDur = query.maxDuration ?? Infinity;
            return dream.duration >= minDur && dream.duration <= maxDur;
          });
        }

        // Confidence filter
        if (query.minConfidence !== undefined) {
          filteredDreams = filteredDreams.filter(dream => 
            dream.confidence >= query.minConfidence!
          );
        }

        // Tags filter
        if (query.tags && query.tags.length > 0) {
          filteredDreams = filteredDreams.filter(dream =>
            dream.tags?.some(tag => query.tags!.includes(tag))
          );
        }

        // Emotions filter
        if (query.emotions && query.emotions.length > 0) {
          filteredDreams = filteredDreams.filter(dream =>
            dream.emotions?.some(emotion => query.emotions!.includes(emotion))
          );
        }

        return {
          dreams: filteredDreams,
          totalCount: filteredDreams.length,
          hasMore: false,
          query
        };
      },

      getDreamsByDateRange: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return get().dreams.filter(dream => {
          const dreamDate = new Date(dream.recordedAt);
          return dreamDate >= start && dreamDate <= end;
        });
      },

      // Enhanced statistics
      updateStats: () => {
        const dreams = get().dreams;
        const totalDuration = dreams.reduce((sum, dream) => sum + dream.duration, 0);
        const lastRecording = dreams.length > 0 ? dreams[0].recordedAt : null;
        
        set({
          totalDreams: dreams.length,
          totalRecordingTime: totalDuration,
          lastRecordingDate: lastRecording
        });
      },

      getDreamStats: () => {
        const dreams = get().dreams;
        const completedDreams = dreams.filter(d => d.status === 'completed');
        const pendingDreams = dreams.filter(d => d.status === 'pending');
        const transcribingDreams = dreams.filter(d => d.status === 'transcribing');
        const failedDreams = dreams.filter(d => d.status === 'failed');
        
        const totalDuration = dreams.reduce((sum, dream) => sum + dream.duration, 0);
        const totalConfidence = dreams.reduce((sum, dream) => sum + dream.confidence, 0);
        
        // Time-based stats
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const dreamsThisWeek = dreams.filter(d => new Date(d.recordedAt) >= weekAgo).length;
        const dreamsThisMonth = dreams.filter(d => new Date(d.recordedAt) >= monthAgo).length;
        
        // Quality stats
        const highConfidenceDreams = dreams.filter(d => d.confidence > 0.9).length;
        const editedDreams = dreams.filter(d => d.wasEdited).length;
        
        // Content stats
        const allTags = dreams.flatMap(d => d.tags || []);
        const allEmotions = dreams.flatMap(d => d.emotions || []);
        
        const tagCounts = allTags.reduce((acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const emotionCounts = allEmotions.reduce((acc, emotion) => {
          acc[emotion] = (acc[emotion] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const mostCommonTags = Object.entries(tagCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([tag, count]) => ({ tag, count }));
          
        const mostCommonEmotions = Object.entries(emotionCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([emotion, count]) => ({ emotion, count }));

        return {
          totalDreams: dreams.length,
          totalDuration,
          averageDuration: dreams.length > 0 ? totalDuration / dreams.length : 0,
          completedDreams: completedDreams.length,
          pendingDreams: pendingDreams.length,
          transcribingDreams: transcribingDreams.length,
          failedDreams: failedDreams.length,
          
          // Time-based stats
          dreamsThisWeek,
          dreamsThisMonth,
          longestDream: dreams.reduce((longest, dream) => 
            !longest || dream.duration > longest.duration ? dream : longest, 
            null as Dream | null
          ),
          shortestDream: dreams.reduce((shortest, dream) => 
            !shortest || dream.duration < shortest.duration ? dream : shortest, 
            null as Dream | null
          ),
          
          // Quality stats
          averageConfidence: dreams.length > 0 ? totalConfidence / dreams.length : 0,
          highConfidenceDreams,
          editedDreams,
          
          // Content stats
          mostCommonTags,
          mostCommonEmotions
        };
      },

      // Error handling
      setError: (error) => {
        set({ error });
        if (error) {
          console.error('🚨 Dream store error:', error);
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // Loading states
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Data management
      clearAllData: () => {
        set({
          dreams: [],
          recordingSession: null,
          isRecording: false,
          error: null,
          isLoading: false,
          totalDreams: 0,
          totalRecordingTime: 0,
          lastRecordingDate: null
        });
        
        console.log('🗑️ Cleared all dream data');
      },

      // Export/Import functionality
      exportDreams: () => {
        return get().dreams.map(dream => DreamEntity.toDTO(dream));
      },

      importDreams: (dreamDTOs) => {
        try {
          const validDreams = dreamDTOs
            .map(dto => DreamEntity.create(dto))
            .filter(Boolean);
          
          set(state => ({
            dreams: [...validDreams, ...state.dreams]
          }));
          
          get().updateStats();
          console.log(`📥 Imported ${validDreams.length} dreams`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to import dreams';
          get().setError(errorMessage);
        }
      }
    }),
    {
      name: 'somni-dream-store',
      // Only persist essential data, not transient states
      partialize: (state) => ({ 
        dreams: state.dreams,
        totalDreams: state.totalDreams,
        totalRecordingTime: state.totalRecordingTime,
        lastRecordingDate: state.lastRecordingDate
        // Don't persist: recordingSession, isRecording, error, isLoading
      })
    }
  )
);