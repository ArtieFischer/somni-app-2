# Fix for "Database error saving new user" Issue

## Problem Summary
Users are getting a "Database error saving new user" error when trying to create an account. The error occurs because the `handle_new_user` trigger function doesn't have the necessary permissions to insert into the `profiles` table due to Row Level Security (RLS) restrictions.

## Root Cause
The `handle_new_user` function in the database was created without the `SECURITY DEFINER` clause. This means it runs with the permissions of the user who triggered it (in this case, an anonymous user during signup), rather than with the permissions of the function owner. Since the `profiles` table has RLS enabled, anonymous users cannot insert records, causing the trigger to fail.

## Solution
The fix involves recreating the `handle_new_user` function with the `SECURITY DEFINER` clause, which allows it to bypass RLS restrictions when creating user profiles.

## Implementation Steps

1. **Run the Fix Script**: Execute the contents of `fix-signup-issue.sql` in your Supabase SQL Editor:
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Create a new query
   - Paste the contents of `fix-signup-issue.sql`
   - Click "Run"

2. **Verify the Fix**: After running the script, you should see a result showing:
   ```
   function_name | is_security_definer
   --------------+--------------------
   handle_new_user | t
   ```
   The 't' (true) confirms the function now has SECURITY DEFINER privileges.

3. **Test Signup**: Try creating a new account in your app. It should now work without the database error.

## Technical Details

### What the Fix Does:
1. Drops the existing trigger to avoid conflicts
2. Recreates the `handle_new_user` function with:
   - `SECURITY DEFINER`: Runs with elevated privileges
   - `SET search_path = public`: Ensures correct schema context
   - Error handling for duplicate handles (appends random suffix)
   - Comprehensive error logging
3. Recreates the trigger on `auth.users` table

### Handle Generation Logic:
The function generates handles in this priority order:
1. Uses `handle` from user metadata if provided
2. Falls back to `username` from user metadata
3. Falls back to `user_` + first 8 characters of UUID

If a handle already exists (unique constraint violation), it appends a random 6-character suffix.

## Files Modified
- Created: `/supabase/migrations/005_fix_handle_new_user_trigger.sql`
- Created: `/supabase/migrations/006_test_and_debug_trigger.sql`
- Created: `/fix-signup-issue.sql` (for direct execution in Supabase Dashboard)

## Prevention
To prevent this issue in future migrations:
1. Always use `SECURITY DEFINER` for trigger functions that need to bypass RLS
2. Test signup flow after any database schema changes
3. Include proper error handling in trigger functions
4. Consider using service role for operations that need to bypass RLS