# Troubleshooting

## 🌙 Current Implementation Overview

**Last Updated**: December 2024  
**Implementation Status**: Features 1.1, 1.2, 2.1 Complete ✅

This troubleshooting guide covers **actual issues** encountered in the current Somni implementation and their verified solutions. All problems listed here are based on real development experience.

---

## 🔧 Environment & Setup Issues

### Node.js and npm Issues

#### Problem: Node.js Version Conflicts

```bash
Error: The engine "node" is incompatible with this module
```

**Solution**:

```bash
# Check current Node.js version
node --version

# Install Node.js 18 or higher
# Via nvm (recommended)
nvm install 18
nvm use 18

# Via direct installation
# Download from nodejs.org
```

#### Problem: npm Permission Errors (macOS/Linux)

```bash
Error: EACCES: permission denied
```

**Solution**:

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use nvm instead of global npm
```

### Expo and React Native Issues

#### Problem: Expo CLI Not Found

```bash
expo: command not found
```

**Solution**:

```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Verify installation
expo --version

# If still not working, check PATH
echo $PATH
```

#### Problem: Metro Bundler Cache Issues

```bash
Error: Unable to resolve module
```

**Solution**:

```bash
# Clear Metro cache
cd apps/mobile
npx expo start --clear

# If that doesn't work, clear more caches
rm -rf node_modules/.cache
rm -rf .expo
npm start
```

#### Problem: Expo Go App Won't Connect

**Symptoms**: QR code scans but app doesn't load

**Solution**:

1. **Check Network**: Ensure phone and computer are on same WiFi
2. **Firewall**: Temporarily disable firewall or add Expo to exceptions
3. **Use Tunnel Mode**:
   ```bash
   npx expo start --tunnel
   ```
4. **Check IP Address**: Sometimes using local IP helps:
   ```bash
   npx expo start --lan
   ```

---

## 🗄️ Supabase & Database Issues

### Connection Issues

#### Problem: Supabase Connection Error

```typescript
Error: Invalid API key or URL
```

**Solution**:

1. **Check Environment Variables**:

   ```bash
   # Verify .env file exists
   ls apps/mobile/.env

   # Check variables are set (don't print sensitive values)
   cd apps/mobile
   npx expo config --type public
   ```

2. **Verify Supabase Project**:

   - Go to supabase.com dashboard
   - Check project is active (not paused)
   - Copy fresh URL and anon key

3. **Restart Development Server**:
   ```bash
   # Environment changes require restart
   cd apps/mobile
   npm start
   ```

#### Problem: Database Schema Errors

```sql
Error: relation "users_profile" does not exist
```

**Solution**:

1. **Run Database Migrations**:

   - Go to Supabase SQL Editor
   - Run all SQL files from `supabase/migrations/` in order
   - Check table creation in Database tab

2. **Verify RLS Policies**:
   - Check Authentication > Policies in Supabase dashboard
   - Ensure users_profile policies are enabled

### Authentication Issues

#### Problem: User Registration Fails

```typescript
Error: User already registered
```

**Solution**:

1. **Check User Doesn't Exist**:

   - Go to Authentication > Users in Supabase
   - Delete test user if needed

2. **Handle Error Properly**:
   ```typescript
   // Current error handling in app
   try {
     await AuthService.signUp(email, password, username);
   } catch (error) {
     if (error.message.includes('User already registered')) {
       setError('Account already exists. Please sign in instead.');
     }
   }
   ```

#### Problem: Session Not Persisting

**Symptoms**: User signed out after app restart

**Solution**:

1. **Check AsyncStorage**:

   ```typescript
   // Verify Supabase config includes AsyncStorage
   export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
     auth: {
       storage: AsyncStorage, // This line is crucial
       autoRefreshToken: true,
       persistSession: true,
     },
   });
   ```

2. **Clear Storage and Re-login**:
   ```bash
   # Reset simulator/emulator
   # iOS: Device > Erase All Content and Settings
   # Android: Wipe data in AVD Manager
   ```

---

## 🎨 Theme & Styling Issues

### Theme Not Loading

#### Problem: White Screen or Default Styling

**Symptoms**: App loads but doesn't show oniric purple theme

**Solution**:

1. **Check Theme Import**:

   ```typescript
   // Verify useTheme hook is imported correctly
   import { useTheme } from '../hooks/useTheme'; // Relative path
   // NOT: import { useTheme } from '@hooks/useTheme';
   ```

2. **Verify Theme Package**:
   ```bash
   # Check theme package is linked
   cd packages/theme
   npm run build
   cd ../../apps/mobile
   npm install
   ```

#### Problem: Component Styling Inconsistent

**Symptoms**: Some components look different

**Solution**:

1. **Check Button Heights**:

   ```typescript
   // All buttons should use standard heights
   const BUTTON_HEIGHTS = {
     small: 40, // Secondary actions
     medium: 48, // Standard (WCAG minimum)
     large: 56, // Primary actions
   };
   ```

2. **Verify Component Imports**:
   ```typescript
   // Use consistent imports
   import { Button } from '../atoms/Button';
   import { Text } from '../atoms/Text';
   import { Input } from '../atoms/Input';
   ```

---

## 🌐 Translation & Localization Issues

### Translation Keys Showing Instead of Text

#### Problem: Seeing "auth.signIn.title" Instead of "Return to the Dream Realm"

**Symptoms**: Raw translation keys display in UI

**Solution**:

1. **Check Translation Namespace**:

   ```typescript
   // Correct usage
   const { t } = useTranslation('auth');
   return <Text>{t('signIn.title')}</Text>;

   // NOT: useTranslation() without namespace
   ```

2. **Verify String() Casting**:
   ```typescript
   // TypeScript compatibility fix
   export const useTranslation = (namespace?: string) => {
     const { t, i18n } = useI18nextTranslation(namespace);
     return {
       t: (key: string, options?: any) => String(t(key, options)), // String() casting
       i18n,
       ready: i18n.isInitialized,
     };
   };
   ```

#### Problem: i18next Not Initializing

```javascript
Error: i18next not initialized
```

**Solution**:

1. **Check App.tsx Setup**:

   ```typescript
   // Ensure i18n initialization in App.tsx
   import './src/shared/locales/i18n'; // Import before anything else
   ```

2. **Verify Locale Files**:
   ```bash
   # Check translation files exist
   ls packages/locales/src/en/
   # Should see: auth.json, onboarding.json, welcome.json, common.json
   ```

---

## 📱 Navigation Issues

### Navigation State Errors

#### Problem: Rendered Fewer Hooks Than Expected

```javascript
Error: Rendered fewer hooks than expected
```

**Solution**:

1. **Check Conditional Navigation**:

   ```typescript
   // Correct pattern in AppNavigator
   export const AppNavigator = () => {
     const { isAuthenticated, profile } = useAuthStore();

     // All hooks must be called before conditions
     if (!isAuthenticated) return <AuthNavigator />;
     if (!profile?.onboarding_completed) return <OnboardingNavigator />;
     return <MainNavigator />;
   };
   ```

#### Problem: Navigation Params Type Errors

```typescript
Error: Argument of type is not assignable to parameter
```

**Solution**:

1. **Use Proper Navigation Types**:

   ```typescript
   import type { NativeStackScreenProps } from '@react-navigation/native-stack';

   type Props = NativeStackScreenProps<OnboardingStackParamList, 'Goals'>;

   const OnboardingGoalsScreen: React.FC<Props> = ({ navigation }) => {
     // Type-safe navigation
     navigation.navigate('Lucidity');
   };
   ```

---

## 🏪 State Management Issues

### Zustand Store Issues

#### Problem: Store State Not Persisting

**Symptoms**: Auth state lost on app restart

**Solution**:

1. **Check Persistence Config**:

   ```typescript
   // Verify persist wrapper in authStore
   export const useAuthStore = create<AuthStore>()(
     persist(
       (set, get) => ({
         // Store implementation
       }),
       {
         name: 'auth-storage',
         partialize: (state) => ({
           user: state.user,
           profile: state.profile,
         }),
       },
     ),
   );
   ```

2. **Clear Storage if Corrupted**:
   ```bash
   # Reset AsyncStorage
   # iOS: Reset Simulator
   # Android: Clear app data
   ```

#### Problem: Store Updates Not Reflecting in UI

**Symptoms**: State changes but components don't re-render

**Solution**:

1. **Check Store Usage**:

   ```typescript
   // Correct usage
   const { user, profile, setUser } = useAuthStore();

   // NOT: const store = useAuthStore(); (doesn't subscribe)
   ```

2. **Verify Immer Usage** (if using):
   ```typescript
   // Use immer for complex state updates
   import { immer } from 'zustand/middleware/immer';
   ```

---

## 🏗️ Build & Development Issues

### EAS Build Issues

#### Problem: Build Fails on EAS

```bash
Error: Build failed
```

**Solution**:

1. **Check EAS Configuration**:

   ```json
   // Verify eas.json
   {
     "cli": { "version": ">= 12.0.0" },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       }
     }
   }
   ```

2. **Login to EAS**:
   ```bash
   eas login
   eas whoami  # Verify login
   ```

#### Problem: Metro Bundler Fails

```bash
Error: EMFILE: too many open files
```

**Solution**:

```bash
# Increase file limit (macOS)
ulimit -n 4096

# Or install watchman
brew install watchman
```

### TypeScript Issues

#### Problem: Module Resolution Errors

```typescript
Error: Cannot find module '@somni/stores'
```

**Solution**:

1. **Check Package Installation**:

   ```bash
   # Reinstall workspace dependencies
   npm install

   # Check workspace linking
   npm ls @somni/stores
   ```

2. **Verify TypeScript Config**:
   ```json
   // apps/mobile/tsconfig.json should extend base
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": {
       "allowJs": true
     }
   }
   ```

#### Problem: Type Errors in Components

```typescript
Error: Property does not exist on type
```

**Solution**:

1. **Check Component Prop Types**:

   ```typescript
   // Use proper interfaces
   interface ButtonProps {
     variant: 'primary' | 'secondary' | 'ghost';
     size: 'small' | 'medium' | 'large';
     onPress: () => void;
   }
   ```

2. **Fix fontWeight Issues**:
   ```typescript
   // Use 'as any' for fontWeight compatibility
   <Text style={{ fontWeight: 'bold' as any }}>
   ```

---

## 🔄 Development Workflow Issues

### Git and Version Control

#### Problem: Husky Hooks Failing

```bash
Error: Husky pre-commit hook failed
```

**Solution**:

```bash
# Fix ESLint errors first
npm run lint --workspace=@somni/mobile

# Skip hooks temporarily if needed (use sparingly)
git commit -m "message" --no-verify
```

#### Problem: Package-lock.json Conflicts

**Solution**:

```bash
# Delete lock files and reinstall
rm -rf node_modules package-lock.json
rm -rf apps/mobile/node_modules
npm install
```

### Performance Issues

#### Problem: Slow Development Server

**Solution**:

```bash
# Clear all caches
npx expo start --clear
rm -rf node_modules/.cache
rm -rf .expo

# Use development build for better performance
eas build --profile development --platform ios
```

---

## 🆘 Emergency Fixes

### Complete Reset (Nuclear Option)

When nothing else works:

```bash
# 1. Stop all processes
killall node
killall expo

# 2. Clean everything
rm -rf node_modules
rm -rf package-lock.json
rm -rf apps/mobile/node_modules
rm -rf apps/mobile/.expo
rm -rf packages/*/node_modules

# 3. Reinstall everything
npm install

# 4. Clear Metro cache and restart
cd apps/mobile
npx expo install --fix
npx expo start --clear
```

### Quick Debugging Checklist

When encountering any issue:

1. ✅ **Check Console**: Look for error messages in terminal and Expo DevTools
2. ✅ **Verify Environment**: Ensure `.env` file is correct and loaded
3. ✅ **Test Network**: Check internet connection and Supabase status
4. ✅ **Clear Caches**: Clear Metro, npm, and Expo caches
5. ✅ **Restart Services**: Restart development server and reload app
6. ✅ **Check Documentation**: Verify you're following current patterns

---

## 📞 Getting Help

### Where to Find More Help

1. **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev)
2. **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
3. **React Navigation**: [reactnavigation.org](https://reactnavigation.org)
4. **Project Issues**: Check the project repository issues

### Reporting New Issues

When reporting issues, include:

1. **Environment**: OS, Node.js version, Expo CLI version
2. **Steps to Reproduce**: Exact steps that cause the issue
3. **Error Messages**: Complete error output from terminal
4. **Expected vs Actual**: What should happen vs what actually happens
5. **Screenshots**: Visual evidence of the issue

---

This troubleshooting guide reflects **real issues** encountered during development of Features 1.1, 1.2, and 2.1. All solutions have been tested and verified to work with the current codebase.
