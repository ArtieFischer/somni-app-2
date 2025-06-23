-- Additional debugging and testing for the handle_new_user trigger

-- First, let's check if the trigger exists and its current definition
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    proname as function_name,
    prosecdef as is_security_definer
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- Check current permissions on profiles table
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- Also create a helper function to manually test profile creation
-- This can be used to debug issues
CREATE OR REPLACE FUNCTION test_create_profile(
    test_user_id uuid,
    test_handle text,
    test_username text
) 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (
        user_id, 
        handle,
        username,
        sex,
        locale
    )
    VALUES (
        test_user_id,
        test_handle,
        test_username,
        'unspecified'::sex_enum,
        'en'
    );
    
    RAISE NOTICE 'Profile created successfully for user %', test_user_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating profile: % %', SQLERRM, SQLSTATE;
        RAISE;
END;
$$;

-- Grant execute permission to authenticated users for testing
GRANT EXECUTE ON FUNCTION test_create_profile TO authenticated;