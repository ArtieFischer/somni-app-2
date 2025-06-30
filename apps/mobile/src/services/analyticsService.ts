import { supabase } from '../lib/supabase';
import { Dream } from '@somni/types';
import { Interpretation } from './interpretationService';

interface DreamAnalytics {
  // Time-based patterns
  dreamsByHour: Array<{ hour: number; count: number; avgMood?: number }>;
  dreamsByDayOfWeek: Array<{ day: string; count: number; avgMood?: number }>;
  dreamsByMonth: Array<{ month: string; year: number; count: number }>;
  
  // Quality metrics
  moodTrend: Array<{ date: string; avgMood: number; count: number }>;
  clarityDistribution: Array<{ range: string; count: number; percentage: number }>;
  lucidDreamProgress: {
    totalLucid: number;
    totalDreams: number;
    percentage: number;
    monthlyTrend: Array<{ month: string; lucidCount: number; totalCount: number; percentage: number }>;
  };
  
  // Content analysis
  topSymbols: Array<{ symbol: string; count: number }>;
  emotionalTones: Array<{ tone: string; count: number; avgIntensity: number }>;
  dreamTopics: Array<{ topic: string; count: number }>;
  
  // Location insights
  locationStats: Array<{ location: string; count: number; avgMood?: number }>;
  
  // Overall stats
  averageQualityScore: number; // Combined mood & clarity
  totalDreamTime: number; // In minutes
  averageDreamLength: number; // In seconds
  streakDays: number; // Consecutive days with dreams
  mostProductiveHour: number;
  mostProductiveDay: string;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const analyticsService = {
  async getDreamAnalytics(userId: string): Promise<DreamAnalytics> {
    try {
      // Fetch all dreams for the user
      const { data: dreams, error: dreamsError } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (dreamsError) throw dreamsError;
      if (!dreams || dreams.length === 0) {
        return this.getEmptyAnalytics();
      }

      // Fetch interpretations for emotional analysis
      const dreamIds = dreams.map(d => d.id);
      const { data: interpretations, error: interpError } = await supabase
        .from('interpretations')
        .select('*')
        .in('dream_id', dreamIds);

      if (interpError) {
        console.warn('Failed to fetch interpretations:', interpError);
      }

      return this.calculateAnalytics(dreams, interpretations || []);
    } catch (error) {
      console.error('Error fetching dream analytics:', error);
      throw error;
    }
  },

  calculateAnalytics(dreams: Dream[], interpretations: Interpretation[]): DreamAnalytics {
    // Dreams by hour
    const dreamsByHour = this.calculateDreamsByHour(dreams);
    
    // Dreams by day of week
    const dreamsByDayOfWeek = this.calculateDreamsByDayOfWeek(dreams);
    
    // Dreams by month
    const dreamsByMonth = this.calculateDreamsByMonth(dreams);
    
    // Mood trend over time
    const moodTrend = this.calculateMoodTrend(dreams);
    
    // Clarity distribution
    const clarityDistribution = this.calculateClarityDistribution(dreams);
    
    // Lucid dream progress
    const lucidDreamProgress = this.calculateLucidDreamProgress(dreams);
    
    // Symbol analysis from interpretations
    const topSymbols = this.extractTopSymbols(interpretations);
    
    // Emotional tone analysis
    const emotionalTones = this.extractEmotionalTones(interpretations);
    
    // Dream topics
    const dreamTopics = this.extractDreamTopics(interpretations);
    
    // Location stats
    const locationStats = this.calculateLocationStats(dreams);
    
    // Overall metrics
    const averageQualityScore = this.calculateAverageQualityScore(dreams);
    const totalDreamTime = dreams.reduce((sum, d) => sum + (d.duration || 0), 0) / 60; // Convert to minutes
    const averageDreamLength = dreams.length > 0 ? dreams.reduce((sum, d) => sum + (d.duration || 0), 0) / dreams.length : 0;
    const streakDays = this.calculateStreakDays(dreams);
    
    // Most productive times
    const mostProductiveHour = dreamsByHour.reduce((max, curr) => 
      curr.count > max.count ? curr : max, dreamsByHour[0]
    )?.hour || 0;
    
    const mostProductiveDay = dreamsByDayOfWeek.reduce((max, curr) => 
      curr.count > max.count ? curr : max, dreamsByDayOfWeek[0]
    )?.day || 'Monday';

    return {
      dreamsByHour,
      dreamsByDayOfWeek,
      dreamsByMonth,
      moodTrend,
      clarityDistribution,
      lucidDreamProgress,
      topSymbols,
      emotionalTones,
      dreamTopics,
      locationStats,
      averageQualityScore,
      totalDreamTime,
      averageDreamLength,
      streakDays,
      mostProductiveHour,
      mostProductiveDay,
    };
  },

  calculateDreamsByHour(dreams: Dream[]): Array<{ hour: number; count: number; avgMood?: number }> {
    const hourMap = new Map<number, { count: number; totalMood: number; moodCount: number }>();
    
    dreams.forEach(dream => {
      const hour = new Date(dream.created_at).getHours();
      const existing = hourMap.get(hour) || { count: 0, totalMood: 0, moodCount: 0 };
      existing.count++;
      if (dream.mood) {
        existing.totalMood += dream.mood;
        existing.moodCount++;
      }
      hourMap.set(hour, existing);
    });

    return Array.from({ length: 24 }, (_, hour) => {
      const data = hourMap.get(hour) || { count: 0, totalMood: 0, moodCount: 0 };
      return {
        hour,
        count: data.count,
        avgMood: data.moodCount > 0 ? data.totalMood / data.moodCount : undefined
      };
    });
  },

  calculateDreamsByDayOfWeek(dreams: Dream[]): Array<{ day: string; count: number; avgMood?: number }> {
    const dayMap = new Map<number, { count: number; totalMood: number; moodCount: number }>();
    
    dreams.forEach(dream => {
      const day = new Date(dream.created_at).getDay();
      const existing = dayMap.get(day) || { count: 0, totalMood: 0, moodCount: 0 };
      existing.count++;
      if (dream.mood) {
        existing.totalMood += dream.mood;
        existing.moodCount++;
      }
      dayMap.set(day, existing);
    });

    return DAYS_OF_WEEK.map((dayName, index) => {
      const data = dayMap.get(index) || { count: 0, totalMood: 0, moodCount: 0 };
      return {
        day: dayName,
        count: data.count,
        avgMood: data.moodCount > 0 ? data.totalMood / data.moodCount : undefined
      };
    });
  },

  calculateDreamsByMonth(dreams: Dream[]): Array<{ month: string; year: number; count: number }> {
    const monthMap = new Map<string, number>();
    
    dreams.forEach(dream => {
      const date = new Date(dream.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthMap.set(key, (monthMap.get(key) || 0) + 1);
    });

    // Get last 12 months
    const results: Array<{ month: string; year: number; count: number }> = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      results.push({
        month: MONTHS[date.getMonth()],
        year: date.getFullYear(),
        count: monthMap.get(key) || 0
      });
    }

    return results;
  },

  calculateMoodTrend(dreams: Dream[]): Array<{ date: string; avgMood: number; count: number }> {
    const dateMap = new Map<string, { totalMood: number; count: number }>();
    
    dreams.forEach(dream => {
      if (dream.mood) {
        const date = new Date(dream.created_at).toISOString().split('T')[0];
        const existing = dateMap.get(date) || { totalMood: 0, count: 0 };
        existing.totalMood += dream.mood;
        existing.count++;
        dateMap.set(date, existing);
      }
    });

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        avgMood: data.totalMood / data.count,
        count: data.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days
  },

  calculateClarityDistribution(dreams: Dream[]): Array<{ range: string; count: number; percentage: number }> {
    const ranges = [
      { label: '0-20', min: 0, max: 20 },
      { label: '21-40', min: 21, max: 40 },
      { label: '41-60', min: 41, max: 60 },
      { label: '61-80', min: 61, max: 80 },
      { label: '81-100', min: 81, max: 100 }
    ];

    const distribution = ranges.map(range => ({
      range: range.label,
      count: dreams.filter(d => {
        const clarity = d.clarity || 50;
        return clarity >= range.min && clarity <= range.max;
      }).length,
      percentage: 0
    }));

    const total = distribution.reduce((sum, item) => sum + item.count, 0);
    distribution.forEach(item => {
      item.percentage = total > 0 ? (item.count / total) * 100 : 0;
    });

    return distribution;
  },

  calculateLucidDreamProgress(dreams: Dream[]): DreamAnalytics['lucidDreamProgress'] {
    const lucidDreams = dreams.filter(d => d.is_lucid);
    const monthlyData = new Map<string, { lucid: number; total: number }>();
    
    dreams.forEach(dream => {
      const date = new Date(dream.created_at);
      const key = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
      const existing = monthlyData.get(key) || { lucid: 0, total: 0 };
      existing.total++;
      if (dream.is_lucid) existing.lucid++;
      monthlyData.set(key, existing);
    });

    const monthlyTrend = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        lucidCount: data.lucid,
        totalCount: data.total,
        percentage: data.total > 0 ? (data.lucid / data.total) * 100 : 0
      }))
      .slice(-6); // Last 6 months

    return {
      totalLucid: lucidDreams.length,
      totalDreams: dreams.length,
      percentage: dreams.length > 0 ? (lucidDreams.length / dreams.length) * 100 : 0,
      monthlyTrend
    };
  },

  extractTopSymbols(interpretations: Interpretation[]): Array<{ symbol: string; count: number }> {
    const symbolMap = new Map<string, number>();
    
    interpretations.forEach(interp => {
      const symbols = interp.symbols || interp.key_symbols || [];
      const symbolArray = Array.isArray(symbols) ? symbols : [];
      
      symbolArray.forEach(symbol => {
        if (typeof symbol === 'string' && symbol.trim()) {
          symbolMap.set(symbol, (symbolMap.get(symbol) || 0) + 1);
        }
      });
    });

    return Array.from(symbolMap.entries())
      .map(([symbol, count]) => ({ symbol, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  },

  extractEmotionalTones(interpretations: Interpretation[]): Array<{ tone: string; count: number; avgIntensity: number }> {
    const toneMap = new Map<string, { count: number; totalIntensity: number }>();
    
    interpretations.forEach(interp => {
      if (interp.emotional_tone) {
        const { primary, secondary, intensity } = interp.emotional_tone;
        
        if (primary) {
          const existing = toneMap.get(primary) || { count: 0, totalIntensity: 0 };
          existing.count++;
          existing.totalIntensity += intensity || 5;
          toneMap.set(primary, existing);
        }
        
        if (secondary) {
          const existing = toneMap.get(secondary) || { count: 0, totalIntensity: 0 };
          existing.count++;
          existing.totalIntensity += (intensity || 5) * 0.5; // Secondary tone has less weight
          toneMap.set(secondary, existing);
        }
      }
    });

    return Array.from(toneMap.entries())
      .map(([tone, data]) => ({
        tone,
        count: data.count,
        avgIntensity: data.totalIntensity / data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  },

  extractDreamTopics(interpretations: Interpretation[]): Array<{ topic: string; count: number }> {
    const topicMap = new Map<string, number>();
    
    interpretations.forEach(interp => {
      if (interp.dream_topic && typeof interp.dream_topic === 'string') {
        topicMap.set(interp.dream_topic, (topicMap.get(interp.dream_topic) || 0) + 1);
      }
    });

    return Array.from(topicMap.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  },

  calculateLocationStats(dreams: Dream[]): Array<{ location: string; count: number; avgMood?: number }> {
    const locationMap = new Map<string, { count: number; totalMood: number; moodCount: number }>();
    
    dreams.forEach(dream => {
      if (dream.location_metadata?.city || dream.location_metadata?.country) {
        const location = dream.location_metadata.city 
          ? `${dream.location_metadata.city}, ${dream.location_metadata.country}`
          : dream.location_metadata.country || 'Unknown';
          
        const existing = locationMap.get(location) || { count: 0, totalMood: 0, moodCount: 0 };
        existing.count++;
        if (dream.mood) {
          existing.totalMood += dream.mood;
          existing.moodCount++;
        }
        locationMap.set(location, existing);
      }
    });

    return Array.from(locationMap.entries())
      .map(([location, data]) => ({
        location,
        count: data.count,
        avgMood: data.moodCount > 0 ? data.totalMood / data.moodCount : undefined
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  },

  calculateAverageQualityScore(dreams: Dream[]): number {
    if (dreams.length === 0) return 0;
    
    let totalScore = 0;
    let count = 0;
    
    dreams.forEach(dream => {
      if (dream.mood || dream.clarity) {
        const moodScore = (dream.mood || 3) / 5; // Normalize to 0-1
        const clarityScore = (dream.clarity || 50) / 100; // Normalize to 0-1
        const qualityScore = (moodScore + clarityScore) / 2 * 100; // Average and convert to percentage
        totalScore += qualityScore;
        count++;
      }
    });

    return count > 0 ? Math.round(totalScore / count) : 0;
  },

  calculateStreakDays(dreams: Dream[]): number {
    if (dreams.length === 0) return 0;
    
    // Sort dreams by date (newest first)
    const sortedDreams = [...dreams].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Check if there's a dream today or yesterday to start the streak
    const lastDreamDate = new Date(sortedDreams[0].created_at);
    lastDreamDate.setHours(0, 0, 0, 0);
    const daysSinceLastDream = Math.floor((currentDate.getTime() - lastDreamDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastDream > 1) return 0; // Streak is broken
    
    // Count consecutive days
    const dreamDates = new Set(
      dreams.map(d => {
        const date = new Date(d.created_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );
    
    currentDate = new Date(lastDreamDate);
    while (dreamDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  },

  getEmptyAnalytics(): DreamAnalytics {
    return {
      dreamsByHour: Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 })),
      dreamsByDayOfWeek: DAYS_OF_WEEK.map(day => ({ day, count: 0 })),
      dreamsByMonth: [],
      moodTrend: [],
      clarityDistribution: [
        { range: '0-20', count: 0, percentage: 0 },
        { range: '21-40', count: 0, percentage: 0 },
        { range: '41-60', count: 0, percentage: 0 },
        { range: '61-80', count: 0, percentage: 0 },
        { range: '81-100', count: 0, percentage: 0 }
      ],
      lucidDreamProgress: {
        totalLucid: 0,
        totalDreams: 0,
        percentage: 0,
        monthlyTrend: []
      },
      topSymbols: [],
      emotionalTones: [],
      dreamTopics: [],
      locationStats: [],
      averageQualityScore: 0,
      totalDreamTime: 0,
      averageDreamLength: 0,
      streakDays: 0,
      mostProductiveHour: 0,
      mostProductiveDay: 'Monday'
    };
  }
};