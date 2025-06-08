# Troubleshooting Guide

This document provides solutions to common issues encountered during development and deployment of the Somni project.

## Development Environment Issues

### Node.js and npm Issues

#### Issue: `npm install` fails with permission errors
**Symptoms**: Permission denied errors when installing packages globally or in the project
**Solution**:
```bash
# Option 1: Use npx instead of global installs
npx @expo/cli start

# Option 2: Configure npm to use a different directory for global packages
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

#### Issue: Node version conflicts
**Symptoms**: Errors about unsupported Node.js version
**Solution**:
```bash
# Check current Node version
node --version

# Install Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node 18+
nvm install 18
nvm use 18
nvm alias default 18
```

### Workspace and Dependency Issues

#### Issue: Shared packages not found
**Symptoms**: `Cannot resolve module '@somni/types'` or similar import errors
**Solution**:
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/package-lock.json
rm -rf types/node_modules utils/node_modules
npm install

# Verify workspace configuration
npm ls --workspaces
```

#### Issue: TypeScript path mapping not working
**Symptoms**: Import errors for shared packages in IDE or build
**Solution**:
1. Check `tsconfig.base.json` paths configuration
2. Ensure each app extends the base config properly
3. Restart TypeScript server in your IDE
```bash
# In VS Code: Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

#### Issue: Metro bundler can't resolve shared packages
**Symptoms**: Metro bundler errors about missing modules in React Native
**Solution**:
```bash
# Clear Metro cache
npx expo start --clear

# Or manually clear cache
rm -rf node_modules/.cache
rm -rf .expo
```

### Expo and React Native Issues

#### Issue: Expo Go app shows "Something went wrong"
**Symptoms**: White screen or error screen in Expo Go
**Solution**:
1. Check the terminal for detailed error messages
2. Ensure your device and computer are on the same network
3. Try restarting the development server
```bash
npx expo start --clear --tunnel
```

#### Issue: iOS Simulator not opening
**Symptoms**: `npx expo run:ios` fails or simulator doesn't start
**Solution**:
```bash
# Ensure Xcode is installed and command line tools are set up
xcode-select --install

# Open Xcode and accept license agreements
sudo xcodebuild -license accept

# Reset iOS Simulator
xcrun simctl erase all
```

#### Issue: Android emulator connection problems
**Symptoms**: Can't connect to Android emulator or device
**Solution**:
```bash
# Check ADB connection
adb devices

# Restart ADB server
adb kill-server
adb start-server

# For emulator, ensure it's running
emulator -list-avds
emulator -avd <avd-name>
```

### Web Development Issues

#### Issue: Vite dev server not starting
**Symptoms**: Port already in use or server fails to start
**Solution**:
```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

#### Issue: Environment variables not loading
**Symptoms**: `import.meta.env.VITE_*` variables are undefined
**Solution**:
1. Ensure `.env.local` file exists in `apps/web/`
2. Variables must be prefixed with `VITE_`
3. Restart the development server after adding new variables

## Supabase Integration Issues

### Authentication Issues

#### Issue: Supabase client initialization fails
**Symptoms**: "Invalid API key" or connection errors
**Solution**:
1. Verify environment variables are correctly set
2. Check that the Supabase URL and anon key are valid
3. Ensure the Supabase project is active

```typescript
// Debug Supabase configuration
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...');
```

#### Issue: Authentication state not persisting
**Symptoms**: User gets logged out on app restart
**Solution**:
```typescript
// Ensure proper storage configuration for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Database Issues

#### Issue: Row Level Security (RLS) blocking queries
**Symptoms**: "Permission denied" errors when querying data
**Solution**:
1. Verify RLS policies are correctly configured
2. Check that the user is authenticated
3. Test queries in Supabase SQL editor

```sql
-- Check current user
SELECT auth.uid();

-- Test RLS policy
SELECT * FROM dreams WHERE user_id = auth.uid();
```

#### Issue: Database schema changes not reflected
**Symptoms**: Queries fail after schema updates
**Solution**:
1. Refresh the database schema in your IDE
2. Update TypeScript types to match new schema
3. Clear any cached data

### API and Network Issues

#### Issue: CORS errors in web application
**Symptoms**: "Access to fetch blocked by CORS policy"
**Solution**:
1. Ensure Supabase project allows your domain
2. Check that you're using the correct Supabase URL
3. Verify API endpoints are correctly configured

#### Issue: Network requests failing on mobile
**Symptoms**: API calls work in browser but fail in Expo Go
**Solution**:
```typescript
// Add network security config for Android (if needed)
// In app.json:
{
  "expo": {
    "android": {
      "usesCleartextTraffic": true // Only for development
    }
  }
}
```

## Build and Deployment Issues

### Web Build Issues

#### Issue: Vite build fails with TypeScript errors
**Symptoms**: Build process stops with type checking errors
**Solution**:
```bash
# Run type checking separately
npm run typecheck --workspace=@somni/web

# Fix TypeScript errors or temporarily skip type checking
npm run build --workspace=@somni/web -- --mode development
```

#### Issue: Environment variables not available in production
**Symptoms**: App works locally but fails in production
**Solution**:
1. Ensure production environment variables are set
2. Check that variable names are correctly prefixed
3. Verify build process includes environment variables

### Mobile Build Issues

#### Issue: EAS build fails
**Symptoms**: Build process fails on Expo servers
**Solution**:
```bash
# Check EAS build logs
eas build:list

# Clear EAS cache
eas build --clear-cache

# Check eas.json configuration
cat eas.json
```

#### Issue: Native module compatibility
**Symptoms**: App crashes after adding native modules
**Solution**:
1. Ensure you're using development builds, not Expo Go
2. Check module compatibility with your Expo SDK version
3. Update app.json plugins configuration

```json
{
  "expo": {
    "plugins": [
      ["expo-dev-client"],
      ["@react-native-async-storage/async-storage"]
    ]
  }
}
```

## Performance Issues

### React Native Performance

#### Issue: Slow app startup
**Symptoms**: Long loading times on app launch
**Solution**:
1. Enable Hermes JavaScript engine
2. Optimize bundle size
3. Use lazy loading for screens

```json
// In app.json
{
  "expo": {
    "jsEngine": "hermes"
  }
}
```

#### Issue: Memory leaks
**Symptoms**: App becomes slow over time or crashes
**Solution**:
1. Check for unsubscribed event listeners
2. Properly clean up timers and intervals
3. Use React DevTools Profiler

```typescript
// Proper cleanup example
useEffect(() => {
  const subscription = supabase
    .channel('dreams')
    .on('postgres_changes', {}, handleChange)
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Web Performance

#### Issue: Large bundle size
**Symptoms**: Slow initial page load
**Solution**:
1. Analyze bundle with Vite Bundle Analyzer
2. Implement code splitting
3. Optimize imports

```bash
# Analyze bundle
npm run build --workspace=@somni/web -- --analyze

# Use dynamic imports
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

## Testing Issues

### Unit Test Issues

#### Issue: Jest tests failing with ES modules
**Symptoms**: "SyntaxError: Cannot use import statement outside a module"
**Solution**:
```javascript
// In jest.config.js
module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@supabase)/)',
  ],
};
```

#### Issue: Mocking Supabase client
**Symptoms**: Tests fail because of real API calls
**Solution**:
```typescript
// __mocks__/@supabase/supabase-js.ts
export const createClient = jest.fn(() => ({
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
  auth: {
    getUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
}));
```

### E2E Test Issues

#### Issue: Maestro tests failing
**Symptoms**: E2E tests can't find elements or fail to interact
**Solution**:
1. Add testID props to components
2. Use more specific selectors
3. Add wait conditions

```yaml
# In Maestro test
- assertVisible:
    id: "dream-card-123"
- wait: 2000
- tapOn:
    id: "save-button"
```

## IDE and Development Tools

### VS Code Issues

#### Issue: TypeScript IntelliSense not working
**Symptoms**: No autocomplete or type checking in editor
**Solution**:
1. Install TypeScript extension
2. Restart TypeScript server
3. Check workspace TypeScript version

```bash
# Check TypeScript version
npx tsc --version

# Use workspace TypeScript version in VS Code
# Cmd/Ctrl + Shift + P -> "TypeScript: Select TypeScript Version"
```

#### Issue: ESLint not working
**Symptoms**: No linting errors shown in editor
**Solution**:
1. Install ESLint extension
2. Check ESLint configuration
3. Restart VS Code

```json
// In .vscode/settings.json
{
  "eslint.workingDirectories": ["apps/mobile", "apps/web", "types", "utils"]
}
```

## Platform-Specific Issues

### iOS Issues

#### Issue: App crashes on iOS device
**Symptoms**: App works in simulator but crashes on real device
**Solution**:
1. Check device logs in Xcode
2. Ensure proper code signing
3. Test with development build

```bash
# View device logs
xcrun devicectl list devices
xcrun devicectl device install app --device <device-id> <app-path>
```

### Android Issues

#### Issue: App not installing on Android device
**Symptoms**: Installation fails or app doesn't appear
**Solution**:
1. Enable developer options and USB debugging
2. Check ADB connection
3. Verify app signing

```bash
# Check device connection
adb devices

# Install APK manually
adb install app.apk

# Check logs
adb logcat
```

## Getting Help

### Debug Information to Collect

When reporting issues, include:

1. **Environment Information**:
   ```bash
   node --version
   npm --version
   npx expo --version
   ```

2. **Package Versions**:
   ```bash
   npm list --depth=0
   ```

3. **Error Logs**: Full error messages and stack traces

4. **Steps to Reproduce**: Detailed steps that lead to the issue

5. **Expected vs Actual Behavior**: What should happen vs what actually happens

### Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Troubleshooting](https://vitejs.dev/guide/troubleshooting.html)
- [Project GitHub Issues](https://github.com/your-repo/issues)

### Community Support

- Expo Discord: [https://chat.expo.dev/](https://chat.expo.dev/)
- React Native Community: [https://reactnative.dev/community/overview](https://reactnative.dev/community/overview)
- Supabase Discord: [https://discord.supabase.com/](https://discord.supabase.com/)