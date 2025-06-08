# Testing Strategy

This document outlines the comprehensive testing approach for the Somni project, covering unit tests, integration tests, and end-to-end testing across both mobile and web platforms.

## Testing Philosophy

### Testing Pyramid
1. **Unit Tests (70%)**: Fast, isolated tests for individual functions and components
2. **Integration Tests (20%)**: Tests for component interactions and API integrations
3. **E2E Tests (10%)**: Full user journey tests across the entire application

### Key Principles
- **Test behavior, not implementation**: Focus on what the code does, not how it does it
- **Write tests first**: Use TDD/BDD approaches where appropriate
- **Maintain test quality**: Tests should be as well-written as production code
- **Fast feedback**: Tests should run quickly and provide clear error messages

## Testing Frameworks and Tools

### Unit and Integration Testing
- **Jest**: JavaScript testing framework
- **React Native Testing Library**: Component testing for mobile
- **React Testing Library**: Component testing for web
- **MSW (Mock Service Worker)**: API mocking
- **@testing-library/jest-dom**: Additional Jest matchers

### End-to-End Testing
- **Maestro**: E2E testing for React Native (preferred)
- **Playwright**: E2E testing for web applications
- **Detox**: Alternative E2E testing for React Native (if needed)

### Test Utilities
- **Factory functions**: For creating test data
- **Custom render functions**: For testing with providers
- **Mock implementations**: For external dependencies

## Project Structure

### Test File Organization
```
src/
├── __tests__/              # Global test utilities and setup
│   ├── setup.ts           # Test environment setup
│   ├── factories/         # Test data factories
│   └── mocks/             # Mock implementations
├── components/
│   ├── atoms/
│   │   └── Button/
│   │       ├── Button.tsx
│   │       └── Button.test.tsx
├── services/
│   ├── dreamService.ts
│   └── dreamService.test.ts
├── stores/
│   ├── dreamStore.ts
│   └── dreamStore.test.ts
└── utils/
    ├── formatDate.ts
    └── formatDate.test.ts
```

### E2E Test Structure
```
e2e/
├── mobile/
│   ├── .maestro/
│   │   ├── login-flow.yml
│   │   ├── dream-recording.yml
│   │   └── dream-analysis.yml
│   └── setup/
├── web/
│   ├── tests/
│   │   ├── auth.spec.ts
│   │   ├── dream-management.spec.ts
│   │   └── data-export.spec.ts
│   └── playwright.config.ts
```

## Unit Testing

### Testing Utilities (`@somni/utils`)

```typescript
// utils/src/formatDate.test.ts
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should format ISO date string to locale date', () => {
    const isoDate = '2024-01-15T10:30:00.000Z';
    const formatted = formatDate(isoDate);
    
    // Use regex to match different locale formats
    expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  it('should handle invalid date strings', () => {
    expect(() => formatDate('invalid-date')).toThrow();
  });

  it('should format different timezones consistently', () => {
    const date1 = '2024-01-15T00:00:00.000Z';
    const date2 = '2024-01-15T23:59:59.999Z';
    
    const formatted1 = formatDate(date1);
    const formatted2 = formatDate(date2);
    
    // Both should format to the same date
    expect(formatted1).toBe(formatted2);
  });
});
```

### Testing Services

```typescript
// services/dreamService.test.ts
import { DreamService } from './dreamService';
import { supabase } from '../lib/supabase';
import { DreamEntry } from '@somni/types';

// Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('DreamService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDream', () => {
    it('should create a dream successfully', async () => {
      const mockDream = {
        title: 'Test Dream',
        content: 'Test content',
        date: '2024-01-15T10:30:00.000Z',
        tags: ['test'],
      };

      const mockResponse = {
        id: 'dream-123',
        user_id: 'user-456',
        ...mockDream,
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-456' } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockResponse,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await DreamService.createDream(mockDream);

      expect(result).toEqual({
        id: 'dream-123',
        userId: 'user-456',
        title: 'Test Dream',
        content: 'Test content',
        date: '2024-01-15T10:30:00.000Z',
        tags: ['test'],
        interpretation: undefined,
      });
    });

    it('should handle creation errors', async () => {
      const mockDream = {
        title: 'Test Dream',
        content: 'Test content',
        date: '2024-01-15T10:30:00.000Z',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-456' } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      } as any);

      await expect(DreamService.createDream(mockDream)).rejects.toThrow('Database error');
    });
  });
});
```

### Testing Stores (Zustand)

```typescript
// stores/dreamStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useDreamStore } from './dreamStore';
import { DreamEntry } from '@somni/types';

// Mock the dream service
jest.mock('../services/dreamService');

describe('dreamStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDreamStore.getState().clearAll();
  });

  it('should add a dream to the store', () => {
    const { result } = renderHook(() => useDreamStore());

    const mockDream: Omit<DreamEntry, 'id'> = {
      userId: 'user-123',
      title: 'Test Dream',
      content: 'Test content',
      date: '2024-01-15T10:30:00.000Z',
    };

    act(() => {
      result.current.addDream(mockDream);
    });

    expect(result.current.dreams).toHaveLength(1);
    expect(result.current.dreams[0]).toMatchObject(mockDream);
    expect(result.current.dreams[0].id).toBeDefined();
  });

  it('should update a dream in the store', () => {
    const { result } = renderHook(() => useDreamStore());

    const mockDream: Omit<DreamEntry, 'id'> = {
      userId: 'user-123',
      title: 'Test Dream',
      content: 'Test content',
      date: '2024-01-15T10:30:00.000Z',
    };

    act(() => {
      result.current.addDream(mockDream);
    });

    const dreamId = result.current.dreams[0].id;

    act(() => {
      result.current.updateDream(dreamId, { title: 'Updated Dream' });
    });

    expect(result.current.dreams[0].title).toBe('Updated Dream');
  });

  it('should handle loading states correctly', async () => {
    const { result } = renderHook(() => useDreamStore());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.loadDreams();
    });

    expect(result.current.isLoading).toBe(true);

    // Wait for async operation to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
  });
});
```

## Component Testing

### React Native Component Testing

```typescript
// components/atoms/Button/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('should render with correct text', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPress} />
    );

    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPress} disabled />
    );

    const button = getByText('Test Button').parent;
    expect(button).toHaveStyle({ opacity: 0.5 });

    fireEvent.press(getByText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} style={customStyle} />
    );

    const button = getByText('Test Button').parent;
    expect(button).toHaveStyle(customStyle);
  });
});
```

### Complex Component Testing

```typescript
// components/organisms/DreamCard/DreamCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DreamCard } from './DreamCard';
import { DreamEntry } from '@somni/types';

const mockDream: DreamEntry = {
  id: 'dream-123',
  userId: 'user-456',
  title: 'Flying Dream',
  content: 'I was flying over mountains...',
  date: '2024-01-15T10:30:00.000Z',
  tags: ['flying', 'mountains'],
};

describe('DreamCard', () => {
  it('should display dream information correctly', () => {
    const { getByText } = render(
      <DreamCard dream={mockDream} onPress={() => {}} />
    );

    expect(getByText('Flying Dream')).toBeTruthy();
    expect(getByText('I was flying over mountains...')).toBeTruthy();
    expect(getByText('flying, mountains')).toBeTruthy();
  });

  it('should call onPress with dream id when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <DreamCard dream={mockDream} onPress={onPress} />
    );

    fireEvent.press(getByTestId('dream-card'));
    expect(onPress).toHaveBeenCalledWith('dream-123');
  });

  it('should format date correctly', () => {
    const { getByText } = render(
      <DreamCard dream={mockDream} onPress={() => {}} />
    );

    // Check that date is formatted (exact format may vary by locale)
    expect(getByText(/1\/15\/2024|15\/1\/2024/)).toBeTruthy();
  });

  it('should handle dreams without tags', () => {
    const dreamWithoutTags = { ...mockDream, tags: undefined };
    const { queryByText } = render(
      <DreamCard dream={dreamWithoutTags} onPress={() => {}} />
    );

    expect(queryByText('flying, mountains')).toBeNull();
  });
});
```

### Testing with Context Providers

```typescript
// __tests__/utils/testUtils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { AuthProvider } from '../src/contexts/AuthContext';

interface CustomRenderOptions extends RenderOptions {
  theme?: 'light' | 'dark';
  user?: User | null;
}

const AllTheProviders: React.FC<{
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  user?: User | null;
}> = ({ children, theme = 'light', user = null }) => {
  return (
    <ThemeProvider initialTheme={theme}>
      <AuthProvider initialUser={user}>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { theme, user, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders theme={theme} user={user}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

export * from '@testing-library/react-native';
export { customRender as render };
```

## Integration Testing

### API Integration Tests

```typescript
// __tests__/integration/dreamApi.test.ts
import { DreamService } from '../../src/services/dreamService';
import { supabase } from '../../src/lib/supabase';

// Use real Supabase client with test database
describe('Dream API Integration', () => {
  beforeAll(async () => {
    // Set up test user
    await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword',
    });
  });

  afterAll(async () => {
    // Clean up test data
    await supabase.from('dreams').delete().neq('id', '');
    await supabase.auth.signOut();
  });

  it('should create and retrieve a dream', async () => {
    const dreamData = {
      title: 'Integration Test Dream',
      content: 'This is a test dream for integration testing',
      date: new Date().toISOString(),
      tags: ['test', 'integration'],
    };

    // Create dream
    const createdDream = await DreamService.createDream(dreamData);
    expect(createdDream.id).toBeDefined();
    expect(createdDream.title).toBe(dreamData.title);

    // Retrieve dream
    const retrievedDream = await DreamService.getDreamById(createdDream.id);
    expect(retrievedDream).toEqual(createdDream);

    // Clean up
    await DreamService.deleteDream(createdDream.id);
  });

  it('should handle search functionality', async () => {
    // Create test dreams
    const dream1 = await DreamService.createDream({
      title: 'Flying Dream',
      content: 'I was flying over the ocean',
      date: new Date().toISOString(),
    });

    const dream2 = await DreamService.createDream({
      title: 'Running Dream',
      content: 'I was running through a forest',
      date: new Date().toISOString(),
    });

    // Search for dreams
    const searchResults = await DreamService.searchDreams('flying');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].id).toBe(dream1.id);

    // Clean up
    await DreamService.deleteDream(dream1.id);
    await DreamService.deleteDream(dream2.id);
  });
});
```

### Store Integration Tests

```typescript
// __tests__/integration/dreamStore.integration.test.ts
import { renderHook, act } from '@testing-library/react';
import { useDreamStore } from '../../src/stores/dreamStore';
import { DreamService } from '../../src/services/dreamService';

// Mock the service to control responses
jest.mock('../../src/services/dreamService');
const mockDreamService = DreamService as jest.Mocked<typeof DreamService>;

describe('Dream Store Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDreamStore.getState().clearAll();
  });

  it('should load dreams from API and update store', async () => {
    const mockDreams = [
      {
        id: 'dream-1',
        userId: 'user-1',
        title: 'Dream 1',
        content: 'Content 1',
        date: '2024-01-15T10:30:00.000Z',
      },
      {
        id: 'dream-2',
        userId: 'user-1',
        title: 'Dream 2',
        content: 'Content 2',
        date: '2024-01-14T10:30:00.000Z',
      },
    ];

    mockDreamService.getDreams.mockResolvedValue(mockDreams);

    const { result } = renderHook(() => useDreamStore());

    await act(async () => {
      await result.current.loadDreams();
    });

    expect(result.current.dreams).toEqual(mockDreams);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Failed to load dreams';
    mockDreamService.getDreams.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDreamStore());

    await act(async () => {
      await result.current.loadDreams();
    });

    expect(result.current.dreams).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });
});
```

## End-to-End Testing

### Maestro Tests (React Native)

```yaml
# e2e/mobile/.maestro/dream-recording.yml
appId: com.somni.mobile
---
- launchApp
- assertVisible: "Welcome to Somni"

# Navigate to recording screen
- tapOn: "Record Dream"
- assertVisible: "Start Recording"

# Test recording functionality
- tapOn: "Start Recording"
- assertVisible: "Recording..."
- wait: 3000
- tapOn: "Stop Recording"
- assertVisible: "Processing..."

# Wait for transcription
- wait: 5000
- assertVisible: "Transcription complete"

# Add dream details
- tapOn: "Dream Title"
- inputText: "Test Dream from E2E"
- tapOn: "Add Tags"
- inputText: "test,e2e,automated"
- tapOn: "Save Dream"

# Verify dream was saved
- assertVisible: "Dream saved successfully"
- tapOn: "View Dreams"
- assertVisible: "Test Dream from E2E"
```

```yaml
# e2e/mobile/.maestro/login-flow.yml
appId: com.somni.mobile
---
- launchApp
- assertVisible: "Welcome to Somni"

# Test login flow
- tapOn: "Sign In"
- assertVisible: "Email"
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "testpassword"
- tapOn: "Sign In"

# Verify successful login
- assertVisible: "Dreams"
- assertVisible: "Record"
- assertVisible: "Community"
- assertVisible: "Profile"
```

### Playwright Tests (Web)

```typescript
// e2e/web/tests/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/');
    
    // Click login button
    await page.click('text=Sign In');
    
    // Fill login form
    await page.fill('[data-testid=email-input]', 'test@example.com');
    await page.fill('[data-testid=password-input]', 'testpassword');
    await page.click('[data-testid=login-button]');
    
    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid=email-input]', 'invalid@example.com');
    await page.fill('[data-testid=password-input]', 'wrongpassword');
    await page.click('[data-testid=login-button]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
```

```typescript
// e2e/web/tests/dream-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dream Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'test@example.com');
    await page.fill('[data-testid=password-input]', 'testpassword');
    await page.click('[data-testid=login-button]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create a new dream entry', async ({ page }) => {
    await page.click('text=New Dream');
    
    await page.fill('[data-testid=dream-title]', 'E2E Test Dream');
    await page.fill('[data-testid=dream-content]', 'This is a test dream created by E2E tests');
    await page.fill('[data-testid=dream-tags]', 'test,e2e,automated');
    
    await page.click('[data-testid=save-dream]');
    
    await expect(page.locator('text=Dream saved successfully')).toBeVisible();
    await expect(page.locator('text=E2E Test Dream')).toBeVisible();
  });

  test('should search dreams', async ({ page }) => {
    await page.fill('[data-testid=search-input]', 'flying');
    await page.press('[data-testid=search-input]', 'Enter');
    
    // Wait for search results
    await page.waitForSelector('[data-testid=dream-card]');
    
    const dreamCards = page.locator('[data-testid=dream-card]');
    const count = await dreamCards.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Verify search results contain the search term
    for (let i = 0; i < count; i++) {
      const dreamCard = dreamCards.nth(i);
      const text = await dreamCard.textContent();
      expect(text?.toLowerCase()).toContain('flying');
    }
  });

  test('should export dreams', async ({ page }) => {
    await page.click('[data-testid=export-button]');
    await page.click('text=Export as JSON');
    
    // Wait for download
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid=confirm-export]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/dreams.*\.json$/);
  });
});
```

## Test Data Management

### Test Factories

```typescript
// __tests__/factories/dreamFactory.ts
import { DreamEntry } from '@somni/types';

export const createMockDream = (overrides: Partial<DreamEntry> = {}): DreamEntry => ({
  id: `dream-${Math.random().toString(36).substr(2, 9)}`,
  userId: `user-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Dream',
  content: 'This is a test dream content',
  date: new Date().toISOString(),
  tags: ['test'],
  interpretation: undefined,
  ...overrides,
});

export const createMockDreamList = (count: number = 3): DreamEntry[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockDream({
      title: `Test Dream ${index + 1}`,
      date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    })
  );
};
```

### Test Database Setup

```typescript
// __tests__/setup/database.ts
import { supabase } from '../../src/lib/supabase';

export const setupTestDatabase = async () => {
  // Create test user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'testpassword',
  });

  if (authError && authError.message !== 'User already registered') {
    throw authError;
  }

  return authData.user;
};

export const cleanupTestDatabase = async () => {
  // Clean up test data
  await supabase.from('dreams').delete().neq('id', '');
  await supabase.from('dream_analysis').delete().neq('id', '');
  await supabase.from('dream_symbols').delete().neq('id', '');
};
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:unit --workspaces
      - run: npm run test:coverage --workspaces
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  e2e-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install
      - run: npm run build:web
      - run: npm run test:e2e:web

  e2e-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: curl -Ls "https://get.maestro.mobile.dev" | bash
      - run: export PATH="$PATH":"$HOME/.maestro/bin"
      - run: npm run test:e2e:mobile
```

## Test Scripts

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=__tests__",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e:web": "playwright test",
    "test:e2e:mobile": "maestro test e2e/mobile/.maestro",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e:web && npm run test:e2e:mobile"
  }
}
```

This comprehensive testing strategy ensures high code quality, catches regressions early, and provides confidence when deploying new features to the Somni platform.