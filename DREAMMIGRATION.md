# Dream Type Migration Documentation

## Overview

The Somni application is currently in a transitional state between two different dream data models. This document outlines the migration challenges and the current state of the codebase.

## The Problem

There is a fundamental mismatch between the database schema, type definitions, and application code regarding the Dream entity structure.

### 1. Schema Mismatch

#### Modern Schema (Database & New Types)
- **Naming Convention**: snake_case
- **Fields**: `user_id`, `raw_transcript`, `created_at`, `updated_at`, `transcription_status`
- **New Features**: `sleep_phase`, `is_lucid`, `mood_before`, `mood_after`
- **Location**: `/supabase/migrations/000_initial_schema.sql`

#### Legacy Schema (DreamEntity & Test Components)
- **Naming Convention**: camelCase
- **Fields**: `userId`, `rawTranscript`, `createdAt`, `updatedAt`, `status`
- **Legacy Features**: `duration`, `confidence`, `wasEdited`, `tags`, `emotions`, `version`, `metadata`
- **Location**: `/packages/types/src/dreamEntity.ts`

### 2. Current Type Definitions

```typescript
// DreamDTO (matches database)
interface DreamDTO {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  raw_transcript?: string;
  title?: string;
  description?: string;
  // ... other snake_case fields
}

// Dream interface (has legacy fields marked as optional)
interface Dream extends DreamDTO {
  // Legacy fields (optional/deprecated)
  duration?: number;
  confidence?: number;
  wasEdited?: boolean;
  status?: string;
  // ... other legacy fields
}
```

### 3. Where Errors Occur

The TypeScript errors primarily occur in:

1. **`/packages/types/src/dreamEntity.ts`**
   - `DreamEntity.create()` expects camelCase properties
   - Tries to access `status`, `version`, `metadata` which don't exist on DreamDTO

2. **Test Components**
   - Still use the legacy structure
   - Create mock data with old field names

3. **DreamStore**
   - Relies on DreamEntity for data transformation
   - Expects legacy field structure

## Impact Analysis

### What Would Break If Types Are Changed

1. **DreamEntity Class**
   - Complete refactoring needed to handle new field names
   - All mapping logic would need updates

2. **DreamStore**
   - Data transformation logic would fail
   - CRUD operations might break

3. **Test Components**
   - All mock data generation would need updates
   - Test assertions might fail

4. **Runtime Errors**
   - Accessing non-existent properties would cause crashes
   - Data persistence might fail

## Migration History

The application appears to be transitioning from:

### Old System (Audio-based Dream Recording)
- Focused on audio recordings with duration
- Had confidence scores for transcription
- Used simple status field
- Supported tags and emotions

### New System (Comprehensive Sleep Tracking)
- Focuses on sleep phases and lucid dreaming
- Tracks mood before/after sleep
- Uses detailed transcription_status
- More structured data model

## Recommendations

### Short-term (Current State)
- **Don't modify types yet** - it will cause runtime crashes
- Document all places using legacy fields
- Add runtime checks for missing properties

### Medium-term (Migration Path)
1. **Create a Migration Layer**
   ```typescript
   class DreamMigrationService {
     static toModern(legacy: LegacyDream): DreamDTO
     static toLegacy(modern: DreamDTO): LegacyDream
   }
   ```

2. **Update DreamEntity Gradually**
   - Add adapters for field name conversions
   - Maintain backward compatibility

3. **Add Deprecation Warnings**
   - Log when legacy fields are accessed
   - Guide developers to new fields

### Long-term (Final State)
1. **Complete Migration**
   - Remove all legacy field references
   - Update all components to use modern schema
   - Remove migration layer

2. **Clean Up Types**
   - Remove deprecated fields from interfaces
   - Ensure type consistency throughout

## Current Workarounds

To work with the current state:

1. **Type Augmentation** (temporary)
   ```typescript
   // In types/dream.d.ts
   declare module '@somni/shared' {
     interface Dream {
       // Add missing legacy fields as optional
       status?: string;
       version?: number;
       metadata?: any;
     }
   }
   ```

2. **Runtime Checks**
   ```typescript
   // Before accessing legacy fields
   if ('status' in dream) {
     // Use legacy field
   } else if ('transcription_status' in dream) {
     // Use modern field
   }
   ```

## Files Affected

- `/packages/types/src/dreamEntity.ts` - Main source of errors
- `/packages/types/src/dream.ts` - Type definitions
- `/packages/stores/src/dreamStore.ts` - Uses DreamEntity
- `/apps/mobile/src/components/molecules/DreamCard/` - Displays dreams
- `/apps/mobile/src/screens/main/DreamDiaryScreen/` - Lists dreams
- Various test components using mock dream data

## Conclusion

The Dream type migration is incomplete and requires careful planning to avoid breaking the application. The current TypeScript errors are symptoms of this larger architectural transition. A phased migration approach with proper adapters and backward compatibility is recommended.