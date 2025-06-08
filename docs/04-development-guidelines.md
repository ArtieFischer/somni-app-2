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
import type { User, DreamEntry } from '@somni/types';
import { formatDate } from '@somni/utils';
```

## Shared Code Usage

### Importing Shared Packages

Always use the scoped package names for imports:

```typescript
// Correct
import { User, DreamEntry } from '@somni/types';
import { formatDate, getDreamTitle } from '@somni/utils';

// Incorrect - don't use relative paths
import { User } from '../../types/src/index';
```

### Adding New Types

When adding new types to `@somni/types`:

1. Define the interface in `types/src/index.ts`
2. Export it from the main index file
3. Update documentation
4. Test usage in both mobile and web apps

```typescript
// types/src/index.ts
export interface DreamSymbol {
  id: string;
  name: string;
  category: string;
  frequency: number;
  lastSeen: string;
}
```

### Adding New Utilities

When adding utilities to `@somni/utils`:

1. Create focused, pure functions
2. Include proper TypeScript types
3. Add JSDoc comments
4. Write unit tests

```typescript
// utils/src/index.ts
/**
 * Calculates the frequency of dream symbols
 * @param dreams Array of dream entries
 * @param symbolName Name of the symbol to count
 * @returns Frequency count
 */
export const calculateSymbolFrequency = (
  dreams: DreamEntry[],
  symbolName: string
): number => {
  return dreams.filter(dream => 
    dream.tags?.includes(symbolName)
  ).length;
};
```

## Component Development

### React Native Components

#### File Organization
```
src/
├── components/
│   ├── atoms/          # Basic UI elements
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Text/
│   ├── molecules/      # Compound components
│   │   ├── DreamCard/
│   │   ├── RecordButton/
│   │   └── UserProfile/
│   └── organisms/      # Complex components
│       ├── DreamFeed/
│       ├── RecordingInterface/
│       └── AnalysisView/
```

#### Component Structure
```typescript
// Good component structure
interface DreamCardProps {
  dream: DreamEntry;
  onPress: (dreamId: string) => void;
  showAnalysis?: boolean;
}

export const DreamCard: React.FC<DreamCardProps> = ({
  dream,
  onPress,
  showAnalysis = false,
}) => {
  const handlePress = useCallback(() => {
    onPress(dream.id);
  }, [dream.id, onPress]);

  return (
    <TouchableOpacity onPress={handlePress}>
      {/* Component content */}
    </TouchableOpacity>
  );
};
```

### React Web Components

Follow similar patterns but adapt for web-specific needs:

```typescript
// Web-specific component
interface DreamTableProps {
  dreams: DreamEntry[];
  onSort: (field: keyof DreamEntry) => void;
  sortField: keyof DreamEntry;
  sortDirection: 'asc' | 'desc';
}

export const DreamTable: React.FC<DreamTableProps> = ({
  dreams,
  onSort,
  sortField,
  sortDirection,
}) => {
  // Web-specific implementation
};
```

## State Management

### Zustand Store Structure

```typescript
// stores/dreamStore.ts
interface DreamStore {
  // State
  dreams: DreamEntry[];
  currentDream: DreamEntry | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addDream: (dream: Omit<DreamEntry, 'id'>) => void;
  updateDream: (id: string, updates: Partial<DreamEntry>) => void;
  deleteDream: (id: string) => void;
  loadDreams: () => Promise<void>;
  clearError: () => void;
}

export const useDreamStore = create<DreamStore>((set, get) => ({
  dreams: [],
  currentDream: null,
  isLoading: false,
  error: null,
  
  addDream: (dreamData) => {
    const dream: DreamEntry = {
      ...dreamData,
      id: generateId(),
    };
    set(state => ({
      dreams: [dream, ...state.dreams],
    }));
  },
  
  // Other actions...
}));
```

### State Management Best Practices

1. **Keep stores focused**: One store per domain (dreams, user, settings)
2. **Use selectors**: Extract specific data to prevent unnecessary re-renders
3. **Handle loading states**: Always manage loading and error states
4. **Persist important data**: Use AsyncStorage for offline support

## API Integration

### Supabase Client Usage

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### API Service Pattern

```typescript
// services/dreamService.ts
export class DreamService {
  static async createDream(dream: Omit<DreamEntry, 'id'>): Promise<DreamEntry> {
    const { data, error } = await supabase
      .from('dreams')
      .insert(dream)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  static async getDreams(userId: string): Promise<DreamEntry[]> {
    const { data, error } = await supabase
      .from('dreams')
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  }
}
```

## Error Handling

### Error Boundaries

```typescript
// components/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### Async Error Handling

```typescript
// Good: Proper error handling in async functions
const handleDreamSubmission = async (dreamData: Partial<DreamEntry>) => {
  try {
    setIsLoading(true);
    const dream = await DreamService.createDream(dreamData);
    addDream(dream);
    navigation.navigate('DreamDetail', { dreamId: dream.id });
  } catch (error) {
    console.error('Failed to create dream:', error);
    setError(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    setIsLoading(false);
  }
};
```

## Performance Guidelines

### React Native Performance

1. **Use FlatList for large lists**
2. **Implement proper memoization**
3. **Optimize images with FastImage**
4. **Use Hermes JavaScript engine**
5. **Minimize bridge calls**

```typescript
// Good: Memoized component
const DreamListItem = React.memo<{ dream: DreamEntry; onPress: (id: string) => void }>(
  ({ dream, onPress }) => {
    const handlePress = useCallback(() => {
      onPress(dream.id);
    }, [dream.id, onPress]);

    return (
      <TouchableOpacity onPress={handlePress}>
        <Text>{dream.title}</Text>
      </TouchableOpacity>
    );
  }
);
```

### Web Performance

1. **Use React.lazy for code splitting**
2. **Implement virtual scrolling for large lists**
3. **Optimize bundle size**
4. **Use service workers for caching**

## Testing Guidelines

### Unit Testing

```typescript
// __tests__/utils/formatDate.test.ts
import { formatDate } from '@somni/utils';

describe('formatDate', () => {
  it('should format ISO date string correctly', () => {
    const isoDate = '2024-01-15T10:30:00.000Z';
    const formatted = formatDate(isoDate);
    expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });
});
```

### Component Testing

```typescript
// __tests__/components/DreamCard.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { DreamCard } from '../src/components/DreamCard';

const mockDream: DreamEntry = {
  id: '1',
  userId: 'user1',
  title: 'Test Dream',
  content: 'Test content',
  date: '2024-01-15T10:30:00.000Z',
};

describe('DreamCard', () => {
  it('should call onPress with dream id when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <DreamCard dream={mockDream} onPress={onPress} />
    );
    
    fireEvent.press(getByText('Test Dream'));
    expect(onPress).toHaveBeenCalledWith('1');
  });
});
```

## Git Workflow

### Commit Messages

Use conventional commit format:

```
feat: add voice recording functionality
fix: resolve dream sync issue
docs: update API documentation
test: add unit tests for dream service
refactor: improve error handling
```

### Branch Naming

```
feature/voice-recording
bugfix/dream-sync-issue
hotfix/critical-auth-bug
docs/api-reference-update
```

### Pull Request Guidelines

1. **Clear description**: Explain what changes were made and why
2. **Link issues**: Reference related GitHub issues
3. **Test coverage**: Ensure new code is tested
4. **Documentation**: Update docs if needed
5. **Review checklist**: Follow the PR template

## Security Guidelines

### Environment Variables

- Never commit sensitive data
- Use different keys for development and production
- Validate environment variables at startup

### Data Handling

- Sanitize user inputs
- Validate data on both client and server
- Use proper authentication and authorization
- Implement rate limiting for API calls

### Privacy

- Respect user privacy settings
- Implement proper data deletion
- Use encryption for sensitive data
- Follow GDPR and privacy regulations