create table chat_message_history(
    id text primary key not null,
    payload jsonb not null
);

create unique index chat_message_history_index on chat_message_history using btree(id);

create table chat_summary(
    id text primary key not null,
    summary text not null
);

create unique index chat_summary_index on chat_summary using btree(id);

