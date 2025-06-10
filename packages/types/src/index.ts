// Core dream types
export type {
  Dream,
  DreamDTO,
  DreamStatus,
  DreamUpdate,
  DreamCreate,
  RecordingSession
} from './dream';

// Search and filter types
export type {
  DreamSearchQuery,
  DreamSearchResult
} from './dream';

// Statistics types
export type {
  DreamStats
} from './dream';

// Store types
export type {
  DreamStore,
  DreamStoreState,
  DreamStoreActions
} from './dream';

// Event and validation types
export type {
  DreamEvent,
  DreamValidationError,
  DreamValidationResult
} from './dream';

// Audio recording types (can be expanded later)
export interface AudioRecordingResult {
  uri: string;
  duration: number;
  fileSize: number;
  format: string;
  sampleRate?: number;
  channels?: number;
  bitRate?: number;
}

// Network types (can be expanded later)
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
  connectionQuality: 'poor' | 'good' | 'excellent' | 'unknown';
}

// User types (placeholder for future user management)
export interface User {
  id: string;
  email: string;
  username?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  avatar?: string;
  preferences: {
    theme: 'dark' | 'light';
    language: string;
    notifications: boolean;
    autoBackup: boolean;
  };
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  userId?: string;
}

// Theme types (for future theme system)
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: {
    primary: string;
    secondary: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  accent: {
    primary: string;
    secondary: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    small: number;
    medium: number;
    large: number;
    xl: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
  shadows: {
    small: object;
    medium: object;
    large: object;
  };
}