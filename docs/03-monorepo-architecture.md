# Monorepo Architecture

## Overview

The Somni project uses a monorepo structure with npm workspaces to manage multiple applications and shared packages. This architecture promotes code reuse, consistent tooling, and simplified dependency management.

## Directory Structure

```
somni-monorepo/
├── apps/                    # Applications
│   ├── mobile/             # React Native Expo app
│   └── web/                # React Vite web app
├── packages/               # Shared packages (future)
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
- **Key Features**:
  - Voice recording and transcription
  - Offline dream storage
  - Native integrations (HealthKit, biometrics)
  - Push notifications

**Key Files**:
```
apps/mobile/
├── App.tsx                 # Main app component
├── app.json               # Expo configuration
├── package.json           # Mobile-specific dependencies
├── metro.config.js        # Metro bundler configuration
├── babel.config.js        # Babel configuration
├── tsconfig.json          # TypeScript configuration
└── src/
    └── lib/
        └── supabase.ts    # Supabase client configuration
```

**Dependencies Note**: The mobile app includes `react-native-web` for Expo's web build target and `@react-native-async-storage/async-storage` for persistent session storage with Supabase.

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
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── index.html             # HTML template
```

### Shared Packages

#### Types (`types/`)
- **Package Name**: `@somni/types`
- **Purpose**: Shared TypeScript interfaces and types
- **Usage**: Imported by both mobile and web applications

**Current Types**:
```typescript
// Current database schema types
export interface UserProfile {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_premium: boolean;
  onboarding_completed: boolean;
  sleep_schedule?: object;
  lucid_dream_settings?: object;
  created_at: string;
  updated_at: string;
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

// Legacy types (deprecated)
export interface User {
  id: string;
  email?: string;
}

export interface DreamEntry {
  id: string;
  userId: string;
  date: string;
  title: string;
  content: string;
  interpretation?: string;
  tags?: string[];
}
```

#### Utils (`utils/`)
- **Package Name**: `@somni/utils`
- **Purpose**: Shared utility functions
- **Dependencies**: Can import from `@somni/types`

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

#### Packages (`packages/`) - Future Use
- **Purpose**: Additional shared packages as the project grows
- **Examples**: UI components, configuration, API clients

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
- Defines workspaces
- Contains root-level scripts
- Manages shared development dependencies
- Includes `react-native-web` for Expo compatibility

```json
{
  "workspaces": [
    "apps/*",
    "packages/*",
    "types",
    "utils"
  ],
  "dependencies": {
    "react-native-web": "^0.20.0"
  }
}
```

#### `tsconfig.base.json`
- Base TypeScript configuration for all workspaces
- Defines path mappings for shared packages
- Sets common compiler options

```json
{
  "compilerOptions": {
    "paths": {
      "@somni/types": ["types/src"],
      "@somni/utils": ["utils/src"],
      "@somni/ui-core": ["packages/ui-core/src"],
      "@somni/config/*": ["packages/config/*"]
    }
  }
}
```

### Application-Specific Configuration

#### Mobile App Configuration
- **Metro Config**: Handles monorepo module resolution
- **Babel Config**: Transpilation settings for React Native
- **Expo Config**: App metadata and native features
- **Supabase Client**: Configured with AsyncStorage for session persistence

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
- `react-native-web` (for Expo web builds)

### Application-Specific Dependencies
Each app manages its own dependencies:
- React Native/Expo packages for mobile
- React/Vite packages for web
- Platform-specific libraries

**Mobile App Specific**:
- `@react-native-async-storage/async-storage` - Session persistence
- `react-native-web` - Expo web build support
- `react-native-url-polyfill` - URL polyfill for React Native

**Web App Specific**:
- Vite and related build tools
- Web-specific React libraries

### Shared Package Dependencies
- Types package has no external dependencies
- Utils package can depend on types package
- Future packages can depend on any existing shared packages

## Import Patterns

### Importing Shared Packages

```typescript
// In mobile or web applications
import { UserProfile, Dream, SleepPhase } from '@somni/types';
import { formatDate } from '@somni/utils';

// Legacy imports (deprecated)
import { User, DreamEntry } from '@somni/types';
```

### Supabase Client Usage

```typescript
// Mobile app
import { supabase } from './src/lib/supabase';

// Web app
import { supabase } from './lib/supabase';
```

### Path Resolution
- TypeScript paths are configured in `tsconfig.base.json`
- Vite aliases are configured in `vite.config.ts`
- Metro resolver is configured in `metro.config.js`

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
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

### 4. Add TypeScript Configuration
```json
{
  "extends": "../tsconfig.base.json",
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

### Package Organization
1. Keep packages focused and single-purpose
2. Avoid circular dependencies between packages
3. Use clear, descriptive package names
4. Document package APIs thoroughly

### Dependency Management
1. Install shared dependencies at the root level
2. Keep application-specific dependencies in their respective packages
3. Regularly audit and update dependencies
4. Use exact versions for critical dependencies

### Code Sharing
1. Share types and interfaces through `@somni/types`
2. Share utility functions through `@somni/utils`
3. Consider creating UI component packages for shared components
4. Avoid duplicating business logic across applications

### Database Schema Management
1. Use version-controlled migrations in `supabase/migrations/`
2. Provide manual SQL scripts in `sql/` for dashboard execution
3. Keep database types in sync with `@somni/types`
4. Document all schema changes

### Version Management
1. Keep shared packages in sync
2. Use semantic versioning for packages
3. Update all dependents when shared packages change
4. Test changes across all applications

## react-native-web Usage

The `react-native-web` dependency is included at the root level to support Expo's web build target for the mobile app. This is **not** used by the dedicated web app (`apps/web`), which uses standard React and Vite for optimal web performance.

**Purpose**:
- Enables `expo start --web` for mobile app development
- Provides React Native component compatibility in web browsers
- Supports Expo's universal app development workflow

**Note**: The dedicated web app (`apps/web`) does not use `react-native-web` and instead uses native web technologies for better performance and web-specific features.