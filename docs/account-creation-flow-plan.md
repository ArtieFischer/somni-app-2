# Comprehensive Account Creation Flow Plan

## Overview
Enhanced account creation flow with multiple data points to personalize user experience from the start.

## Required User Data

### 1. Basic Authentication
- **Email** (required, unique)
- **Password** (required, min 8 chars)

### 2. Profile Information
- **Handle/Username** (required, unique, 3-24 chars)
- **Display Name** (required, can be non-unique)
- **Sex** (required: male, female, other, prefer not to say)
- **Date of Birth** (required, for age verification)
- **Avatar** (required, image upload)
- **Language** (required, default: 'en', for transcription and UI)

### 3. Dream Interpreter Selection (required)
Choose 1 of 4 interpreters:
- **Carl** - Jungian approach (collective unconscious, archetypes)
- **Sigmund** - Freudian approach (wish fulfillment, psychoanalysis)
- **Lakshmi** - Eastern/spiritual approach (karma, spiritual growth)
- **Mary** - Modern cognitive approach (memory processing, problem-solving)

Each interpreter needs:
- Profile image
- Name
- Short description (2-3 sentences)
- Interpretation style/methodology

### 4. Preference Questions
- **"Do you want to improve your sleep quality?"** (Yes/No/Not sure)
- **"Are you interested in lucid dreaming?"** (Yes/No/Don't know yet)

## Database Schema Changes

### 1. Modify `users_profile` table
```sql
ALTER TABLE users_profile ADD COLUMN IF NOT EXISTS
  sex text CHECK (sex IN ('male', 'female', 'other', 'prefer_not_to_say')),
  date_of_birth date NOT NULL,
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('en')), -- Start with English, easily extensible
  dream_interpreter text CHECK (dream_interpreter IN ('carl', 'sigmund', 'lakshmi', 'mary')),
  improve_sleep_quality text CHECK (improve_sleep_quality IN ('yes', 'no', 'not_sure')),
  interested_in_lucid_dreaming text CHECK (interested_in_lucid_dreaming IN ('yes', 'no', 'dont_know_yet'));

-- For future language support, we can modify the CHECK constraint:
-- CHECK (language IN ('en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ko', 'ru', 'ar', 'hi'))
```

### 2. Create `dream_interpreters` table
```sql
CREATE TABLE dream_interpreters (
  id text PRIMARY KEY,
  name text NOT NULL,
  full_name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  interpretation_style jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert the 4 interpreters
INSERT INTO dream_interpreters (id, name, full_name, description, image_url, interpretation_style) VALUES
  ('carl', 'Carl', 'Carl Jung', 'Explores collective unconscious and universal archetypes in your dreams', 'storage/interpreters/carl.jpg', '{"approach": "jungian", "focus": ["archetypes", "collective_unconscious", "individuation"]}'),
  ('sigmund', 'Sigmund', 'Sigmund Freud', 'Analyzes dreams as wish fulfillment and unconscious desires', 'storage/interpreters/sigmund.jpg', '{"approach": "freudian", "focus": ["wish_fulfillment", "unconscious_desires", "symbolism"]}'),
  ('lakshmi', 'Lakshmi', 'Lakshmi Devi', 'Interprets dreams through spiritual and karmic perspectives', 'storage/interpreters/lakshmi.jpg', '{"approach": "spiritual", "focus": ["karma", "spiritual_growth", "consciousness"]}'),
  ('mary', 'Mary', 'Mary Whiton', 'Uses modern cognitive science to understand dream meanings', 'storage/interpreters/mary.jpg', '{"approach": "cognitive", "focus": ["memory_processing", "problem_solving", "neuroscience"]}');
```

## Storage Setup

### 1. Create Storage Buckets
```sql
-- Avatar storage
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Dream interpreter images
INSERT INTO storage.buckets (id, name, public) VALUES ('interpreters', 'interpreters', true);
```

### 2. Storage Policies
```sql
-- Avatar policies
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Interpreter images (public read)
CREATE POLICY "Public interpreter images" ON storage.objects
  FOR SELECT USING (bucket_id = 'interpreters');
```

## UI/UX Flow

### Account Creation Steps:
1. **Step 1: Credentials**
   - Email input
   - Password input
   - Handle/username input (with availability check)

2. **Step 2: Personal Info**
   - Display name input
   - Sex selection (radio buttons or dropdown)
   - Date of birth picker
   - Language selection (dropdown, default: English)
   - Avatar upload (image picker + crop)

3. **Step 3: Dream Interpreter**
   - Grid/carousel of 4 interpreters
   - Each shows: Image, name, description
   - Single selection required

4. **Step 4: Preferences**
   - Sleep quality improvement question
   - Lucid dreaming interest question
   - Each with 3 options

5. **Step 5: Review & Create**
   - Summary of all selections
   - Terms of service agreement
   - Create account button

### Account Subpage Display
Show all collected information:
- Avatar (editable)
- Display name & handle
- Email
- Sex
- Age (calculated from DOB)
- Language (editable, affects transcriptions)
- Selected dream interpreter (with option to change)
- Preference answers
- Account creation date
- Premium status

## Implementation Tasks

### Backend:
1. Database migration for new fields
2. Update user creation trigger to handle new fields
3. Create storage buckets and policies
4. Update API endpoints for profile data
5. Add interpreter data endpoints

### Frontend:
1. Create multi-step onboarding flow
2. Add image picker for avatar
3. Design interpreter selection UI
4. Create account subpage
5. Update types and interfaces
6. Add form validation
7. Handle error states

### Dependencies to Add:
- `expo-image-picker` for avatar selection
- `expo-image-manipulator` for image cropping
- Date picker component

## Type Updates

```typescript
interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  sex: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  date_of_birth: string;
  language: 'en'; // Start with English, will extend to: 'en' | 'es' | 'fr' | 'de' | etc.
  dream_interpreter: 'carl' | 'sigmund' | 'lakshmi' | 'mary';
  improve_sleep_quality: 'yes' | 'no' | 'not_sure';
  interested_in_lucid_dreaming: 'yes' | 'no' | 'dont_know_yet';
  is_premium: boolean;
  onboarding_completed: boolean;
  sleep_schedule?: {
    bedtime: string;
    wake_time: string;
  };
  lucid_dream_settings?: {};
  created_at: string;
  updated_at: string;
}

interface DreamInterpreter {
  id: string;
  name: string;
  full_name: string;
  description: string;
  image_url: string;
  interpretation_style: {
    approach: string;
    focus: string[];
  };
}
```

## Validation Rules
- Email: Valid email format
- Password: Min 8 characters
- Username: 3-24 chars, alphanumeric + underscore
- Display name: 1-50 characters
- Date of birth: Must be 13+ years old
- Avatar: Max 5MB, JPG/PNG only

## Language Implementation Notes

### Why Store Language in User Profile
1. **Transcription Quality**: Language setting directly affects speech-to-text accuracy
2. **UI Localization**: Future-proofs the app for multi-language support
3. **Personalization**: Dream interpreters can provide culturally-aware interpretations
4. **Analytics**: Understanding user demographics

### Usage in Transcription
When sending audio for transcription:
```typescript
// Example usage in transcription service
const transcriptionConfig = {
  audio_url: audioUrl,
  language: userProfile.language, // 'en' for now
  // This ensures proper language model is used for speech recognition
};
```

### Future Language Support
The schema is designed to easily add languages:
1. Update the CHECK constraint in the database
2. Add language options to the TypeScript types
3. Update UI language selector
4. Add translations for UI strings
5. Configure transcription service for new languages