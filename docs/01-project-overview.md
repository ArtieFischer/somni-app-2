# Project Overview

## Purpose and Vision

Somni is a comprehensive dream tracking and analysis application that transforms the deeply personal experience of dreaming into actionable insights. By combining voice-first recording, advanced AI interpretation, and social discovery features, Somni helps users understand their subconscious patterns, achieve lucid dreaming, and connect with a global community of dreamers. 

The app addresses the universal human need to understand and remember dreams, which typically fade within minutes of waking, while providing scientific tools for sleep improvement and psychological self-discovery.

## Key Features

### Mobile Application (iOS/Android)

#### Core Features
- **Voice-First Dream Recording**: Whisper mode for bedside recording with on-device transcription
- **AI Dream Analysis**: Multiple interpretation lenses (Freudian, Jungian, Spiritual, Neurobiological) powered by LLMs
- **Dream Pattern Recognition**: Recurring symbol detection and personal dream map visualization
- **Offline Support**: Record and transcribe dreams without internet connection
- **Multi-language Support**: Full internationalization with automatic device locale detection
- **Dynamic Theming**: Light/dark mode with system preference detection

#### Social Features
- **Social Dream Feed**: Anonymous sharing with community reactions and global motif trends
- **Community Insights**: Discover trending dream themes and symbols

#### Advanced Tools
- **Lucid Dreaming Tools**: Reality check reminders, MILD/WBTB techniques, progress tracking
- **Sleep Integration**: Correlation with sleep phases using device sensors (Apple HealthKit ready)
- **Gamification**: Achievement system, streaks, and level progression for engagement

### Web Application

#### Management Features
- **Dream Journal Management**: Browse, search, and organize dream entries
- **Extended Reading**: Comfortable viewing of detailed interpretations on larger screens
- **Data Export**: Download dreams in multiple formats (JSON, PDF)

#### Privacy & Sync
- **Privacy Controls**: Manage sharing settings and data deletion
- **Cross-Device Sync**: Seamless access across all platforms

## Technology Stack

### Frontend Technologies
- **React Native** (Expo SDK 53+) - Cross-platform mobile development with clean architecture
- **React** (Vite) - Web application
- **TypeScript** - Type safety across entire codebase
- **Zustand** - Centralized state management with offline support
- **React Navigation** - Mobile navigation
- **React Hook Form + Zod** - Form handling and validation
- **i18next** - Internationalization with automatic locale detection

### Shared Packages Architecture
- **@somni/core** - Domain entities, use cases, and repository interfaces (Clean Architecture)
- **@somni/stores** - Centralized Zustand state management
- **@somni/theme** - Design system with light/dark themes and responsive design tokens
- **@somni/locales** - Internationalization resources and translation management
- **@somni/types** - Shared TypeScript interfaces and type definitions
- **@somni/utils** - Shared utility functions

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **pgvector** - Vector embeddings for semantic dream similarity search
- **OpenRouter API** - LLM aggregation (Mixtral 8x7B for cost-effective analysis)
- **Expo EAS** - Build and deployment infrastructure

### Native Integrations
- **expo-audio** - Voice recording with high-quality presets
- **@jamsch/expo-speech-recognition** - On-device speech-to-text
- **expo-local-authentication** - Biometric authentication
- **react-native-health** - Apple HealthKit integration
- **expo-localization** - Device locale detection

### Development & Testing
- **Jest + React Native Testing Library** - Unit and component testing
- **Maestro** - E2E testing framework
- **ESLint + Prettier** - Code quality
- **GitHub Actions** - CI/CD pipeline

## Architecture Principles

### Clean Architecture Implementation
The project follows clean architecture principles with clear separation of concerns:

- **Domain Layer** (`@somni/core`): Business entities, use cases, and repository interfaces
- **Infrastructure Layer** (`apps/mobile/src/infrastructure`): External service implementations
- **Presentation Layer** (`apps/mobile/src/components`, `apps/mobile/src/screens`): UI components and screens
- **Shared Concerns**: State management, theming, and localization as separate packages

### Design System
- **Atomic Design**: Components organized as atoms, molecules, and organisms
- **Theme System**: Comprehensive design tokens for colors, spacing, typography, and shadows
- **Responsive Design**: Mobile-first approach with consistent spacing and layout patterns
- **Accessibility**: WCAG-compliant color contrast and semantic markup

### State Management Strategy
- **Zustand Stores**: Lightweight, performant state management
- **Domain-Driven State**: Stores organized by business domains (auth, dreams, settings)
- **Optimistic Updates**: Immediate UI feedback with background synchronization
- **Offline Support**: Local state persistence with sync on reconnection

## Project Goals

1. **User Experience**: Provide seamless dream recording and analysis across all platforms
2. **Privacy**: Ensure user data is secure and sharing is always optional
3. **Insights**: Deliver meaningful dream interpretations using AI
4. **Community**: Foster a supportive community of dream enthusiasts
5. **Science**: Contribute to dream research and sleep science
6. **Accessibility**: Make dream analysis tools available to everyone
7. **Scalability**: Maintain clean architecture for long-term maintainability
8. **Performance**: Optimize for fast startup times and smooth user interactions

## Development Philosophy

### Code Quality
- **Type Safety**: Strict TypeScript configuration across all packages
- **Testing**: Comprehensive unit, integration, and E2E testing
- **Documentation**: Living documentation with Storybook and TypeDoc
- **Code Review**: Mandatory peer review for all changes

### User-Centered Design
- **Accessibility First**: WCAG 2.1 AA compliance
- **Performance**: Sub-3-second app startup times
- **Offline Capability**: Core features work without internet connection
- **Internationalization**: Support for multiple languages and RTL layouts

### Technical Excellence
- **Clean Architecture**: Domain-driven design with clear boundaries
- **Modular Design**: Reusable packages and components
- **Performance Optimization**: Bundle splitting, lazy loading, and efficient rendering
- **Security**: Row-level security, data encryption, and privacy by design