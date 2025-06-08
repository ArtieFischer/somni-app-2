# Getting Started

## 🌙 Current Implementation Overview

**Last Updated**: December 2024  
**Implementation Status**: Features 1.1, 1.2, 2.1 Complete ✅

This guide walks you through setting up the **current working implementation** of the Somni dream journaling app. All steps reflect the actual codebase structure and requirements.

---

## Prerequisites

Before setting up the Somni project, ensure you have the following installed:

- **Node.js** (v18 or higher) - Required for React Native and Expo
- **npm** (comes with Node.js) - Package manager
- **Git** - Version control
- **Expo CLI** (for mobile development): `npm install -g @expo/cli`

### Platform-Specific Requirements

#### For Mobile Development (Required)

- **iOS**: Xcode (macOS only) or Expo Go app
- **Android**: Android Studio or Expo Go app
- **EAS CLI**: `npm install -g eas-cli` (for building)

> **Note**: Currently only mobile development is supported. Web app is planned for future phases.

---

## ✅ Current Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd somni-app-2
```

### 2. Install Dependencies

Install all dependencies for the entire monorepo:

```bash
npm install
```

This will install dependencies for:

- **Root workspace**: Development tools (ESLint, Prettier, Husky)
- **Mobile app** (`@somni/mobile`): React Native, Expo, Supabase
- **Shared packages**: stores, theme, locales, types

### 3. Environment Variables

#### Supabase Configuration (Required)

Create environment file for the mobile app:

**Mobile App** (`apps/mobile/.env`):

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Important**:
>
> - Never commit this file to version control (it's in `.gitignore`)
> - You need a working Supabase project to run the app

#### Setting Up Supabase (Required)

Before the app will work, you need to set up your Supabase project:

1. **Create Supabase Project**:

   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your Project URL and anon key

2. **Setup Database Schema**:

   - Copy and run the SQL from `supabase/migrations/` in your Supabase SQL editor
   - Or follow the detailed guide in [Supabase Setup](./10-supabase-setup.md)

3. **Verify Setup**: The app will show connection status on the home screen

---

## ✅ Development Workflow

### Mobile Development (Current)

#### Start the Development Server

From the project root:

```bash
npm run dev --workspace=@somni/mobile
```

Or from the mobile app directory:

```bash
cd apps/mobile
npm start
```

This will start the Expo development server and show a QR code.

#### Running on Devices

**Option 1: Expo Go (Recommended for development)**

1. Install Expo Go on your iOS/Android device
2. Scan the QR code displayed in terminal
3. App will load with hot reloading enabled

**Option 2: iOS Simulator (macOS only)**

```bash
cd apps/mobile
npm run ios
```

**Option 3: Android Emulator**

```bash
cd apps/mobile
npm run android
```

#### Development Builds (For Testing Native Features)

Some features require development builds:

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo account
eas login

# Create development build
cd apps/mobile
eas build --profile development --platform ios
eas build --profile development --platform android
```

---

## ✅ Available Scripts & Commands

### Root Level Scripts

```bash
# Start mobile development
npm run dev --workspace=@somni/mobile

# Run linting across all workspaces
npm run lint --workspaces

# Run type checking across all workspaces
npm run type-check --workspaces
```

### Mobile App Scripts (apps/mobile)

```bash
cd apps/mobile

# Development
npm start              # Start Expo dev server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator

# Code Quality
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript checking

# Building
eas build --profile development    # Development build
eas build --profile preview       # Preview build
eas build --profile production     # Production build
```

### Workspace-Specific Commands

```bash
# Install package in specific workspace
npm install package-name --workspace=@somni/mobile

# Run script in specific workspace
npm run lint --workspace=@somni/mobile
npm run type-check --workspace=@somni/stores
```

---

## ✅ Verification & Testing

### Test Mobile App Setup

1. **Start Development Server**:

   ```bash
   npm run dev --workspace=@somni/mobile
   ```

2. **Load App**: Open Expo Go and scan QR code

3. **Verify Core Features**:
   - ✅ App loads with oniric dark theme
   - ✅ Welcome screen shows proper translations (not keys)
   - ✅ Sign up/sign in forms work
   - ✅ Onboarding flow completes successfully
   - ✅ Theme switching works (dark-only mode)

### Test Supabase Connection

1. **Check Connection Status**: App shows Supabase status on home screen
2. **Test Authentication**:

   - Create new account → should work without errors
   - Sign in with existing account → should work
   - Sign out → should clear session

3. **Test Onboarding**:
   - Complete onboarding flow → data should persist
   - Check profile creation in Supabase dashboard

### Test Shared Packages

Verify all shared packages are working:

- **@somni/stores**: AuthStore and OnboardingStore state management
- **@somni/theme**: Oniric design system with purple theme
- **@somni/locales**: Translations showing dreamlike copy
- **@somni/types**: TypeScript interfaces for type safety

---

## ✅ Current Architecture Overview

### Project Structure (Actual)

```
somni-app-2/
├── apps/mobile/           # React Native Expo app ✅
├── packages/              # Shared packages ✅
│   ├── stores/           # Zustand state management ✅
│   ├── theme/            # Oniric design system ✅
│   ├── locales/          # i18n translations ✅
│   └── types/            # TypeScript definitions ✅
├── docs/                 # Documentation ✅
└── supabase/            # Database migrations ✅
```

### Key Technologies in Use

- **React Native**: 0.76.1 with Expo SDK 53+
- **Navigation**: React Navigation 6 with conditional routing
- **State Management**: Zustand with persistence
- **Database**: Supabase with Row Level Security
- **Authentication**: Supabase Auth with biometric support
- **Styling**: Custom oniric theme with purple color palette
- **Internationalization**: i18next with dreamlike translations

### User Flow (Current Implementation)

1. **Welcome Screen** → Authentication required
2. **Sign Up/Sign In** → Creates user account and session
3. **Onboarding Flow** → 6-screen data collection process
4. **Home Screen** → Main app interface (minimal for now)

---

## 🔄 Not Yet Available

The following features are **planned but not implemented**:

- ❌ **Web Application**: React Vite web app (planned)
- ❌ **Dream Recording**: Voice recording and transcription
- ❌ **Dream Analysis**: AI-powered dream interpretation
- ❌ **Vector Search**: Semantic dream search functionality
- ❌ **Community Features**: Dream sharing and social features

---

## Troubleshooting

### Common Issues

**1. Expo/React Native Setup Issues**

```bash
# Clear Expo cache
npx expo install --fix

# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**2. Environment Variables Not Loading**

- Ensure `.env` file is in `apps/mobile/` directory
- Restart Expo development server after adding variables
- Check variables start with `EXPO_PUBLIC_`

**3. Supabase Connection Issues**

- Verify URLs and keys in `.env` file
- Check Supabase project is active and accessible
- Ensure database schema is properly set up

**4. TypeScript Errors**

```bash
# Run type checking
npm run type-check --workspace=@somni/mobile

# Clear TypeScript cache
rm -rf apps/mobile/.expo
rm -rf apps/mobile/node_modules/.cache
```

**5. Build Issues**

```bash
# Reset Expo state
cd apps/mobile
npx expo install --fix
rm -rf .expo
```

For more detailed troubleshooting, see [Troubleshooting Guide](./09-troubleshooting.md).

---

This getting started guide reflects the **current working state** of the Somni project as of Features 1.1, 1.2, and 2.1 completion. All instructions are tested and verified to work with the actual codebase.
