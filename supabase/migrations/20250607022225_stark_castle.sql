-- Enable pgvector extension for vector embeddings
-- This must be run first before creating any tables with vector columns

create extension if not exists vector with schema extensions;