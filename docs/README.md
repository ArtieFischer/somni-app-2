# Somni - AI-Powered Dream Analysis Platform

Welcome to the Somni project documentation. This directory contains comprehensive guides for developers working on the Somni platform.

## 🌙 Project Status

**Current Implementation Status**: Features 1.1, 1.2, and 2.1 Complete ✅

- **✅ Development Environment Setup** (Feature 1.1) - EAS builds, Husky hooks, Reactotron debugging
- **✅ Authentication & User Profiles** (Feature 1.2) - Complete auth flow with Supabase integration
- **✅ New User Onboarding Flow** (Feature 2.1) - Multi-step onboarding with data collection and persistence
- **✅ Oniric Design Transformation** - Dark-only theme optimized for nighttime dream journaling

## Documentation Structure

- **[Project Overview](./01-project-overview.md)** - Purpose, vision, and implemented features
- **[Getting Started](./02-getting-started.md)** - Setup and installation guide
- **[Monorepo Architecture](./03-monorepo-architecture.md)** - Project structure and workspace organization
- **[Development Guidelines](./04-development-guidelines.md)** - Code standards and oniric design patterns
- **[TypeScript Types & Interfaces](./05-types-interfaces.md)** - Complete type definitions reference
- **[API Reference](./06-api-reference.md)** - Supabase integration and API calls
- **[Testing Strategy](./07-testing-strategy.md)** - Testing frameworks and practices
- **[Deployment Guide](./08-deployment.md)** - Build and deployment processes
- **[Troubleshooting](./09-troubleshooting.md)** - Common issues and solutions
- **[Supabase Setup](./10-supabase-setup.md)** - Database setup with manual SQL execution
- **[Feature Implementation Status](./11-feature-implementation-status.md)** - Detailed progress tracking

## Quick Links

- [Mobile App Development](./02-getting-started.md#mobile-development)
- [Onboarding Flow Testing](./11-feature-implementation-status.md#testing-onboarding-flow)
- [Oniric Theme Implementation](./04-development-guidelines.md#oniric-theme-guidelines)
- [Shared Package Usage](./03-monorepo-architecture.md#shared-packages)
- [Supabase Database Setup](./10-supabase-setup.md)
- [SQL Scripts for Manual Execution](../sql/README.md)
- [Database Migrations](../supabase/migrations/)

## 🌟 Current Features

### ✅ Implemented Features

#### Authentication & User Management

- Complete Supabase authentication integration
- User profile management with onboarding status tracking
- Biometric authentication support (Face ID/Touch ID)
- Secure session management with automatic token refresh

#### New User Onboarding Experience

- **Welcome Screen** - Notification permissions and app introduction
- **Sleep Schedule Setup** - Native time pickers for bedtime/wake time
- **Dream Goals Selection** - Multi-select goals (remember dreams, achieve lucidity, etc.)
- **Lucidity Experience** - Experience level selection with tailored recommendations
- **Privacy Settings** - Granular privacy controls for dream sharing
- **Completion & Persistence** - Data summary and Supabase profile creation

#### Oniric Design System

- **Dark-Only Theme** - Optimized for nighttime use with dreamlike aesthetics
- **Aurora Purple Palette** - Deep midnight backgrounds with ethereal purple accents
- **Consistent Components** - Reusable Button and Input components with proper heights
- **Dreamlike Translations** - Poetic copy throughout ("Return to the Dream Realm", "Enter Dreams")
- **Accessibility** - 48dp minimum button heights, proper contrast ratios

## Architecture Overview

The Somni project uses a monorepo structure with:

- **Mobile Application**: React Native + Expo SDK 53+ with complete onboarding flow
- **Shared Packages**: Centralized stores, theme, translations, and utilities
- **Database**: Supabase with PostgreSQL and user profile management
- **State Management**: Zustand stores for auth, onboarding, and app state
- **Navigation**: Conditional navigation based on user onboarding status

### Current Navigation Structure

```
AppNavigator
├── AuthNavigator (signed out users)
│   ├── WelcomeScreen
│   ├── SignInScreen
│   └── SignUpScreen
├── OnboardingNavigator (new users)
│   ├── WelcomeScreen
│   ├── SleepScheduleScreen
│   ├── GoalsScreen
│   ├── LucidityScreen
│   ├── PrivacyScreen
│   └── CompleteScreen
└── MainNavigator (completed users)
    └── HomeScreen
```

## Database Schema

The project uses a modern database schema with:

- **User Profiles**: Extended user information with onboarding completion tracking
- **Dreams**: Core dream entries with vector embeddings for semantic search (planned)
- **Analysis**: AI-generated dream interpretations (planned)
- **Symbols**: Extracted dream symbols and meanings (planned)
- **Vector Search**: Semantic similarity search using pgvector (planned)

## Key Technologies

### Frontend Stack

- **React Native** (Expo SDK 53+) - Cross-platform mobile development
- **TypeScript** - Strict type safety across entire codebase
- **Zustand** - Lightweight state management with persistence
- **React Navigation** - Type-safe navigation with conditional flows
- **React Hook Form + Zod** - Form handling and validation
- **i18next** - Internationalization with oniric translations

### Native Integrations

- **expo-notifications** - Push notifications for lucid dreaming reminders
- **@react-native-community/datetimepicker** - Native time pickers
- **expo-local-authentication** - Biometric authentication
- **lottie-react-native** - Smooth animations (ready for implementation)

### Backend & Services

- **Supabase** - Authentication, database, and real-time features
- **PostgreSQL** - Robust database with user profiles and preferences
- **Row Level Security** - Privacy-first data protection

## Contributing

Please read through the relevant documentation sections before making changes to the codebase. All developers should follow the guidelines outlined in these documents to maintain consistency and quality across the project.

### Development Workflow

1. **Setup**: Follow [Getting Started](./02-getting-started.md) for initial setup
2. **Database**: Set up Supabase using [Supabase Setup](./10-supabase-setup.md)
3. **Development**: Follow [Development Guidelines](./04-development-guidelines.md) with oniric design patterns
4. **Testing**: Test onboarding flow and authentication per [Feature Status](./11-feature-implementation-status.md)
5. **Deployment**: Use [Deployment Guide](./08-deployment.md) for releases

### Next Development Priorities

- **Dream Recording Interface** - Voice recording with speech-to-text
- **AI Dream Analysis** - LLM integration for dream interpretation
- **Dream Journal** - CRUD operations for dream entries
- **Social Features** - Anonymous dream sharing and community

### Architecture Decisions

- **Dark-Only Theme**: Optimized for nighttime use when most dream journaling occurs
- **Separate Apps vs react-native-web**: Planning separate optimized applications for better performance
- **Supabase**: Chosen for PostgreSQL foundation, real-time capabilities, and vector search support
- **TypeScript**: Strict typing across the entire codebase for better developer experience
- **Monorepo**: Shared code and consistent tooling while maintaining clear boundaries

For detailed architectural decisions, see [Architecture Decision](./architecture-decision.md).
