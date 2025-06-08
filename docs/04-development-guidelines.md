# Development Guidelines

## Code Style and Standards

### ESLint and Prettier Configuration

All code must adhere to the project's ESLint and Prettier configurations. These tools ensure consistent code style across the entire monorepo.

#### Running Linting
```bash
# Lint all workspaces
npm run lint --workspaces

# Lint specific workspace
npm run lint --workspace=@somni/mobile
npm run lint --workspace=@somni/web
npm run lint --workspace=@somni/core
```

#### Key ESLint Rules
- TypeScript strict mode enabled
- React hooks rules enforced
- Unused variables flagged as warnings
- Prettier integration for formatting

#### Prettier Configuration
```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  arrowParens: 'always',
};
```

### TypeScript Guidelines

#### Strict Type Safety
- Always use TypeScript strict mode
- Avoid `any` type - use proper typing or `unknown`
- Define interfaces for all data structures
- Use type guards for runtime type checking

#### Type Definitions
```typescript
// Good: Proper interface definition
interface DreamAnalysis {
  id: string;
  dreamId: string;
  analysisType: 'freudian' | 'jungian' | 'spiritual' | 'neurobiological';
  content: string;
  confidence: number;
  createdAt: string;
}

// Good: Union types for specific values
type RecordingStatus = 'idle' | 'recording' | 'processing' | 'completed' | 'error';

// Good: Generic types for reusable components
interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}
```

#### Type Imports
```typescript
// Use type-only imports when possible
import type { UserProfile, Dream } from '@somni/types';
import { formatDate } from '@somni/utils';
import { User, RecordDreamUseCase } from '@somni/core';
```

## Clean Architecture Guidelines

### Domain Layer (`@somni/core`)

The domain layer contains the business logic and should be framework-agnostic.

#### Entities
```typescript
// Good: Entity with business logic and validation
export class Dream {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly rawTranscript: string,
    // ... other properties
  ) {}

  static create(dreamData: Partial<DreamType>): Dream {
    this.validateDreamData(dreamData);
    return new Dream(/* ... */);
  }

  private static validateDreamData(data: Partial<DreamType>): void {
    if (!data.user_id) {
      throw new Error('User ID is required');
    }
    // Additional validation
  }

  toDTO(): DreamType {
    return {
      id: this.id,
      user_id: this.userId,
      // ... map to database format
    };
  }
}
```

#### Use Cases
```typescript
// Good: Use case that orchestrates business logic
export class RecordDreamUseCase {
  constructor(
    private dreamRepository: IDreamRepository
  ) {}

  async execute(request: RecordDreamRequest): Promise<Dream> {
    // Validate input
    const dream = Dream.create({
      user_id: request.userId,
      raw_transcript: request.rawTranscript,
      // ... other properties
    });

    // Save via repository
    const savedDream = await this.dreamRepository.save(dream.toDTO());
    
    return Dream.create(savedDream);
  }
}
```

#### Repository Interfaces
```typescript
// Good: Abstract interface in domain layer
export interface IDreamRepository {
  save(dream: Dream): Promise<Dream>;
  findById(id: string): Promise<Dream | null>;
  findByUserId(userId: string): Promise<Dream[]>;
  update(id: string, updates: Partial<Dream>): Promise<Dream>;
  delete(id: string): Promise<void>;
}
```

### Infrastructure Layer (`apps/mobile/src/infrastructure`)

The infrastructure layer implements domain interfaces and handles external concerns.

#### Repository Implementation
```typescript
// Good: Concrete implementation in infrastructure layer
export class DreamRepository implements IDreamRepository {
  async save(dream: Dream): Promise<Dream> {
    const { data, error } = await supabaseClient
      .from('dreams')
      .insert({
        user_id: dream.user_id,
        raw_transcript: dream.raw_transcript,
        // ... map from domain to database
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ... other methods
}
```

#### Service Implementation
```typescript
// Good: External service wrapper
export class AudioService {
  private audioRecorder: any;
  private isRecording = false;

  async startRecording(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Microphone permission not granted');
    }

    await this.audioRecorder.prepareToRecordAsync();
    this.isRecording = true;
    await this.audioRecorder.record();
  }

  // ... other methods
}
```

## Shared Code Usage

### Importing Shared Packages

Always use the scoped package names for imports:

```typescript
// Core domain logic
import { Dream, User, RecordDreamUseCase } from '@somni/core';

// State management
import { useAuthStore, useDreamStore, useSettingsStore } from '@somni/stores';

// Theming
import { useTheme } from '@hooks/useTheme';
import { lightTheme, darkTheme } from '@somni/theme';

// Translations
import { useTranslation } from '@hooks/useTranslation';
import en from '@somni/locales/en';

// Legacy types and utils
import { UserProfile, Dream as DreamType } from '@somni/types';
import { formatDate } from '@somni/utils';
```

### Adding New Domain Logic

When adding new business logic to `@somni/core`:

1. Define entities with validation
2. Create use cases that orchestrate business logic
3. Define repository interfaces
4. Implement repositories in infrastructure layer

```typescript
// packages/core/src/entities/Analysis.ts
export class Analysis {
  constructor(
    public readonly id: string,
    public readonly dreamId: string,
    public readonly type: AnalysisType,
    public readonly content: string,
    public readonly confidence: number
  ) {}

  static create(data: AnalysisData): Analysis {
    this.validateAnalysisData(data);
    return new Analysis(/* ... */);
  }
}

// packages/core/src/useCases/analysis/GenerateAnalysisUseCase.ts
export class GenerateAnalysisUseCase {
  constructor(
    private dreamRepository: IDreamRepository,
    private analysisRepository: IAnalysisRepository
  ) {}

  async execute(request: GenerateAnalysisRequest): Promise<Analysis[]> {
    // Business logic here
  }
}
```

### Adding New State Management

When adding new Zustand stores to `@somni/stores`:

```typescript
// packages/stores/src/analysisStore.ts
interface AnalysisState {
  analyses: Analysis[];
  isGenerating: boolean;
  error: string | null;
  
  generateAnalysis: (dreamId: string, types: AnalysisType[]) => Promise<void>;
  setAnalyses: (analyses: Analysis[]) => void;
  setError: (error: string | null) => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  analyses: [],
  isGenerating: false,
  error: null,
  
  generateAnalysis: async (dreamId, types) => {
    try {
      set({ isGenerating: true, error: null });
      // Call use case or repository
      const analyses = await generateAnalysisUseCase.execute({ dreamId, types });
      set({ analyses, isGenerating: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isGenerating: false 
      });
    }
  },
  
  // ... other actions
}));
```

## Component Development

### Atomic Design Structure

Components are organized using atomic design principles:

```
src/components/
├── atoms/              # Basic UI elements
│   ├── Text/
│   ├── Button/
│   └── Input/
├── molecules/          # Compound components
│   ├── DreamCard/
│   ├── RecordButton/
│   └── UserProfile/
└── organisms/          # Complex components
    ├── DreamFeed/
    ├── RecordingInterface/
    └── AnalysisView/
```

### Component Structure

```typescript
// Good component structure with theming
import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import { Text } from '../Text';
import { useTheme } from '@hooks/useTheme';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  loading = false,
  disabled,
  ...pressableProps
}) => {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  
  const getButtonStyle = () => {
    const buttonConfig = theme.colors.button[variant];
    const sizeConfig = theme.typography.button[size];
    
    return {
      backgroundColor: buttonConfig.background,
      borderColor: buttonConfig.border,
      borderRadius: theme.borderRadius.medium,
      paddingVertical: theme.spacing[size === 'small' ? 'small' : 'medium'],
      paddingHorizontal: theme.spacing[size === 'small' ? 'medium' : 'large'],
      opacity: isDisabled ? 0.6 : 1,
    };
  };
  
  return (
    <Pressable 
      style={({ pressed }) => [
        getButtonStyle(),
        pressed && { opacity: 0.8 }
      ]} 
      disabled={isDisabled}
      {...pressableProps}
    >
      <Text style={{ color: theme.colors.button[variant].text }}>
        {loading ? 'Loading...' : children}
      </Text>
    </Pressable>
  );
};
```

### Screen Structure

```typescript
// Good screen structure with hooks and styling
import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { Text, Button } from '@components/atoms';
import { useAuth } from '@hooks/useAuth';
import { useTranslation } from '@hooks/useTranslation';
import { useStyles } from './HomeScreen.styles';

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation('common');
  const { user, signOut } = useAuth();
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          {t('navigation.home')}
        </Text>
        
        <Button variant="secondary" onPress={signOut}>
          {t('actions.signOut')}
        </Button>
      </View>
    </SafeAreaView>
  );
};
```

### Styling with Theme

```typescript
// Good: Separate styles file using theme
import { StyleSheet } from 'react-native';
import { useTheme } from '@hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      padding: theme.spacing.large,
    },
    title: {
      marginBottom: theme.spacing.medium,
    },
  });
};
```

## State Management

### Zustand Store Patterns

```typescript
// Good: Domain-specific store with proper error handling
interface DreamState {
  // State
  dreams: Dream[];
  currentDream: Dream | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addDream: (dream: Dream) => void;
  updateDream: (id: string, updates: Partial<Dream>) => void;
  deleteDream: (id: string) => void;
  loadDreams: () => Promise<void>;
  clearError: () => void;
}

export const useDreamStore = create<DreamState>((set, get) => ({
  dreams: [],
  currentDream: null,
  isLoading: false,
  error: null,
  
  addDream: (dream) => {
    set(state => ({
      dreams: [dream, ...state.dreams],
      error: null,
    }));
  },
  
  loadDreams: async () => {
    try {
      set({ isLoading: true, error: null });
      const dreams = await dreamRepository.findByUserId(userId);
      set({ dreams, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },
  
  clearError: () => set({ error: null }),
}));
```

### Custom Hooks

```typescript
// Good: Custom hook that encapsulates business logic
export const useAuth = () => {
  const authStore = useAuthStore();

  useEffect(() => {
    // Initialize auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      authStore.setSession(session);
      authStore.setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        authStore.setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    signOut: authStore.signOut,
    clearError: authStore.clearError,
  };
};
```

## Internationalization

### Translation Usage

```typescript
// Good: Type-safe translation usage
import { useTranslation } from '@hooks/useTranslation';

export const SignInScreen: React.FC = () => {
  const { t } = useTranslation('auth');
  
  return (
    <View>
      <Text>{t('signIn.title')}</Text>
      <Text>{t('signIn.subtitle')}</Text>
      <Button>{t('signIn.button')}</Button>
    </View>
  );
};
```

### Adding New Translations

```json
// packages/locales/src/en/dreams.json
{
  "record": {
    "title": "Record Your Dream",
    "button": {
      "start": "Tap to start recording",
      "stop": "Tap to stop",
      "recording": "Recording... {{duration}}s"
    }
  }
}
```

## Error Handling

### Domain Layer Error Handling

```typescript
// Good: Domain-specific errors
export class DreamValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DreamValidationError';
  }
}

export class Dream {
  static create(data: Partial<DreamType>): Dream {
    if (!data.user_id) {
      throw new DreamValidationError('User ID is required');
    }
    if (!data.raw_transcript?.trim()) {
      throw new DreamValidationError('Dream content cannot be empty');
    }
    
    return new Dream(/* ... */);
  }
}
```

### Infrastructure Layer Error Handling

```typescript
// Good: Infrastructure error handling with proper mapping
export class DreamRepository implements IDreamRepository {
  async save(dream: Dream): Promise<Dream> {
    try {
      const { data, error } = await supabaseClient
        .from('dreams')
        .insert(dream.toDTO())
        .select()
        .single();

      if (error) {
        throw this.mapSupabaseError(error);
      }

      return data;
    } catch (error) {
      if (error instanceof DreamValidationError) {
        throw error; // Re-throw domain errors
      }
      throw new Error(`Failed to save dream: ${error.message}`);
    }
  }

  private mapSupabaseError(error: any): Error {
    switch (error.code) {
      case '23505':
        return new Error('Dream already exists');
      case '23503':
        return new Error('Invalid user reference');
      default:
        return new Error(`Database error: ${error.message}`);
    }
  }
}
```

### UI Error Handling

```typescript
// Good: User-friendly error handling in components
export const DreamRecordingScreen: React.FC = () => {
  const { t } = useTranslation('dreams');
  const { error, clearError } = useDreamStore();

  useEffect(() => {
    if (error) {
      Alert.alert(
        t('record.error.title'),
        error,
        [{ text: t('actions.ok'), onPress: clearError }]
      );
    }
  }, [error, clearError, t]);

  // Component implementation
};
```

## Performance Guidelines

### React Native Performance

1. **Use proper memoization**
2. **Optimize FlatList rendering**
3. **Minimize bridge calls**
4. **Use Hermes JavaScript engine**

```typescript
// Good: Memoized component with proper dependencies
const DreamListItem = React.memo<{ dream: Dream; onPress: (id: string) => void }>(
  ({ dream, onPress }) => {
    const theme = useTheme();
    
    const handlePress = useCallback(() => {
      onPress(dream.id);
    }, [dream.id, onPress]);

    const styles = useMemo(() => ({
      container: {
        backgroundColor: theme.colors.background.elevated,
        padding: theme.spacing.medium,
        borderRadius: theme.borderRadius.medium,
      },
    }), [theme]);

    return (
      <Pressable style={styles.container} onPress={handlePress}>
        <Text>{dream.raw_transcript}</Text>
      </Pressable>
    );
  }
);
```

### State Management Performance

```typescript
// Good: Selective state subscriptions
const DreamList: React.FC = () => {
  // Only subscribe to dreams, not the entire store
  const dreams = useDreamStore(state => state.dreams);
  const isLoading = useDreamStore(state => state.isLoading);
  
  // Avoid subscribing to the entire store
  // const { dreams, isLoading } = useDreamStore(); // ❌ Less efficient
};
```

## Testing Guidelines

### Unit Testing Domain Logic

```typescript
// Good: Testing domain entities
describe('Dream', () => {
  it('should create a valid dream', () => {
    const dreamData = {
      user_id: 'user-123',
      raw_transcript: 'I was flying over mountains',
    };

    const dream = Dream.create(dreamData);

    expect(dream.userId).toBe('user-123');
    expect(dream.rawTranscript).toBe('I was flying over mountains');
  });

  it('should throw error for invalid data', () => {
    const invalidData = { raw_transcript: '' };

    expect(() => Dream.create(invalidData)).toThrow('User ID is required');
  });
});
```

### Testing Use Cases

```typescript
// Good: Testing use cases with mocked dependencies
describe('RecordDreamUseCase', () => {
  let useCase: RecordDreamUseCase;
  let mockRepository: jest.Mocked<IDreamRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      // ... other methods
    };
    useCase = new RecordDreamUseCase(mockRepository);
  });

  it('should record a dream successfully', async () => {
    const request = {
      userId: 'user-123',
      rawTranscript: 'Test dream',
    };

    const mockSavedDream = { id: 'dream-456', ...request };
    mockRepository.save.mockResolvedValue(mockSavedDream);

    const result = await useCase.execute(request);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        raw_transcript: 'Test dream',
      })
    );
    expect(result.id).toBe('dream-456');
  });
});
```

### Testing Components

```typescript
// Good: Testing components with proper mocking
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

// Mock the theme hook
jest.mock('@hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { button: { primary: { background: '#000', text: '#fff' } } },
    spacing: { medium: 16 },
    borderRadius: { medium: 8 },
  }),
}));

describe('Button', () => {
  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress}>Test Button</Button>
    );

    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} loading>Test Button</Button>
    );

    fireEvent.press(getByText('Loading...'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

This comprehensive development guide ensures consistent, maintainable, and scalable code across the entire Somni project while following clean architecture principles and modern React Native best practices.