# Architecture Decision: Separate Apps vs react-native-web

## Current Architecture: Separate Apps ✅

### Benefits:
1. **Platform-Specific Optimization**: Each app can be optimized for its platform
2. **Technology Freedom**: Web can use latest React features, mobile can use React Native features
3. **Bundle Size**: Smaller bundles since no cross-platform compatibility layer
4. **Developer Experience**: Better tooling and debugging for each platform
5. **Performance**: No abstraction layer overhead

### Structure:
```
apps/
├── mobile/          # React Native + Expo
│   ├── src/
│   └── package.json # RN-specific dependencies
└── web/             # React + Vite  
    ├── src/
    └── package.json # Web-specific dependencies

types/               # Shared TypeScript types
utils/               # Shared utility functions
```

## Alternative: react-native-web ❌ (Not Recommended for This Project)

### When to Use:
- Single codebase for both platforms
- Heavy UI component sharing
- Team has limited resources for maintaining separate apps

### Drawbacks for Somni:
- **Bundle Size**: Adds ~100KB+ to web bundle
- **Performance**: Abstraction layer overhead
- **Limitations**: Some React Native features don't work on web
- **Complexity**: CSS-in-JS styling complications
- **Maintenance**: More complex build process

## Recommendation: Keep Current Architecture

Your current setup is optimal for the Somni project because:

1. **Dream Recording**: Mobile-specific features (microphone, offline storage)
2. **Web Dashboard**: Different UX patterns for data management
3. **Performance Critical**: Dream analysis needs optimal performance
4. **Future Scaling**: Easier to optimize each platform independently

## Shared Code Strategy

Continue sharing:
- ✅ TypeScript types (`@somni/types`)
- ✅ Business logic (`@somni/utils`)
- ✅ API clients (Supabase integration)
- ✅ Data models and validation

Don't share:
- ❌ UI components (different design patterns)
- ❌ Navigation (different paradigms)
- ❌ Platform-specific features