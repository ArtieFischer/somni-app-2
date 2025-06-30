import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Dream, 
  DreamDTO, 
  DreamStore,
  DreamStats,
  DreamSearchQuery,
  DreamSearchResult,
  RecordingSession,
  DreamEntity
} from '@somni/types';

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
          set(state => {
            const updatedDreams = state.dreams.map(dream => {
              if (dream.id === dreamId) {
                const updatedDream = DreamEntity.update(dream, updates);
                console.log('📝 Updating dream in store:', {
                  dreamId,
                  oldImageUrl: dream.image_url,
                  newImageUrl: updatedDream.image_url,
                  updates
                });
                return updatedDream;
              }
              return dream;
            });
            
            return { dreams: updatedDreams };
          });
          
          // Update stats
          get().updateStats();
          
          const updatedDream = get().getDreamById(dreamId);
          console.log('📝 Updated dream:', dreamId, {
            hasImageUrl: !!updatedDream?.image_url,
            imageUrl: updatedDream?.image_url
          });
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
        // Map old status to new transcription_status
        const transcriptionStatus = 
          status === 'completed' ? 'completed' :
          status === 'failed' ? 'failed' :
          status === 'transcribing' ? 'processing' :
          'pending';
        return get().dreams.filter(dream => dream.transcription_status === transcriptionStatus);
      },

      // Enhanced search with full query support
      searchDreams: (query) => {
        const { dreams } = get();
        let filteredDreams = [...dreams];

        // Text search
        if (query.text) {
          const searchTerm = query.text.toLowerCase();
          filteredDreams = filteredDreams.filter(dream => 
            (dream.raw_transcript || '').toLowerCase().includes(searchTerm) ||
            (dream.title || '').toLowerCase().includes(searchTerm)
          );
        }

        // Status filter (map old status to transcription_status)
        if (query.status && query.status.length > 0) {
          const mappedStatuses = query.status.map(status => 
            status === 'completed' ? 'completed' :
            status === 'failed' ? 'failed' :
            status === 'transcribing' ? 'processing' :
            'pending'
          );
          filteredDreams = filteredDreams.filter(dream => 
            mappedStatuses.includes(dream.transcription_status)
          );
        }

        // Date range filter
        if (query.dateFrom || query.dateTo) {
          filteredDreams = filteredDreams.filter(dream => {
            const dreamDate = new Date(dream.created_at);
            const fromDate = query.dateFrom ? new Date(query.dateFrom) : new Date(0);
            const toDate = query.dateTo ? new Date(query.dateTo) : new Date();
            return dreamDate >= fromDate && dreamDate <= toDate;
          });
        }

        // Duration filter (using legacy field)
        if (query.minDuration !== undefined || query.maxDuration !== undefined) {
          filteredDreams = filteredDreams.filter(dream => {
            const minDur = query.minDuration ?? 0;
            const maxDur = query.maxDuration ?? Infinity;
            const duration = dream.duration || 0;
            return duration >= minDur && duration <= maxDur;
          });
        }

        // Confidence filter - map to clarity
        if (query.minConfidence !== undefined) {
          filteredDreams = filteredDreams.filter(dream => {
            const clarity = (dream.clarity || 50) / 100; // Convert 1-100 to 0-1
            return clarity >= query.minConfidence!;
          });
        }

        // Tags filter - deprecated, always return empty
        if (query.tags && query.tags.length > 0) {
          filteredDreams = [];
        }

        // Emotions filter - deprecated, filter by mood instead
        if (query.emotions && query.emotions.length > 0) {
          // For now, just ignore emotions filter
          // In future, could map emotions to mood ranges
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
          const dreamDate = new Date(dream.created_at);
          return dreamDate >= start && dreamDate <= end;
        });
      },

      // Enhanced statistics
      updateStats: () => {
        const dreams = get().dreams;
        const totalDuration = dreams.reduce((sum, dream) => sum + (dream.duration || 0), 0);
        const lastRecording = dreams.length > 0 ? dreams[0].created_at : null;
        
        set({
          totalDreams: dreams.length,
          totalRecordingTime: totalDuration,
          lastRecordingDate: lastRecording
        });
      },

      getDreamStats: () => {
        const dreams = get().dreams;
        const completedDreams = dreams.filter(d => d.transcription_status === 'completed');
        const pendingDreams = dreams.filter(d => d.transcription_status === 'pending');
        const transcribingDreams = dreams.filter(d => d.transcription_status === 'processing');
        const failedDreams = dreams.filter(d => d.transcription_status === 'failed');
        
        const totalDuration = dreams.reduce((sum, dream) => sum + (dream.duration || 0), 0);
        const totalMood = dreams.reduce((sum, dream) => sum + (dream.mood || 0), 0);
        const totalClarity = dreams.reduce((sum, dream) => sum + (dream.clarity || 0), 0);
        
        // Time-based stats
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const dreamsThisWeek = dreams.filter(d => new Date(d.created_at) >= weekAgo).length;
        const dreamsThisMonth = dreams.filter(d => new Date(d.created_at) >= monthAgo).length;
        
        // Quality stats based on clarity
        const highClarityDreams = dreams.filter(d => (d.clarity || 0) > 90).length;
        const lucidDreams = dreams.filter(d => d.is_lucid).length;
        
        // Mood stats
        const dreamsWithMood = dreams.filter(d => d.mood !== undefined);
        const averageMood = dreamsWithMood.length > 0 
          ? dreamsWithMood.reduce((sum, d) => sum + (d.mood || 0), 0) / dreamsWithMood.length 
          : 0;
        
        // Location stats
        const dreamsWithLocation = dreams.filter(d => d.location_metadata !== null && d.location_metadata !== undefined);
        const locationCounts = dreamsWithLocation.reduce((acc, dream) => {
          const country = dream.location_metadata?.country || 'Unknown';
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const mostCommonLocations = Object.entries(locationCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([country, count]) => ({ country, count }));
        
        // Calculate average mood and clarity
        const dreamsWithClarity = dreams.filter(d => d.clarity !== undefined);
        const averageClarity = dreamsWithClarity.length > 0
          ? dreamsWithClarity.reduce((sum, d) => sum + (d.clarity || 0), 0) / dreamsWithClarity.length
          : 50;
        
        // Empty arrays for deprecated fields
        const mostCommonTags: Array<{ tag: string; count: number }> = [];
        const mostCommonEmotions: Array<{ emotion: string; count: number }> = [];

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
            !longest || (dream.duration || 0) > (longest.duration || 0) ? dream : longest, 
            null as Dream | null
          ),
          shortestDream: dreams.reduce((shortest, dream) => 
            !shortest || (dream.duration || 0) < (shortest.duration || 0) ? dream : shortest, 
            null as Dream | null
          ),
          
          // Quality stats
          averageConfidence: totalClarity > 0 ? (totalClarity / dreams.length) / 100 : 0, // Convert back to 0-1
          highConfidenceDreams: highClarityDreams,
          editedDreams: 0, // Deprecated
          
          // Content stats
          mostCommonTags,
          mostCommonEmotions,
          
          // Additional stats
          averageMood,
          averageClarity
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
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential data, not transient states
      partialize: (state) => ({ 
        dreams: state.dreams,
        totalDreams: state.totalDreams,
        totalRecordingTime: state.totalRecordingTime,
        lastRecordingDate: state.lastRecordingDate,
        // Include required state properties with default values
        recordingSession: null,
        isRecording: false,
        error: null,
        isLoading: false
        // Don't persist actual transient states, use defaults
      })
    }
  )
);