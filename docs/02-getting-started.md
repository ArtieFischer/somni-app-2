# Getting Started

## Prerequisites

Before setting up the Somni project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Git**
- **Expo CLI** (for mobile development): `npm install -g @expo/cli`

### Platform-Specific Requirements

#### For Mobile Development
- **iOS**: Xcode (macOS only) or Expo Go app
- **Android**: Android Studio or Expo Go app

#### For Web Development
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd somni-monorepo
```

### 2. Install Dependencies

Install all dependencies for the entire monorepo:

```bash
npm install
```

This will install dependencies for all workspaces including:
- Root dependencies
- Mobile app (`@somni/mobile`)
- Web app (`@somni/web`)
- Shared packages (`@somni/types`, `@somni/utils`)

### 3. Environment Variables

#### Supabase Configuration

Create environment files for both applications:

**For Web App** (`apps/web/.env.local`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**For Mobile App** (`apps/mobile/.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note**: Never commit these files to version control. They are already included in `.gitignore`.

#### Setting Up Supabase

Before you can use the environment variables, you need to set up your Supabase project:

1. **Create a Supabase Project**: Follow the detailed setup guide in [Supabase Setup](./10-supabase-setup.md)
2. **Execute Database Schema**: Run the SQL scripts in order as described in the setup guide
3. **Get Your Credentials**: Copy the Project URL and anon key from your Supabase dashboard

## Development

### Mobile Development

#### Start the Mobile Development Server

From the project root:

```bash
npm run dev:mobile
```

Or from the mobile app directory:

```bash
cd apps/mobile
npm start
```

#### Running on Devices

1. **Expo Go** (Recommended for development):
   - Install Expo Go on your device
   - Scan the QR code displayed in the terminal

2. **iOS Simulator** (macOS only):
   ```bash
   npm run ios
   ```

3. **Android Emulator**:
   ```bash
   npm run android
   ```

#### Development Builds

For features requiring native modules (like HealthKit):

```bash
# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Web Development

#### Start the Web Development Server

From the project root:

```bash
npm run dev:web
```

Or from the web app directory:

```bash
cd apps/web
npm run dev
```

The web application will be available at `http://localhost:5173`

#### Building for Production

```bash
npm run build:web
```

## Workspace Commands

### Running Commands in Specific Workspaces

```bash
# Run linting in mobile app
npm run lint --workspace=@somni/mobile

# Run type checking in web app
npm run typecheck --workspace=@somni/web

# Install a package in specific workspace
npm install package-name --workspace=@somni/web
```

### Available Scripts

#### Root Level Scripts
- `npm run dev:mobile` - Start mobile development server
- `npm run dev:web` - Start web development server
- `npm run build:web` - Build web application for production

#### Mobile App Scripts (`apps/mobile`)
- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web (via Expo)
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

#### Web App Scripts (`apps/web`)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Verification

### Test Mobile App Setup

1. Start the mobile development server
2. Open Expo Go and scan the QR code
3. Verify that the app loads and displays dream data
4. Check that shared types and utilities are working
5. Verify Supabase connection status is displayed

### Test Web App Setup

1. Start the web development server
2. Open `http://localhost:5173` in your browser
3. Verify that the app loads and displays dream data
4. Check that shared types and utilities are working
5. Verify Supabase connection status is displayed

### Test Shared Packages

Both applications should successfully import and use:
- `@somni/types` - TypeScript interfaces (both legacy and new)
- `@somni/utils` - Utility functions

If you see import errors, check:
1. Dependencies are installed (`npm install`)
2. TypeScript paths are configured correctly
3. Shared packages are properly linked

### Test Supabase Integration

Both apps include Supabase connection testing:
- **Mobile**: Check the status message below "Dream Test"
- **Web**: Check the status message below the main heading

Expected status messages:
- "Connected to Supabase: Logged Out" (if no user is signed in)
- "Connected to Supabase: Logged In" (if a user is signed in)
- Error messages if there are configuration issues

## Next Steps

1. **Complete Supabase Setup**: Follow [Supabase Setup Guide](./10-supabase-setup.md) to set up your database
2. **Review Architecture**: Read [Monorepo Architecture](./03-monorepo-architecture.md) to understand the project structure
3. **Study Type Definitions**: Explore [Types & Interfaces](./05-types-interfaces.md) to understand the data models
4. **Review Development Guidelines**: Follow [Development Guidelines](./04-development-guidelines.md) for coding standards
5. **Set up Testing**: Review [Testing Strategy](./07-testing-strategy.md) for testing approaches

## Common Issues

### Dependency Issues

**Issue**: `Cannot resolve module '@somni/types'`
**Solution**:
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules
npm install
```

**Issue**: Metro bundler errors in React Native
**Solution**:
```bash
# Clear Metro cache
npx expo start --clear
```

**Issue**: TypeScript path mapping not working
**Solution**:
1. Check `tsconfig.base.json` paths configuration
2. Restart TypeScript server in your IDE
3. Ensure each app extends the base config properly

### Supabase Issues

**Issue**: "Supabase Connection Error" in apps
**Solution**:
1. Verify environment variables are set correctly
2. Check that Supabase project is active
3. Ensure database schema has been set up
4. Verify API keys are valid

**Issue**: Database queries fail
**Solution**:
1. Check that all SQL migrations have been executed
2. Verify Row Level Security policies are in place
3. Test authentication flow

For more troubleshooting help, see [Troubleshooting Guide](./09-troubleshooting.md).