# SQL Scripts for Supabase Setup

This directory contains all SQL scripts needed to set up the Somni database schema in Supabase. Execute these scripts in order in your Supabase dashboard's SQL Editor.

## Execution Order

1. `01-enable-extensions.sql` - Enable required PostgreSQL extensions
2. `02-create-tables.sql` - Create core tables and types
3. `03-setup-rls.sql` - Configure Row Level Security and policies
4. `04-vector-functions.sql` - Set up vector search capabilities
5. `05-additional-tables.sql` - Create supporting tables for advanced features

## Usage

1. Open your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste each script in order
4. Execute each script and verify it completes successfully
5. Check the Table Editor to confirm all tables are created

## Notes

- Always execute scripts in the specified order
- Some scripts depend on previous ones completing successfully
- The vector index creation may need to be done after adding some sample data
- All scripts use `IF NOT EXISTS` clauses for safety

## Verification

After running all scripts, you should have:
- 4 main tables: `users_profile`, `dreams`, `dream_analysis`, `dream_symbols`
- Proper RLS policies on all tables
- Vector search functions
- Automatic triggers for user profile creation and timestamp updates