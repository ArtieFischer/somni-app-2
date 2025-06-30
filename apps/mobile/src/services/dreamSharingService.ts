import { supabase } from '../lib/supabase';

export interface ShareDreamRequest {
  isAnonymous: boolean;
  displayName?: string | null;
}

export interface ShareDreamResponse {
  success: boolean;
  shareId: string;
  message?: string;
  error?: string;
}

export interface SharedDreamStatus {
  success: boolean;
  isShared: boolean;
  shareDetails?: {
    isAnonymous: boolean;
    displayName: string | null;
    sharedAt: string;
  };
}

export interface PublicSharedDream {
  share_id: string;
  dream_id: string;
  dream_title: string | null;
  dream_transcript: string | null;
  dream_created_at: string;
  mood: number | null;
  clarity: number | null;
  is_anonymous: boolean;
  display_name: string | null;
  shared_at: string;
  themes: Array<{
    code: string;
    label: string;
  }>;
  image_url: string | null; // Direct URL from Supabase storage, null if no image
}

export interface GetSharedDreamsResponse {
  success: boolean;
  dreams: PublicSharedDream[];
  total: number;
  error?: string;
}

class DreamSharingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_SOMNI_BACKEND_URL || 'https://somni-backend-production.up.railway.app';
  }

  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async shareDream(dreamId: string, request: ShareDreamRequest): Promise<ShareDreamResponse> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return {
          success: false,
          shareId: '',
          error: 'Authentication required'
        };
      }

      console.log('Sharing dream:', {
        dreamId,
        request,
        url: `${this.baseUrl}/api/v1/dreams/${dreamId}/share`,
        hasToken: !!token
      });

      const response = await fetch(`${this.baseUrl}/api/v1/dreams/${dreamId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        // Handle non-JSON responses (like 404 HTML pages)
        const text = await response.text();
        let errorMessage = 'Failed to share dream';
        
        console.log('Share dream error:', {
          status: response.status,
          statusText: response.statusText,
          responseText: text,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        try {
          const data = JSON.parse(text);
          errorMessage = data.error || errorMessage;
        } catch {
          // Response is not JSON, likely API not deployed yet
          errorMessage = `Error ${response.status}: ${text || response.statusText}`;
        }

        return {
          success: false,
          shareId: '',
          error: errorMessage
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sharing dream:', error);
      return {
        success: false,
        shareId: '',
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  async unshareDream(dreamId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const response = await fetch(`${this.baseUrl}/api/v1/dreams/${dreamId}/share`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Failed to unshare dream';
        
        try {
          const data = JSON.parse(text);
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = 'API endpoint not available yet. Please deploy the backend first.';
        }

        return {
          success: false,
          error: errorMessage
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error unsharing dream:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  async updateShareSettings(dreamId: string, request: ShareDreamRequest): Promise<ShareDreamResponse> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return {
          success: false,
          shareId: '',
          error: 'Authentication required'
        };
      }

      const response = await fetch(`${this.baseUrl}/api/v1/dreams/${dreamId}/share`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Failed to update sharing settings';
        
        try {
          const data = JSON.parse(text);
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = 'API endpoint not available yet. Please deploy the backend first.';
        }

        return {
          success: false,
          shareId: '',
          error: errorMessage
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating share settings:', error);
      return {
        success: false,
        shareId: '',
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  async getShareStatus(dreamId: string): Promise<SharedDreamStatus> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return {
          success: false,
          isShared: false,
        };
      }

      const response = await fetch(`${this.baseUrl}/api/v1/dreams/${dreamId}/share/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Silently handle API not being available yet
        return {
          success: false,
          isShared: false,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Silently handle errors when API isn't deployed yet
      return {
        success: false,
        isShared: false,
      };
    }
  }

  async getPublicSharedDreams(limit: number = 50, offset: number = 0): Promise<GetSharedDreamsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/shared-dreams?limit=${limit}&offset=${offset}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Failed to fetch shared dreams';
        
        try {
          const data = JSON.parse(text);
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = 'API endpoint not available yet. Please deploy the backend first.';
        }

        return {
          success: false,
          dreams: [],
          total: 0,
          error: errorMessage
        };
      }

      const data = await response.json();
      
      // Log image statistics
      if (data.success && data.dreams && data.dreams.length > 0) {
        const dreamsWithImages = data.dreams.filter((d: any) => d.image_url !== null).length;
        console.log(`Loaded ${data.dreams.length} dreams, ${dreamsWithImages} with images`);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching shared dreams:', error);
      return {
        success: false,
        dreams: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }
}

export const dreamSharingService = new DreamSharingService();