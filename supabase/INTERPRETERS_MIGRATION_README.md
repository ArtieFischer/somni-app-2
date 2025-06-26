# Interpreters Table Migration Guide

## Overview
This migration updates the interpreters table to align IDs with the available image assets and fixes image URLs.

## Current State
The interpreters table currently has IDs: `carl`, `sigmund`, `lakshmi`, `mary`
The available image assets have filenames: `jung.png`, `freud.png`, `lakshmi.png`, `mary.png`

## Migration Changes
1. Updates interpreter IDs:
   - `carl` → `jung`
   - `sigmund` → `freud`
   - `lakshmi` → `lakshmi` (no change)
   - `mary` → `mary` (no change)

2. Updates image URLs to use local assets path: `/assets/{interpreter_id}.png`

3. Updates all foreign key references in:
   - `profiles.dream_interpreter`
   - `interpretations.interpreter_id`
   - `conversations.interpreter_id`

## Files Created

1. **Query Current State**: `supabase/query_interpreters_current_state.sql`
   - Use this to check the current state before migration

2. **Migration Script**: `supabase/migrations/20250126_update_interpreters_data.sql`
   - Main migration that updates IDs and image URLs

3. **Rollback Script**: `supabase/migrations/20250126_update_interpreters_rollback.sql`
   - Use this if you need to revert the changes

4. **Upload Script**: `supabase/upload_interpreter_images.sh`
   - Optional script to upload images to Supabase Storage

## How to Apply Migration

### Step 1: Check Current State
```bash
# Run this query in your Supabase SQL editor
psql $DATABASE_URL < supabase/query_interpreters_current_state.sql
```

### Step 2: Apply Migration
```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Run directly in SQL editor
# Copy contents of 20250126_update_interpreters_data.sql and execute
```

### Step 3: Verify Changes
- Check that all interpreters have correct IDs
- Verify image URLs are accessible
- Test that foreign key relationships are intact

### Step 4: Update Frontend Code
Update any hardcoded interpreter IDs in your frontend:
- Change `'carl'` to `'jung'`
- Change `'sigmund'` to `'freud'`

## Image URL Options

### Option 1: Local Assets (Default in migration)
- URLs: `/assets/{interpreter_id}.png`
- Images served from your app's assets directory
- No additional upload needed

### Option 2: Supabase Storage
- URLs: `/storage/v1/object/public/interpreters/{interpreter_id}.png`
- Requires uploading images to Supabase Storage
- Use the provided upload script

## Rollback Instructions
If you need to revert:
```bash
# Run the rollback script
psql $DATABASE_URL < supabase/migrations/20250126_update_interpreters_rollback.sql
```

## Important Notes
1. This migration temporarily drops and recreates foreign key constraints
2. All existing references are automatically updated
3. The migration includes verification steps to confirm success
4. Always backup your database before running migrations