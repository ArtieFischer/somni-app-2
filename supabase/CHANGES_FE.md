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

## Location Accuracy Schema Update

### Current Schema
```sql
location_accuracy    loc_accuracy_enum  DEFAULT 'none'
CREATE TYPE loc_accuracy_enum AS ENUM ('none', 'country', 'region', 'city', 'exact');
```

### ⚠️ EMERGENCY FIX NEEDED - Column was accidentally deleted

**Run this SQL immediately to restore the location_accuracy column:**

See: `supabase/RESTORE_LOCATION_ACCURACY.sql`

```sql
-- Emergency fix: Restore location_accuracy column after accidental drop
-- (The enum type already exists, just add 'manual' value and recreate column)

DO $$ 
BEGIN
    ALTER TYPE loc_accuracy_enum ADD VALUE 'manual';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE profiles 
ADD COLUMN location_accuracy loc_accuracy_enum DEFAULT 'none' NOT NULL;

-- Set reasonable defaults based on existing location data
UPDATE profiles 
SET location_accuracy = CASE
  WHEN location IS NOT NULL THEN 'exact'::loc_accuracy_enum
  WHEN location_country IS NOT NULL OR location_city IS NOT NULL THEN 'manual'::loc_accuracy_enum
  ELSE 'none'::loc_accuracy_enum
END;
```

### Frontend Changes Applied

#### LocationAccuracy Type Updated
- **File**: `packages/types/src/index.ts`
- **Change**: Updated `LocationAccuracy` type from `'none' | 'country' | 'region' | 'city' | 'exact'` to `'none' | 'manual' | 'exact'`

#### New Location Options
1. **none**: User opts out of location sharing
2. **manual**: User manually selects country/state/city (no GPS)  
3. **exact**: User shares precise GPS coordinates

#### Pending Updates Required
1. **UserPreferencesSection**: Update location sharing logic to handle new enum values and GPS permissions
2. **ProfileHeader**: Add location display between username and handle
3. **Location Components**: Integrate CountryStateCityPicker for manual selection

### Migration Notes
- Existing profiles with `'country'`, `'region'`, or `'city'` values should be migrated to `'manual'`
- The frontend location display logic needs to be updated to handle the new three-option system

## Sleep Schedule Fix - Timezone Agnostic Implementation

### Issue
Sleep schedule was saving full ISO timestamps instead of simple time strings, making it timezone-dependent.

### Changes Applied

#### 1. **Fixed Time Format Saving**
- **StepSleepSchedule.tsx**: Changed from ISO timestamps to 24-hour format (e.g., "23:30")
- **OnboardingSleepScheduleScreen.tsx**: Added 24-hour format function for consistency

#### 2. **Removed Timezone Field**
- **ProfileOnboardingScreen.tsx**: Removed `tz` field from sleep_schedule
- **OnboardingCompleteScreen.tsx**: Removed `tz` field from sleep_schedule

### New Sleep Schedule Format
```typescript
sleep_schedule: {
  bed: string;   // "23:30" (24-hour format)
  wake: string;  // "07:00" (24-hour format)
  // tz field removed - always uses device local time
}
```

### Benefits
1. **Timezone Agnostic**: Notifications will trigger at the same local time regardless of timezone
2. **Travel Friendly**: If user travels NYC → London, bedtime reminder stays at 11:30 PM local time
3. **Simpler Implementation**: No complex timezone conversions needed
4. **Consistent Format**: All sleep times saved as 24-hour HH:MM strings

### Migration Notes
- Existing ISO timestamp values need to be converted to HH:MM format
- The `tz` field can be ignored/dropped from existing records

## Language Support Expansion

### Changes Applied

#### 1. **Expanded Language Support for Transcription**
- Added support for 58 languages (up from 19) to match ElevenLabs Scribe v1 capabilities
- ElevenLabs supports 99 languages total with automatic language detection

#### 2. **Fixed Language Field Reference**
- **File**: `apps/mobile/src/hooks/useRecordingHandler.ts`
- **Fix**: Changed from `profile?.language` to `profile?.locale` (line 173)

#### 3. **Removed Language Restrictions**
- **File**: `apps/mobile/src/components/molecules/UserPreferencesSection/UserPreferencesSection.tsx`
- **Fix**: Removed `limitedLanguages={['en', 'pl']}` restriction from profile screen

#### 4. **Updated Language Mappings**
- **File**: `apps/mobile/src/utils/languageMapping.ts`
- Added ISO 639-1 to ISO 639-3 mappings for 58 languages including:
  - European: Czech, Greek, Hungarian, Romanian, Bulgarian, Croatian, Slovak, etc.
  - Asian: Thai, Vietnamese, Indonesian, Bengali, Tamil, Telugu, Urdu, Persian, etc.
  - African: Swahili, Amharic, Yoruba, Zulu, Afrikaans, etc.
  - Others: Icelandic, Irish, Welsh, Armenian, Georgian, etc.

#### 5. **Updated UI Components**
- **LanguageSelector**: Expanded SUPPORTED_LANGUAGES array to include all 58 languages
- **UserPreferencesSection**: Added proper display names for all languages in native scripts

### Database Considerations
- No database changes required - `locale` field already accepts any string value
- The constraint check `locale = ANY(ARRAY['en','es','fr','de','it','pt','pl','zh','ja','ko','hi','ar','ru','tr','nl','sv','da','no','fi'])` is only enforced at application level, not database level

### Benefits
1. **Better Transcription**: Users can now select their exact language for more accurate speech-to-text
2. **Global Support**: Supports users from many more countries and language backgrounds
3. **Future-Proof**: Easily expandable to ElevenLabs' full 99 language support

## Profile Screen Icon Redesign

### Changes Applied

#### 1. **Created Centralized Icon Configuration**
- **File**: `apps/mobile/src/constants/profileIcons.ts`
- Created a centralized configuration for all profile screen icons
- Replaced all emojis with vector icons from @expo/vector-icons

#### 2. **Updated Components to Use Vector Icons**

**UserPreferencesSection.tsx**:
- 👤 → `person-circle-outline` (Ionicons) - Display Name
- 🌐 → `globe-outline` (Ionicons) - Language  
- 📍 → `location-outline` (Ionicons) - Location Sharing
- ✉️ → `mail-outline` (Ionicons) - Email
- 🔒 → `shield-checkmark-outline` (Ionicons) - Privacy Settings

**DreamingPreferencesSection.tsx**:
- 🧙‍♂️ → `crystal-ball` (MaterialCommunityIcons) - Dream Guide
- 💤 → `moon-outline` (Ionicons) - Sleep Quality
- 😴 → `bed-outline` (Ionicons) - Sleep Schedule
- ✨ → `sparkles` (Ionicons) - Lucid Dreaming

**ProfileHeader.tsx**:
- ⭐ → `star` (Ionicons) - Premium badge
- 📍 → `location-sharp` (Ionicons) - Location pin

**SupportSection.tsx**:
- 📚 → `help-circle-outline` (Ionicons) - Help Center
- 💬 → `chatbubbles-outline` (Ionicons) - Contact Support
- 🔒 → `document-lock-outline` (Ionicons) - Privacy Policy
- 📜 → `document-text-outline` (Ionicons) - Terms of Service
- 🛠️ → `construct-outline` (Ionicons) - Debug Settings

**SharedDreamsSection.tsx**:
- 🌟 → `moon-waxing-crescent` (MaterialCommunityIcons) - Empty state icon

### Icon Selection Rationale
1. **Dreamy Theme**: Selected icons that align with the app's sleep/dream theme (moon, bed, sparkles, crystal ball)
2. **Clarity**: Icons are more recognizable and professional than emojis
3. **Consistency**: Primarily used Ionicons for consistency, with MaterialCommunityIcons for specialized icons
4. **Accessibility**: Vector icons scale better and support color theming

### Benefits
1. **Professional Appearance**: Vector icons look more polished than emojis
2. **Theme Support**: Icons adapt to app theme colors
3. **Better Scaling**: Vector icons maintain quality at any size
4. **Platform Consistency**: Looks the same across iOS and Android