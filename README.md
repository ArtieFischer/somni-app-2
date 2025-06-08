# Somni - AI-Powered Dream Analysis Platform

A comprehensive dream tracking and analysis application built with React Native (Expo) and React (Vite) using clean architecture principles and modern development practices.

## Features

### Core Functionality
- **Voice-First Dream Recording**: Record dreams with speech-to-text transcription
- **AI Dream Analysis**: Multiple interpretation frameworks (Freudian, Jungian, Spiritual, Neurobiological)
- **Semantic Search**: Vector-based dream similarity search using pgvector
- **Cross-Platform**: Optimized mobile and web applications
- **Real-time Sync**: Supabase backend with real-time updates

### Modern Architecture
- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **Shared Packages**: Modular codebase with reusable components and logic
- **Type Safety**: Strict TypeScript across the entire codebase
- **State Management**: Zustand stores organized by business domains
- **Design System**: Comprehensive theming with light/dark mode support
- **Internationalization**: Multi-language support with automatic locale detection

### Developer Experience
- **Monorepo Structure**: npm workspaces for efficient development
- **Hot Reloading**: Fast development cycles with Expo and Vite
- **Testing**: Comprehensive unit, integration, and E2E testing
- **Documentation**: Living documentation with detailed guides

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
│   ├── theme/          # Design system and theming
│   └── locales/        # Internationalization
├── types/              # Shared TypeScript types
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
- **@somni/stores**: Centralized Zustand state management
- **@somni/theme**: Comprehensive design system with semantic tokens
- **@somni/locales**: Type-safe internationalization resources

### Technology Stack
- **Frontend**: React Native (Expo SDK 53+), React (Vite), TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: Zustand with domain-specific stores
- **Styling**: Custom design system with theme support
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
- **Theme System**: Dynamic light/dark mode with design tokens
- **Internationalization**: Automatic device locale detection
- **Offline Support**: Local state persistence with background sync

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

## Contributing

1. **Read the documentation** - Familiarize yourself with the architecture
2. **Follow coding standards** - Use ESLint, Prettier, and TypeScript strictly
3. **Write tests** - Maintain high test coverage
4. **Update documentation** - Keep docs current with changes

### Development Workflow
1. Create feature branch from `main`
2. Implement changes following clean architecture principles
3. Add comprehensive tests
4. Update relevant documentation
5. Submit pull request with detailed description

## Deployment

### Mobile App
- **Development**: Expo Go for testing
- **Production**: EAS Build for app store deployment

### Web App
- **Development**: Vite dev server
- **Production**: Static build deployment

## License

MIT License - see LICENSE file for details

---

**Somni** - Transform your dreams into insights with AI-powered analysis and a supportive community of dreamers.