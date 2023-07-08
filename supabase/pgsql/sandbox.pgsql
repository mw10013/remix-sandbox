begin;

create table items(
    id bigserial primary key,
    embedding vector(3)
);

insert into items(embedding)
    values ('[1,2,3]'),
('[3,1,2]'),
('[4,5,6]');

select *,
    vector_dims(embedding)
from items
order by embedding <=> '[3,1,2]'
limit 5;

select *
from items
where id != 1
order by embedding <->(
        select embedding
        from items
        where id = 1)
limit 5;

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

select id,
    substring(content, 1, 40),
    similarity
from match_documents((
        select embedding from documents
            where id = 6), 0.87, 50);

-- select id,
--     substring(content, 1, 40),
--     vector_dims(embedding)
-- from documents
-- where id = 6;
rollback;

