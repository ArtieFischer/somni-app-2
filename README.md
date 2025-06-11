# Somni - AI-Powered Dream Analysis Platform

A comprehensive dream tracking and analysis application built with React Native (Expo) and React (Vite) using clean architecture principles and modern development practices.

## Features

### Core Functionality
- **Voice-First Dream Recording**: Record dreams with speech-to-text transcription
- **AI Dream Analysis**: Multiple interpretation frameworks (Freudian, Jungian, Spiritual, Neurobiological)
- **Semantic Search**: Vector-based dream similarity search using pgvector
- **Cross-Platform**: Optimized mobile and web applications
- **Real-time Sync**: Supabase backend with real-time updates

### Advanced Upload System ✨ NEW
- **Progressive Upload Service**: Intelligent chunked uploads with network awareness
- **Offline Queue Management**: Automatic retry logic with exponential backoff
- **Network-Adaptive Uploads**: Adjusts chunk size and strategy based on connection quality
- **WiFi-Only Mode**: Configurable upload restrictions for data-conscious users
- **Smart Priority System**: Prioritizes uploads based on file size and network conditions
- **Real-time Progress Tracking**: Live upload progress with speed and ETA calculations

### Modern Architecture
- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **Shared Packages**: Modular codebase with reusable components and logic
- **Type Safety**: Strict TypeScript across the entire codebase
- **State Management**: Zustand stores organized by business domains
- **Design System**: Comprehensive oniric theming with dreamlike aesthetics
- **Internationalization**: Multi-language support with automatic locale detection

### Developer Experience
- **Monorepo Structure**: npm workspaces for efficient development
- **Hot Reloading**: Fast development cycles with Expo and Vite
- **Testing**: Comprehensive unit, integration, and E2E testing
- **Documentation**: Living documentation with detailed guides
- **Network Simulation**: Built-in network condition testing for upload scenarios

## Quick Start

### Prerequisites
- Node.js 18+
- npm
- Expo CLI: `npm install -g @expo/cli`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd somni-monorepo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Follow the [Supabase Setup Guide](./docs/10-supabase-setup.md)
   - Configure environment variables in both apps

4. **Start development**
   ```bash
   # Mobile app
   npm run dev:mobile
   
   # Web app
   npm run dev:web
   ```

## Project Structure

```
somni-monorepo/
├── apps/
│   ├── mobile/          # React Native Expo app
│   └── web/             # React Vite web app
├── packages/            # Shared packages
│   ├── core/           # Domain logic (Clean Architecture)
│   ├── stores/         # Zustand state management
│   ├── theme/          # Oniric design system
│   ├── locales/        # Internationalization
│   └── types/          # TypeScript definitions
├── utils/              # Shared utility functions
├── docs/               # Comprehensive documentation
└── supabase/           # Database migrations
```

## Architecture Highlights

### Clean Architecture Implementation
- **Domain Layer** (`@somni/core`): Business entities, use cases, and repository interfaces
- **Infrastructure Layer**: External service implementations (Supabase, audio services)
- **Presentation Layer**: UI components and screens with atomic design principles

### Shared Packages
- **@somni/core**: Framework-agnostic business logic
- **@somni/stores**: Centralized Zustand state management with offline queue and upload services
- **@somni/theme**: Comprehensive oniric design system with dreamlike aesthetics
- **@somni/locales**: Type-safe internationalization resources
- **@somni/types**: Comprehensive TypeScript definitions for all features

### Technology Stack
- **Frontend**: React Native (Expo SDK 53+), React (Vite), TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: Zustand with domain-specific stores and persistence
- **Upload System**: Progressive chunked uploads with network awareness
- **Styling**: Custom oniric design system with dark-first approach
- **Testing**: Jest, React Native Testing Library, Maestro
- **Database**: PostgreSQL with pgvector for semantic search

## Development

### Available Scripts

```bash
# Development
npm run dev:mobile        # Start mobile development server
npm run dev:web          # Start web development server

# Building
npm run build:web        # Build web application

# Linting and Type Checking
npm run lint --workspaces
npm run typecheck --workspaces
```

### Key Development Features

- **Hot Reloading**: Instant feedback during development
- **Type Safety**: Strict TypeScript with shared type definitions
- **Module Resolution**: Babel plugin for clean import paths
- **Oniric Theme System**: Dark-first design with dreamlike aesthetics
- **Internationalization**: Automatic device locale detection
- **Offline Support**: Local state persistence with intelligent background sync
- **Network Simulation**: Built-in tools for testing various network conditions

## New Features Deep Dive

### Progressive Upload System

The upload system provides enterprise-grade reliability with intelligent adaptation to network conditions:

#### Key Features:
- **Chunked Uploads**: Large files are split into manageable chunks for reliable transmission
- **Network Awareness**: Automatically adjusts upload strategy based on connection quality
- **Offline Queue**: Recordings are queued when offline and uploaded when connectivity returns
- **Smart Retry Logic**: Exponential backoff with configurable retry limits
- **Progress Tracking**: Real-time upload progress with speed and time estimates

#### Network Adaptation:
- **Excellent WiFi**: Large chunks (5MB), 3 concurrent uploads
- **Good Connection**: Standard chunks (1MB), 2 concurrent uploads  
- **Fair Connection**: Small chunks (512KB), single upload
- **Poor Connection**: Minimal chunks (256KB), extended timeouts

#### Usage Example:
```typescript
const queueHook = useOfflineRecordingQueue();

// Add recording to queue
queueHook.addRecording({
  sessionId: 'session_123',
  audioUri: 'file://recording.wav',
  duration: 120,
  fileSize: 2048000,
  recordedAt: new Date().toISOString()
});

// Monitor upload progress
const { currentUpload, networkStatus } = queueHook;
if (currentUpload) {
  console.log(`Upload progress: ${currentUpload.progress.percentage}%`);
}
```

### Oniric Design System

A dreamlike design system optimized for nighttime use:

#### Design Principles:
- **Dark-First**: Optimized for low-light environments
- **Ethereal Colors**: Aurora purples, midnight blues, ethereal teals
- **Accessibility**: WCAG 2.1 AA compliance with 48dp minimum touch targets
- **Micro-interactions**: Subtle animations and hover states

#### Color Palette:
- **Primary**: Aurora Purple (#8B5CF6)
- **Secondary**: Ethereal Teal (#10B981)
- **Background**: Deep Midnight (#0B1426)
- **Text**: Starlight White (#F8FAFC)
- **Accent**: Mystic Lavender (#A78BFA)

### Testing Infrastructure

Comprehensive testing tools for all system components:

#### Test Components:
- **Audio Service Test**: Record and playback testing with expo-audio
- **Network Status Test**: Connection quality and type detection
- **Dream Store Test**: Zustand state management with persistence
- **Offline Queue Test**: Queue management with network simulation
- **Upload Service Test**: Progressive upload strategies and chunked uploads
- **Integrated Queue Test**: End-to-end system integration testing

#### Network Simulation:
```typescript
// Simulate different network conditions
networkStatus.simulateNetworkCondition({
  type: 'cellular',
  quality: 'poor',
  isWifi: false,
  isConnected: true,
  isInternetReachable: true
});
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Project Overview](./docs/01-project-overview.md)** - Vision, features, and goals
- **[Getting Started](./docs/02-getting-started.md)** - Setup and installation
- **[Architecture](./docs/03-monorepo-architecture.md)** - Project structure and design
- **[Development Guidelines](./docs/04-development-guidelines.md)** - Coding standards
- **[Types & Interfaces](./docs/05-types-interfaces.md)** - TypeScript reference
- **[API Reference](./docs/06-api-reference.md)** - Supabase integration
- **[Testing Strategy](./docs/07-testing-strategy.md)** - Testing approaches
- **[Supabase Setup](./docs/10-supabase-setup.md)** - Database configuration

## Key Features in Detail

### Voice Recording & Analysis
- High-quality audio recording with expo-audio
- On-device speech recognition for privacy
- AI-powered dream analysis with multiple psychological frameworks
- Vector embeddings for semantic dream similarity search

### Cross-Platform Design
- Separate optimized applications for mobile and web
- Shared business logic and design system
- Platform-specific user experience patterns
- Consistent data synchronization

### Privacy & Security
- Row-level security with Supabase
- Optional anonymous sharing
- Local data encryption
- GDPR-compliant data handling

### Performance Optimization
- Hermes JavaScript engine for React Native
- Bundle optimization and code splitting
- Efficient state management with selective subscriptions
- Optimistic updates for responsive UI
- Intelligent upload queuing and network adaptation

## Contributing

1. **Read the documentation** - Familiarize yourself with the architecture
2. **Follow coding standards** - Use ESLint, Prettier, and TypeScript strictly
3. **Write tests** - Maintain high test coverage
4. **Update documentation** - Keep docs current with changes

### Development Workflow
1. Create feature branch from `main`
2. Implement changes following clean architecture principles
3. Add comprehensive tests using the built-in test components
4. Update relevant documentation
5. Submit pull request with detailed description

## Deployment

### Mobile App
- **Development**: Expo Go for testing
- **Production**: EAS Build for app store deployment

### Web App
- **Development**: Vite dev server
- **Production**: Static build deployment

## Recent Updates

### Version 2.1 - Advanced Upload System
- ✅ Progressive upload service with chunked uploads
- ✅ Offline queue management with intelligent retry
- ✅ Network-aware upload strategies
- ✅ Real-time progress tracking and monitoring
- ✅ Comprehensive testing infrastructure
- ✅ WiFi-only mode and data usage controls

### Version 2.0 - Oniric Design System
- ✅ Complete dark-first design transformation
- ✅ Dreamlike color palette and micro-interactions
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Consistent component heights and spacing
- ✅ Translation system with dreamlike copy

### Version 1.2 - Authentication & Profiles
- ✅ Supabase authentication integration
- ✅ User profile management
- ✅ Onboarding flow with data collection
- ✅ Conditional navigation based on user state

### Version 1.1 - Development Environment
- ✅ Monorepo structure with npm workspaces
- ✅ TypeScript configuration and path mapping
- ✅ ESLint, Prettier, and Husky setup
- ✅ Development build configuration

## License

MIT License - see LICENSE file for details

---

**Somni** - Transform your dreams into insights with AI-powered analysis, intelligent upload management, and a supportive community of dreamers.