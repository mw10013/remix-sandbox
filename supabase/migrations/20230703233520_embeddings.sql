-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector with schema public;

-- Create a table to store your documents
create table documents(
    id bigserial primary key,
    content text not null, -- corresponds to Document.pageContent
    metadata jsonb, -- corresponds to Document.metadata
    embedding vector(1536) not null, -- 1536 works for OpenAI embeddings, change if needed
    token_count int not null
);

-- https://supabase.com/docs/guides/ai/vector-columns
create or replace function match_documents(query_embedding vector(1536), match_threshold float, match_count int)
    returns table(
        id bigint,
        content text,
        similarity float)
    language sql
    stable
    as $$
    select documents.id,
        documents.content,
        1 -(documents.embedding <=> query_embedding) as similarity
    from documents
    where 1 -(documents.embedding <=> query_embedding) > match_threshold
    order by similarity desc
    limit match_count;
$$;

-- Create a function to search for documents
-- https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/supabase
-- create function match_documents(query_embedding vector(1536), match_count int default null, filter jsonb default '{}')
--     returns table(
--         id bigint,
--         content text,
--         metadata jsonb,
--         similarity float)
--     language plpgsql
--     as $$
--     # variable_conflict use_column
-- begin
--     return query
--     select id,
--         content,
--         metadata,
--         1 -(documents.embedding <=> query_embedding) as similarity
--     from documents
--     where metadata @> filter
--     order by documents.embedding <=> query_embedding
--     limit match_count;
-- end;
-- $$;
