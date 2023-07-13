-- language: postgres
begin;

create table chat_message_history(
    id text not null,
    payload jsonb
);

create unique index chat_message_history_index on chat_message_history using btree(id);

select *
from chat_message_history;

insert into chat_message_history(id, payload)
    values ('id-5', '{"messages": [{"content": "message 1"}]}');

select *
from chat_message_history;

rollback;

