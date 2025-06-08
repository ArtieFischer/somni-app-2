# Monorepo Architecture

## Overview

The Somni project uses a monorepo structure with npm workspaces to manage multiple applications and shared packages. This architecture promotes code reuse, consistent tooling, simplified dependency management, and implements clean architecture principles across the entire codebase.

## Directory Structure

```
somni-monorepo/
├── apps/                    # Applications
│   ├── mobile/             # React Native Expo app
│   └── web/                # React Vite web app
├── packages/               # Shared packages
│   ├── core/              # Domain logic (Clean Architecture)
│   ├── stores/            # Zustand state management
│   ├── theme/             # Design system and theming
│   └── locales/           # Internationalization
├── types/                  # Shared TypeScript types
├── utils/                  # Shared utility functions
├── docs/                   # Project documentation
├── supabase/               # Supabase migrations and config
├── sql/                    # SQL scripts for manual execution
├── package.json            # Root package.json with workspaces
├── tsconfig.base.json      # Base TypeScript configuration
├── .eslintrc.js           # ESLint configuration
└── .prettierrc.js         # Prettier configuration
```

## Workspaces

### Applications (`apps/`)

#### Mobile App (`apps/mobile/`)
- **Package Name**: `@somni/mobile`
- **Technology**: React Native with Expo SDK 53+
- **Purpose**: iOS and Android mobile application
- **Architecture**: Clean Architecture with domain-driven design

**Key Features**:
- Voice recording and transcription
- Offline dream storage
- Native integrations (HealthKit, biometrics)
- Push notifications
- Multi-language support
- Dynamic theming

**Directory Structure**:
```
apps/mobile/
├── App.tsx                 # Main app component with i18n initialization
├── app.json               # Expo configuration
├── package.json           # Mobile-specific dependencies
├── babel.config.js        # Babel with module resolver
├── metro.config.js        # Metro bundler configuration
├── tsconfig.json          # TypeScript configuration
└── src/
    ├── components/        # UI components (Atomic Design)
    │   └── atoms/        # Basic UI elements (Text, Button)
    ├── screens/          # Screen components
    │   ├── auth/         # Authentication screens
    │   └── main/         # Main app screens
    ├── navigation/       # Navigation configuration
    ├── hooks/            # Custom React hooks
    ├── infrastructure/   # External interfaces layer
    │   ├── api/         # API clients (Supabase)
    │   ├── repositories/ # Repository implementations
    │   └── services/    # External services (Audio, Speech)
    └── shared/          # Shared utilities
        └── locales/     # i18n configuration
```

**Dependencies**:
- Core shared packages: `@somni/core`, `@somni/stores`, `@somni/theme`, `@somni/locales`
- React Native ecosystem: Expo SDK, React Navigation, React Hook Form
- Internationalization: i18next, expo-localization
- State management: Zustand (via `@somni/stores`)

#### Web App (`apps/web/`)
- **Package Name**: `@somni/web`
- **Technology**: React with Vite
- **Purpose**: Web application for dream management
- **Key Features**:
  - Dream journal browsing
  - Extended reading experience
  - Data export functionality
  - Cross-device synchronization

**Key Files**:
```
apps/web/
├── src/
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   ├── lib/
│   │   └── supabase.ts    # Supabase client configuration
│   └── vite-env.d.ts      # Vite environment types
├── package.json           # Web-specific dependencies
├── vite.config.ts         # Vite configuration with aliases
├── tsconfig.json          # TypeScript configuration
└── index.html             # HTML template
```

### Shared Packages (`packages/`)

#### Core Domain Logic (`packages/core/`)
- **Package Name**: `@somni/core`
- **Purpose**: Clean Architecture domain layer
- **Dependencies**: `@somni/types`

**Structure**:
```
packages/core/src/
├── entities/              # Domain entities
│   ├── Dream.ts          # Dream business logic
│   ├── User.ts           # User business logic
│   └── index.ts
├── useCases/             # Application use cases
│   └── dreams/
│       ├── RecordDreamUseCase.ts
│       ├── AnalyzeDreamUseCase.ts
│       └── index.ts
├── repositories/         # Repository interfaces
│   ├── IDreamRepository.ts
│   ├── IUserRepository.ts
│   └── index.ts
└── index.ts
```

**Key Features**:
- Domain entities with validation and business rules
- Use cases that orchestrate business logic
- Repository interfaces for data access abstraction
- Framework-agnostic business logic

#### State Management (`packages/stores/`)
- **Package Name**: `@somni/stores`
- **Purpose**: Centralized Zustand state management
- **Dependencies**: `zustand`, `@supabase/supabase-js`

**Structure**:
```
packages/stores/src/
├── authStore.ts          # Authentication state
├── dreamStore.ts         # Dreams and recording state
├── settingsStore.ts      # App settings and preferences
└── index.ts
```

**Features**:
- Domain-specific stores (auth, dreams, settings)
- Optimistic updates with error handling
- Recording session management
- Settings persistence

#### Design System (`packages/theme/`)
- **Package Name**: `@somni/theme`
- **Purpose**: Comprehensive design system
- **Dependencies**: None

**Structure**:
```
packages/theme/src/
├── colors.ts             # Color palette
├── spacing.ts            # Spacing scale
├── typography.ts         # Typography scale
├── themes/
│   ├── light.ts         # Light theme
│   └── dark.ts          # Dark theme
└── index.ts
```

**Features**:
- Comprehensive color system with semantic tokens
- Consistent spacing scale (8px grid)
- Typography scale with line heights
- Light/dark theme support
- Shadow and border radius definitions

#### Internationalization (`packages/locales/`)
- **Package Name**: `@somni/locales`
- **Purpose**: Translation resources and i18n types
- **Dependencies**: None

**Structure**:
```
packages/locales/src/
├── en/                   # English translations
│   ├── common.json      # Common UI text
│   ├── dreams.json      # Dream-related text
│   ├── auth.json        # Authentication text
│   └── index.ts
├── es/                   # Spanish translations
│   ├── common.json
│   └── index.ts
├── types.ts             # TypeScript types
└── index.ts
```

**Features**:
- Namespace-based organization
- TypeScript type safety for translations
- Pluralization support
- Interpolation support

#### Legacy Shared Packages

#### Types (`types/`)
- **Package Name**: `@somni/types`
- **Purpose**: Shared TypeScript interfaces and types
- **Usage**: Imported by all other packages and applications

**Current Types**:
```typescript
// Database schema types
export interface UserProfile {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_premium: boolean;
  onboarding_completed: boolean;
  sleep_schedule?: object;
  lucid_dream_settings?: object;
}

export type SleepPhase = 'rem' | 'nrem' | 'light' | 'deep' | 'awake';

export interface Dream {
  id: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  raw_transcript?: string;
  refined_narrative?: string;
  audio_url?: string;
  sleep_phase?: SleepPhase;
  is_lucid?: boolean;
  mood_before?: number; // 1-5
  mood_after?: number; // 1-5
  embedding?: number[]; // Vector array
}
```

#### Utils (`utils/`)
- **Package Name**: `@somni/utils`
- **Purpose**: Shared utility functions
- **Dependencies**: `@somni/types`

**Current Utilities**:
```typescript
// Date formatting utility
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

// Dream title extraction (legacy)
export const getDreamTitle = (dream: DreamEntry): string => {
  return dream.title;
};
```

### Database and Configuration

#### Supabase (`supabase/`)
- **Purpose**: Version-controlled database migrations
- **Structure**:
  ```
  supabase/
  └── migrations/
      ├── 20250607022225_stark_castle.sql      # Enable pgvector
      ├── 20250607022226_crimson_ocean.sql     # Core tables
      ├── 20250607022233_damp_shrine.sql       # RLS and triggers
      ├── 20250607022239_quick_prism.sql       # Vector functions
      └── 20250607022243_light_hat.sql         # Additional tables
  ```

#### SQL Scripts (`sql/`)
- **Purpose**: Manual SQL execution scripts for Supabase dashboard
- **Structure**:
  ```
  sql/
  ├── README.md                    # Execution instructions
  ├── 01-enable-extensions.sql     # Enable pgvector
  ├── 02-create-tables.sql         # Core schema
  ├── 03-setup-rls.sql            # Security policies
  ├── 04-vector-functions.sql     # Search functions
  └── 05-additional-tables.sql    # Supporting tables
  ```

## Configuration Files

### Root Configuration

#### `package.json`
- Defines workspaces including new shared packages
- Contains root-level scripts
- Manages shared development dependencies

```json
{
  "workspaces": [
    "apps/*",
    "packages/*",
    "types",
    "utils"
  ]
}
```

#### `tsconfig.base.json`
- Base TypeScript configuration for all workspaces
- Defines path mappings for all shared packages
- Sets common compiler options

```json
{
  "compilerOptions": {
    "paths": {
      "@somni/types": ["types/src"],
      "@somni/utils": ["utils/src"],
      "@somni/core": ["packages/core/src"],
      "@somni/locales": ["packages/locales/src"],
      "@somni/theme": ["packages/theme/src"],
      "@somni/stores": ["packages/stores/src"]
    }
  }
}
```

### Application-Specific Configuration

#### Mobile App Configuration
- **Babel Config**: Module resolver for shared packages and local aliases
- **Metro Config**: Handles monorepo module resolution
- **Expo Config**: App metadata and native features
- **Supabase Client**: Configured with AsyncStorage for session persistence

```javascript
// babel.config.js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    ['module-resolver', {
      alias: {
        '@components': './src/components',
        '@screens': './src/screens',
        '@hooks': './src/hooks',
        '@somni/core': '../../packages/core/src',
        '@somni/stores': '../../packages/stores/src',
        '@somni/theme': '../../packages/theme/src',
        '@somni/locales': '../../packages/locales/src',
      }
    }]
  ]
};
```

#### Web App Configuration
- **Vite Config**: Build tool configuration with alias resolution
- **TypeScript Config**: Extends base config with web-specific settings
- **Supabase Client**: Standard browser configuration

## Dependency Management

### Shared Dependencies
Common dependencies are installed at the root level:
- TypeScript
- ESLint
- Prettier
- Testing frameworks

### Application-Specific Dependencies
Each app manages its own dependencies:
- React Native/Expo packages for mobile
- React/Vite packages for web
- Platform-specific libraries

**Mobile App Specific**:
- `@react-native-async-storage/async-storage` - Session persistence
- `expo-localization` - Device locale detection
- `i18next` - Internationalization
- `babel-plugin-module-resolver` - Module path resolution

**Web App Specific**:
- Vite and related build tools
- Web-specific React libraries

### Shared Package Dependencies
- **@somni/core**: Depends on `@somni/types`
- **@somni/stores**: Depends on `zustand`, `@supabase/supabase-js`
- **@somni/theme**: No external dependencies
- **@somni/locales**: No external dependencies
- **@somni/types**: No external dependencies
- **@somni/utils**: Depends on `@somni/types`

## Import Patterns

### Importing Shared Packages

```typescript
// Core domain logic
import { Dream, User, RecordDreamUseCase } from '@somni/core';

// State management
import { useAuthStore, useDreamStore } from '@somni/stores';

// Theming
import { lightTheme, darkTheme, Theme } from '@somni/theme';

// Translations
import en from '@somni/locales/en';

// Legacy types and utils
import { UserProfile, Dream as DreamType } from '@somni/types';
import { formatDate } from '@somni/utils';
```

### Mobile App Internal Imports

```typescript
// Components
import { Text, Button } from '@components/atoms';

// Hooks
import { useAuth, useTheme, useTranslation } from '@hooks';

// Infrastructure
import { DreamRepository, UserRepository } from '../infrastructure/repositories';
import { AudioService, SpeechService } from '../infrastructure/services';
```

### Clean Architecture Boundaries

```typescript
// ✅ Correct: Domain layer imports
import { Dream, RecordDreamUseCase, IDreamRepository } from '@somni/core';

// ✅ Correct: Infrastructure implements domain interfaces
export class DreamRepository implements IDreamRepository {
  // Implementation
}

// ❌ Incorrect: Domain layer should not import infrastructure
// Domain entities should not know about Supabase, React, etc.
```

## Adding New Shared Packages

### 1. Create Package Directory
```bash
mkdir packages/new-package
cd packages/new-package
```

### 2. Initialize Package
```bash
npm init -y
```

### 3. Configure Package.json
```json
{
  "name": "@somni/new-package",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

### 4. Add TypeScript Configuration
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "composite": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

### 5. Update Root Configuration
Add to `tsconfig.base.json` paths:
```json
{
  "paths": {
    "@somni/new-package": ["packages/new-package/src"]
  }
}
```

### 6. Install in Applications
```bash
npm install @somni/new-package --workspace=@somni/mobile
npm install @somni/new-package --workspace=@somni/web
```

## Best Practices

### Clean Architecture
1. Keep domain logic in `@somni/core` free from external dependencies
2. Implement repository interfaces in infrastructure layer
3. Use dependency injection for use cases
4. Maintain clear boundaries between layers

### Package Organization
1. Keep packages focused and single-purpose
2. Avoid circular dependencies between packages
3. Use clear, descriptive package names
4. Document package APIs thoroughly

### State Management
1. Organize stores by business domain
2. Use optimistic updates for better UX
3. Handle loading and error states consistently
4. Persist important state for offline support

### Theming and Design
1. Use semantic color tokens
2. Maintain consistent spacing scale
3. Support both light and dark themes
4. Ensure accessibility compliance

### Internationalization
1. Organize translations by feature/domain
2. Use TypeScript for translation key safety
3. Support pluralization and interpolation
4. Test with different locales and RTL languages

This architecture provides a robust foundation for the Somni application with proper separation of concerns, reusable components, and maintainable code organization.