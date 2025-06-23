# Frontend Database Integration Fixes

This document tracks all changes needed to fix the broken account creation process and align the frontend with the current database schema.

## Issues Identified

### 1. **Critical Table Reference Error**
**File:** `apps/mobile/src/screens/onboarding/steps/StepDreamInterpreter.tsx:67`
**Issue:** References non-existent table `dream_interpreters`
**Current Schema:** Table is named `interpreters`
**Impact:** Dream interpreter selection fails during onboarding

### 2. **Field Name Mismatches**
**Frontend uses old schema field names that don't match current database:**

| Frontend Field | Database Field | Location |
|---|---|---|
| `date_of_birth` | `birth_date` | StepPersonalInfo.tsx |
| `display_name` | `username` | Multiple files |
| `onboarding_completed` | `onboarding_complete` | UserRepository.ts |
| `language` | `locale` | Multiple files |

### 3. **Sex Enum Mismatch**
**Frontend:** `'male' | 'female' | 'other' | 'prefer_not_to_say'`
**Database:** `'male' | 'female' | 'other' | 'unspecified'`
**Impact:** Sex field not saved due to enum violation

### 4. **Settings Structure Missing**
**Issue:** Frontend tries to access `profile.improve_sleep_quality` directly
**Database:** These fields are in `profile.settings.improve_sleep_quality` (JSONB)
**Impact:** Preferences not properly saved or read

### 5. **UserRepository Incomplete**
**Missing fields in update operations:**
- `sex`
- `birth_date` 
- `locale`
- `dream_interpreter`
- `location` fields
- Proper `settings` JSONB structure

### 6. **Preferences Data Flow Broken**
**Issue:** StepPreferences collects data but doesn't flow to final settings
**Impact:** User preferences like sleep quality and lucid dreaming interest not saved

## Required Changes

### Database Schema Updates

#### 1. Fix Sex Enum (Migration Required)
The frontend uses `prefer_not_to_say` but database expects `unspecified`:

```sql
-- Update sex enum to match frontend expectations
ALTER TYPE sex_enum ADD VALUE IF NOT EXISTS 'prefer_not_to_say';

-- Optional: Update existing 'unspecified' values to 'prefer_not_to_say'
UPDATE profiles SET sex = 'prefer_not_to_say' WHERE sex = 'unspecified';

-- Note: Cannot drop enum values in PostgreSQL, so 'unspecified' will remain
```

### Frontend Code Updates

#### 1. Fix Table Reference
**File:** `apps/mobile/src/screens/onboarding/steps/StepDreamInterpreter.tsx`
**Line 67:** Change `dream_interpreters` to `interpreters`

#### 2. Fix Field Name Mapping
**File:** `apps/mobile/src/screens/onboarding/OnboardingScreen.tsx`
**Lines 158-159:** Update field names to match database schema

#### 3. Update UserRepository
**File:** `apps/mobile/src/infrastructure/repositories/UserRepository.ts`
**Add missing fields in update method and implement proper settings structure**

#### 4. Fix Settings Structure
**File:** `apps/mobile/src/screens/onboarding/OnboardingCompleteScreen/OnboardingCompleteScreen.tsx`
**Update to properly construct settings JSONB object**

#### 5. Update PreferencesSection
**File:** `apps/mobile/src/components/molecules/PreferencesSection/PreferencesSection.tsx`
**Fix settings access patterns**

### Profile Screen Design Updates

#### 1. Add Account Age Display
Add "Member since" or "Using app for X days/months" in ProfileHeader component

#### 2. Clean Up Design
- Improve spacing and card layouts
- Better visual hierarchy
- More intuitive preference organization

## Implementation Priority

1. **Critical (Breaks onboarding):**
   - Fix table reference error ✅
   - Update sex enum ✅
   - Fix field name mappings ✅
   - Fix incorrect field reference in OnboardingScreen.tsx (line 155: using `formData.username` instead of `formData.display_name` for handle field) ✅

2. **High (Data not saved):**
   - Update UserRepository ✅
   - Fix settings structure ✅
   - Ensure preferences flow ✅

3. **Medium (UX improvements):**
   - Add account age display ✅
   - Clean up profile design ✅

## Testing Checklist

After implementing fixes:

- [ ] User can complete onboarding successfully
- [ ] All personal info fields save correctly (sex, birth_date, display_name)
- [ ] Dream interpreter selection works
- [ ] Preferences (sleep quality, lucid dreaming) save in settings
- [ ] Profile screen displays all data correctly
- [ ] Language selection works and maps correctly
- [ ] Avatar upload/display functions properly
- [ ] Account age displays correctly

## Migration SQL

⚠️ **IMPORTANT**: PostgreSQL requires enum additions to be in separate transactions due to safety constraints.

### Step 1: Add Enum Value (Run First)
```sql
-- Must be run in a separate transaction
ALTER TYPE sex_enum ADD VALUE 'prefer_not_to_say';

-- Verify enum values (should show: male, female, other, unspecified, prefer_not_to_say)
SELECT unnest(enum_range(NULL::sex_enum));
```

### Step 2: Verify Setup (Run After Step 1)
```sql
-- Check that all expected values are present
SELECT unnest(enum_range(NULL::sex_enum)) as sex_options;
SELECT unnest(enum_range(NULL::loc_accuracy_enum)) as location_options;

-- Verify interpreters table
SELECT id, name FROM interpreters ORDER BY id;
```

## Settings Data Type Issues Fixed

### Frontend String Values → Database Boolean Conversion
**Frontend sends:** `'yes'`, `'no'`, `'not_sure'`, `'dont_know_yet'`
**Database expects:** `true`, `false`, `null`

**Fixed in OnboardingCompleteScreen.tsx:**
- `'yes'` → `true`
- `'no'` → `false`  
- `'not_sure'`/`'dont_know_yet'` → `null`

## Notes

- The `handle_new_user()` trigger function appears correct and doesn't need changes
- Database schema structure is solid - issues are in frontend integration
- All fixes maintain backward compatibility
- Consider adding validation to prevent future schema mismatches

## Account Creation Fix Applied

### Issue Found
In `OnboardingScreen.tsx` line 155, the code was using `formData.username` for the `handle` field, but `formData.username` contains the email username part, not the display name. The actual display name is in `formData.display_name`.

### Fix Applied
Changed line 155 from:
```typescript
handle: formData.username, // Set handle to the username
```
To:
```typescript
handle: formData.display_name, // Use display_name for handle
```

This ensures that the user's display name (collected in StepPersonalInfo) is properly saved as their handle in the database during account creation.

## UserRepository Fix Applied

### Issues Found
1. The `save` method was using INSERT instead of UPSERT, which would fail since the trigger already creates a profile
2. Missing fields in both `save` and `update` methods: sex, birth_date, locale, dream_interpreter
3. Fields that don't exist in database were being saved: display_name, sleep_schedule, lucid_dream_settings

### Fixes Applied
1. Changed `save` method to use UPSERT instead of INSERT
2. Added all missing profile fields to the save method
3. Enhanced the update method to properly handle all profile fields
4. Moved sleep_schedule and preference fields to the settings JSONB structure
5. Added proper field deletion for non-existent database fields

## Sleep Schedule Time Picker Fix

### Issue
The time picker was showing limited hours on iOS due to the combination of `minuteInterval` and `is24Hour` props causing conflicts with the native iOS picker.

### Fix Applied
Removed `minuteInterval={1}` and `is24Hour={true}` props from both DateTimePicker components in OnboardingSleepScheduleScreen. These props were causing the iOS picker to limit available hours.