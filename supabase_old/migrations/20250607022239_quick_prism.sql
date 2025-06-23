/*
  # Vector Search Functions

  1. Functions
    - `match_dreams` - Semantic similarity search for dreams
  
  2. Indexes
    - HNSW index for efficient vector similarity search
*/

-- Function for similarity search
create or replace function match_dreams(
  query_embedding vector(1536),
  match_threshold float default 0.78,
  match_count int default 10,
  filter_user_id uuid default null
)
returns table (
  id uuid,
  user_id uuid,
  raw_transcript text,
  refined_narrative text,
  created_at timestamp with time zone,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dreams.id,
    dreams.user_id,
    dreams.raw_transcript,
    dreams.refined_narrative,
    dreams.created_at,
    1 - (dreams.embedding <=> query_embedding) as similarity
  from public.dreams
  where 
    dreams.embedding is not null
    and (filter_user_id is null or dreams.user_id = filter_user_id)
    and 1 - (dreams.embedding <=> query_embedding) > match_threshold
  order by dreams.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create the HNSW index for vector similarity search
-- Note: This may fail if there are no embeddings yet - that's okay, run it later
create index if not exists idx_dreams_embedding 
on public.dreams using hnsw (embedding vector_cosine_ops)
where embedding is not null;