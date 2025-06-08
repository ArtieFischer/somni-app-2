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
- **React Native** (Expo SDK 53+) - Cross-platform mobile development
- **React** (Vite) - Web application
- **TypeScript** - Type safety across entire codebase
- **Zustand** - State management with offline support
- **React Native Paper** - UI component library
- **React Navigation** - Mobile navigation
- **React Hook Form + Zod** - Form handling and validation
- **i18next** - Internationalization

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **pgvector** - Vector embeddings for semantic dream similarity search
- **OpenRouter API** - LLM aggregation (Mixtral 8x7B for cost-effective analysis)
- **Expo EAS** - Build and deployment infrastructure

### Native Integrations
- **expo-audio** - Voice recording
- **@jamsch/expo-speech-recognition** - On-device speech-to-text
- **expo-local-authentication** - Biometric authentication
- **react-native-health** - Apple HealthKit integration

### Development & Testing
- **Jest + React Native Testing Library** - Unit and component testing
- **Maestro** - E2E testing framework
- **ESLint + Prettier** - Code quality
- **GitHub Actions** - CI/CD pipeline

## Project Goals

1. **User Experience**: Provide seamless dream recording and analysis across all platforms
2. **Privacy**: Ensure user data is secure and sharing is always optional
3. **Insights**: Deliver meaningful dream interpretations using AI
4. **Community**: Foster a supportive community of dream enthusiasts
5. **Science**: Contribute to dream research and sleep science
6. **Accessibility**: Make dream analysis tools available to everyone