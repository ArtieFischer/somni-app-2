-- Add DELETE policies for users to manage their own data

-- 1. Grant DELETE permissions to authenticated users
GRANT DELETE ON profiles TO authenticated;
GRANT DELETE ON dreams TO authenticated;
GRANT DELETE ON dream_images TO authenticated;
GRANT DELETE ON dream_themes TO authenticated;
GRANT DELETE ON interpretations TO authenticated;
GRANT DELETE ON conversations TO authenticated;
GRANT DELETE ON messages TO authenticated;

-- 2. Create DELETE policy for profiles
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
  
  CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE
    USING (auth.uid() = user_id);
    
  RAISE NOTICE 'Created DELETE policy for profiles';
END $$;

-- 3. Create DELETE policy for dreams
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can delete own dreams" ON dreams;
  
  CREATE POLICY "Users can delete own dreams" ON dreams
    FOR DELETE
    USING (auth.uid() = user_id);
    
  RAISE NOTICE 'Created DELETE policy for dreams';
END $$;

-- 4. Create DELETE policy for dream_images (cascade from dreams)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can delete own dream images" ON dream_images;
  
  CREATE POLICY "Users can delete own dream images" ON dream_images
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM dreams 
        WHERE dreams.id = dream_images.dream_id 
        AND dreams.user_id = auth.uid()
      )
    );
    
  RAISE NOTICE 'Created DELETE policy for dream_images';
END $$;

-- 5. Create DELETE policy for dream_themes (cascade from dreams)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can delete own dream themes" ON dream_themes;
  
  CREATE POLICY "Users can delete own dream themes" ON dream_themes
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM dreams 
        WHERE dreams.id = dream_themes.dream_id 
        AND dreams.user_id = auth.uid()
      )
    );
    
  RAISE NOTICE 'Created DELETE policy for dream_themes';
END $$;

-- 6. Create DELETE policy for interpretations (through dreams relationship)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can delete own interpretations" ON interpretations;
  
  CREATE POLICY "Users can delete own interpretations" ON interpretations
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM dreams 
        WHERE dreams.id = interpretations.dream_id 
        AND dreams.user_id = auth.uid()
      )
    );
    
  RAISE NOTICE 'Created DELETE policy for interpretations';
END $$;

-- 7. Create DELETE policy for conversations
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
  
  CREATE POLICY "Users can delete own conversations" ON conversations
    FOR DELETE
    USING (user_id = auth.uid());
    
  RAISE NOTICE 'Created DELETE policy for conversations';
END $$;

-- 8. Create DELETE policy for messages (cascade from conversations)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
  
  CREATE POLICY "Users can delete own messages" ON messages
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM conversations 
        WHERE conversations.id = messages.conversation_id 
        AND conversations.user_id = auth.uid()
      )
    );
    
  RAISE NOTICE 'Created DELETE policy for messages';
END $$;

-- Note: Profile deletion should cascade to all user data due to foreign key constraints
-- The auth.users table has ON DELETE CASCADE for the profile relationship
-- This means when a user is deleted from auth.users, their profile and all related data will be deleted automatically