create table chat_message_history(
    id text primary key not null,
    payload jsonb not null
);

create unique index chat_message_history_index on chat_message_history using btree(id);

