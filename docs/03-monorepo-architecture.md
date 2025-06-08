# Monorepo Architecture

## 🌙 Current Implementation Overview

**Last Updated**: December 2024  
**Implementation Status**: Features 1.1, 1.2, 2.1 Complete ✅

The Somni project uses a monorepo structure with npm workspaces to manage the mobile application and shared packages. This architecture promotes code reuse, consistent tooling, simplified dependency management, and implements clean architecture principles.

## ✅ Current Directory Structure

```
somni-app-2/
├── apps/                    # Applications
│   └── mobile/             # React Native Expo app ✅ IMPLEMENTED
├── packages/               # Shared packages ✅ IMPLEMENTED
│   ├── stores/            # Zustand state management ✅
│   ├── theme/             # Oniric design system ✅
│   ├── locales/           # Internationalization ✅
│   └── types/             # TypeScript type definitions ✅
├── docs/                   # Project documentation ✅
├── supabase/               # Supabase migrations and config ✅
├── .cursor/                # Development workspace files ✅
├── package.json            # Root package.json with workspaces ✅
├── tsconfig.json           # TypeScript configuration ✅
├── .eslintrc.js           # ESLint configuration ✅
├── .prettierrc.js         # Prettier configuration ✅
├── .husky/                # Git hooks ✅
└── eas.json               # Expo Application Services config ✅
```

## ✅ Implemented Workspaces

### Mobile Application (`apps/mobile/`)

- **Package Name**: `@somni/mobile` (in package.json)
- **Technology**: React Native with Expo SDK 53+
- **Purpose**: iOS and Android dream journaling application
- **Status**: ✅ **Core foundation complete** - Authentication, onboarding, oniric design

#### Current Features Implemented:

- **Authentication Flow** - Sign up, sign in, password reset, biometric auth
- **Onboarding Experience** - 6-screen flow with data collection and Supabase persistence
- **Oniric Design System** - Dark-only theme optimized for nighttime use
- **Profile Management** - User preferences, sleep schedule, dream goals
- **Navigation System** - Conditional routing based on auth and onboarding status
- **Internationalization** - Multi-language support with dreamlike translations

#### Directory Structure (Actual Implementation):

```
apps/mobile/
├── App.tsx                 # Main app component with theme and navigation
├── app.json               # Expo configuration
├── package.json           # Mobile-specific dependencies
├── babel.config.js        # Babel with module resolver
├── metro.config.js        # Metro bundler configuration
├── tsconfig.json          # TypeScript configuration
├── index.ts               # Entry point
├── eas.json               # EAS build configuration
└── src/
    ├── components/        # UI components (Atomic Design) ✅
    │   ├── atoms/        # Button, Input, Text ✅
    │   ├── molecules/    # MultiSelectChip, AuthInput ✅
    │   └── organisms/    # OnboardingScreenLayout ✅
    ├── screens/          # Screen components ✅
    │   ├── auth/         # Authentication screens ✅
    │   │   ├── WelcomeScreen/ ✅
    │   │   ├── SignInScreen/ ✅
    │   │   └── SignUpScreen/ ✅
    │   ├── onboarding/   # Onboarding flow ✅
    │   │   ├── OnboardingWelcomeScreen/ ✅
    │   │   ├── OnboardingSleepScheduleScreen/ ✅
    │   │   ├── OnboardingGoalsScreen/ ✅
    │   │   ├── OnboardingLucidityScreen/ ✅
    │   │   ├── OnboardingPrivacyScreen/ ✅
    │   │   └── OnboardingCompleteScreen/ ✅
    │   └── main/         # Main app screens ✅
    │       └── HomeScreen/ ✅
    ├── navigation/       # Navigation configuration ✅
    │   ├── AppNavigator.tsx ✅
    │   ├── AuthNavigator.tsx ✅
    │   ├── OnboardingNavigator.tsx ✅
    │   └── MainNavigator.tsx ✅
    ├── hooks/            # Custom React hooks ✅
    │   ├── useAuth.ts ✅
    │   ├── useTheme.ts ✅
    │   └── useTranslation.ts ✅
    ├── infrastructure/   # External interfaces layer ✅
    │   ├── auth/ ✅
    │   └── repositories/ ✅
    └── config/          # App configuration ✅
        └── reactotron.ts ✅
```

#### Key Dependencies (Implemented):

```json
{
  "@react-native-community/datetimepicker": "^8.2.0",
  "@react-navigation/native": "^6.1.18",
  "@react-navigation/native-stack": "^6.11.0",
  "@supabase/supabase-js": "^2.45.4",
  "expo": "~53.0.0",
  "expo-dev-client": "~4.0.27",
  "expo-local-authentication": "~14.0.1",
  "expo-localization": "~15.0.3",
  "expo-notifications": "~0.29.9",
  "lottie-react-native": "^7.1.0",
  "react": "18.3.1",
  "react-hook-form": "^7.53.2",
  "react-native": "0.76.1",
  "zustand": "^5.0.1"
}
```

### ✅ Implemented Shared Packages (`packages/`)

#### State Management (`packages/stores/`)

- **Package Name**: `@somni/stores`
- **Purpose**: Centralized Zustand state management
- **Status**: ✅ **Complete** - Auth and onboarding stores implemented

**Current Structure**:

```
packages/stores/src/
├── authStore.ts          # Authentication & user profile state ✅
├── onboardingStore.ts    # Temporary onboarding data collection ✅
└── index.ts             # Store exports ✅
```

**Implemented Features**:

- **AuthStore**: User authentication, profile management, session persistence
- **OnboardingStore**: Multi-screen data collection with lifecycle management
- **TypeScript Integration**: Fully typed store interfaces
- **Persistence**: Automatic auth state persistence with selective storage

#### Design System (`packages/theme/`)

- **Package Name**: `@somni/theme`
- **Purpose**: Oniric design system with dark-only theme
- **Status**: ✅ **Complete** - Full oniric color palette and components

**Current Structure**:

```
packages/theme/src/
├── colors.ts             # Oniric color palette ✅
├── spacing.ts            # 4px-based spacing system ✅
├── typography.ts         # Typography scale ✅
├── shadows.ts            # Purple-tinted shadow system ✅
├── theme.ts              # Combined theme object ✅
└── index.ts             # Theme exports ✅
```

**Implemented Features**:

- **Oniric Color System**: Aurora purples, midnight backgrounds, ethereal teals
- **Dark-Only Design**: Optimized for nighttime dream journaling
- **Accessibility**: WCAG-compliant contrast ratios
- **Component Standards**: 48dp minimum button heights, consistent spacing
- **Purple Shadows**: Ethereal depth effects throughout UI

#### Internationalization (`packages/locales/`)

- **Package Name**: `@somni/locales`
- **Purpose**: Translation resources with dreamlike copy
- **Status**: ✅ **Complete** - Auth, onboarding, and welcome translations

**Current Structure**:

```
packages/locales/src/
├── en/                   # English translations ✅
│   ├── auth.json        # Authentication copy ✅
│   ├── onboarding.json  # Onboarding flow copy ✅
│   ├── welcome.json     # Welcome screen copy ✅
│   ├── common.json      # Common UI text ✅
│   └── index.ts         # Translation aggregation ✅
├── types.ts             # TypeScript translation types ✅
└── index.ts             # Package exports ✅
```

**Implemented Features**:

- **Oniric Copy**: Dreamlike translations ("Return to the Dream Realm", "Enter Dreams")
- **Comprehensive Coverage**: All user-facing text uses translations
- **Type Safety**: Full TypeScript integration for translation keys
- **Namespace Organization**: Logical grouping by feature area

#### Type Definitions (`packages/types/`)

- **Package Name**: `@somni/types`
- **Purpose**: Shared TypeScript interfaces
- **Status**: ✅ **Complete** - All current feature types defined

**Current Implementation**:

- User profile and authentication types
- Store interfaces (AuthStore, OnboardingStore)
- Component prop types (Button, Input, Text, MultiSelectChip)
- Navigation parameter lists
- Form validation types (Zod integration)
- Theme and translation types

## ✅ Current Architecture Patterns

### State Management Architecture

**Zustand Store Pattern**:

```typescript
// Domain-driven store organization
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State and actions
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        /* selective persistence */
      }),
    },
  ),
);
```

**Benefits**:

- Lightweight and performant
- TypeScript-first design
- Selective persistence
- Domain separation (auth vs onboarding)

### Component Architecture (Atomic Design)

**Implementation**:

```
src/components/
├── atoms/           # Basic building blocks
│   ├── Button/     # Primary, secondary, ghost variants
│   ├── Input/      # Form inputs with validation
│   └── Text/       # Typography component
├── molecules/       # Component combinations
│   ├── MultiSelectChip/  # Selection interface
│   └── AuthInput/        # Specialized form input
└── organisms/       # Complex components
    └── OnboardingScreenLayout/  # Reusable layout
```

**Benefits**:

- Consistent component reuse
- Clear separation of concerns
- Easier testing and maintenance
- Scalable component library

### Navigation Architecture

**Conditional Navigation Pattern**:

```typescript
export const AppNavigator = () => {
  const { isAuthenticated, profile } = useAuthStore();

  if (!isAuthenticated) return <AuthNavigator />;
  if (!profile?.onboarding_completed) return <OnboardingNavigator />;
  return <MainNavigator />;
};
```

**Benefits**:

- Type-safe navigation
- Conditional flow based on user state
- Clear user journey paths

### Theme Architecture

**Oniric Design Pattern**:

```typescript
const theme = {
  colors: {
    background: { primary: '#0B1426', elevated: '#1A2332' },
    primary: '#8B5CF6', // Aurora purple
    accent: '#10B981', // Ethereal teal
    text: { primary: '#F8FAFC', secondary: '#CBD5E1' },
  },
  spacing: { xs: 4, small: 8, medium: 16, large: 24, xl: 32 },
  shadows: {
    /* Purple-tinted shadows */
  },
};
```

**Benefits**:

- Consistent visual language
- Optimized for nighttime use
- Accessibility compliance
- Dreamlike aesthetic

## 🔄 Planned Future Architecture

### Upcoming Packages (Phase 5+):

```
packages/
├── core/              # Domain logic (Clean Architecture) - PLANNED
├── utils/             # Shared utility functions - PLANNED
└── analytics/         # Analytics and tracking - PLANNED
```

### Planned Web Application:

```
apps/
├── mobile/           # Current React Native app ✅
└── web/              # React Vite web app - PLANNED
```

## Development Workflow

### Current Setup Commands:

```bash
# Install dependencies
npm install

# Start mobile development
npm run dev --workspace=@somni/mobile

# Build for development
npx eas build --profile development

# Lint all workspaces
npm run lint --workspaces

# Type check
npm run type-check --workspaces
```

### Git Hooks (Husky):

```bash
# Pre-commit (automatically runs)
- ESLint check across all workspaces
- Prettier formatting
- TypeScript compilation check
```

## Testing Architecture

### Current Testing Setup:

- **Jest**: Unit testing framework configured
- **React Native Testing Library**: Component testing utilities
- **TypeScript**: Compile-time type checking
- **ESLint**: Static code analysis

### Testing Patterns:

```typescript
// Store testing
describe('AuthStore', () => {
  test('should authenticate user', () => {
    // Test implementation
  });
});

// Component testing
describe('Button', () => {
  test('should render with correct variant', () => {
    // Test implementation
  });
});
```

## Build & Deployment

### EAS Build Configuration:

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### Current Deployment Status:

- **Development Builds**: ✅ Configured with EAS
- **Preview Builds**: ✅ Ready for internal testing
- **Production Builds**: ✅ Configured for app stores

## Performance Considerations

### Implemented Optimizations:

- **Conditional Navigation**: Reduces initial bundle size
- **Selective Store Persistence**: Only essential auth state persisted
- **Component Memoization**: Efficient re-rendering patterns
- **Theme Caching**: Single theme object shared across app

### Bundle Splitting Strategy:

- Authentication flow (separate chunk)
- Onboarding flow (lazy loaded)
- Main app features (code splitting ready)

## Security Implementation

### Current Security Measures:

- **Supabase Row Level Security**: Database-level access controls
- **Biometric Authentication**: Face ID/Touch ID integration
- **Secure Storage**: Encrypted auth token storage
- **Type Safety**: Compile-time error prevention

This monorepo architecture provides a solid foundation for the Somni dream journaling platform, with clean separation of concerns, reusable components, and scalable patterns that support both current features and future expansion.
