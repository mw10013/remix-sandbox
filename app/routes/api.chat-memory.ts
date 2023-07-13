import { type ActionArgs } from "@remix-run/node";
import { StreamingTextResponse, LangChainStream } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from "langchain/prompts";
import { BufferMemory } from "langchain/memory";
import type { BaseMessage, StoredMessage } from "langchain/schema";
import { supabaseAdmin } from "~/lib/supabase";
import {
  AIMessage,
  BaseListChatMessageHistory,
  HumanMessage,
  SystemMessage,
} from "langchain/schema";
import type { Json } from "types/database";

// Based on langchain/stores/message/utils.ts
// payload │ {"messages": [{"data": {"content": "yo", "additional_kwargs": {}}, "type": "human"}, {"data": {"content": "Hello! How can I assist you today?", "additional_kwargs": {}}, "type": "ai"}]}
export function mapStoredMessagesToChatMessages(
  messages: StoredMessage[]
): BaseMessage[] {
  return messages.map((m) => {
    switch (m.type) {
      case "human":
        return new HumanMessage(m.data);
      case "ai":
        return new AIMessage(m.data);
      case "system":
        return new SystemMessage(m.data);
      // case "chat": {
      //   if (m.data.role === undefined) {
      //     throw new Error("Role must be defined for chat messages");
      //   }
      //   return new ChatMessage(storedMessage.data as ChatMessageFieldsWithRole);
      // }
      default:
        throw new Error(
          `mapStoredMessagesToChatMessages: unexpected type: ${m.type}`
        );
    }
  });
}

export function mapChatMessagesToStoredMessages(
  messages: BaseMessage[]
): StoredMessage[] {
  return messages.map((message) => message.toDict());
}

// id      │ 6PMNym1
// payload │ {"messages": [{"data": {"content": "yo", "additional_kwargs": {}}, "type": "human"}, {"data": {"content": "Hello! How can I assist you today?", "additional_kwargs": {}}, "type": "ai"}]}

export class SupaChatMessageHistory extends BaseListChatMessageHistory {
  lc_namespace = ["langchain", "stores", "message", "in_memory"];

  private id: string;
  private messages: BaseMessage[] = [];

  constructor(id: string) {
    super();
    this.id = id;
    this.messages = [];
    this.initialize();
  }

  async initialize(): Promise<void> {
    const { data } = await supabaseAdmin
      .from("chat_message_history")
      .select("payload")
      .eq("id", this.id)
      .throwOnError()
      .maybeSingle();
    // console.log({ data: JSON.stringify(data, null, 2) });
    this.messages = data?.payload
      ? mapStoredMessagesToChatMessages(data.payload.messages)
      : [];
    console.log("SupaChatMessageHistory: initialize: ", { messages: JSON.stringify(this.messages, null, 2) });
  }

  async getMessages(): Promise<BaseMessage[]> {
    console.log("SupaChatMessageHistory: getMessages", {
      messages: JSON.stringify(this.messages, null, 2),
    });
    return this.messages;
  }

  async addMessage(message: BaseMessage) {
    // console.log("SupaChatMessageHistory: addMessage", { message });
    this.messages.push(message);
    const messagesData = mapChatMessagesToStoredMessages(this.messages);

    await supabaseAdmin
      .from("chat_message_history")
      .upsert({
        id: this.id,
        payload: { messages: messagesData } as unknown as Json,
      })
      .throwOnError();
  }

  async clear() {
    // this.messages = [];
    throw new Error("SupaChatMessageHistory: clear: unimplemented");
  }
}

export const action = async ({ request }: ActionArgs) => {
  // [
  //   { role: 'user', content: "w'sup" },
  //   { role: 'assistant', content: 'Not much.' },
  //   { role: 'user', content: 'chill' },
  //   { role: 'assistant', content: 'OK.' },
  //   { role: 'user', content: 'peace' }
  // ]
  const { id, messages } = await request.json();
  const { content: input } = messages[messages.length - 1];
  console.log({ id, input });

  const { stream, handlers } = LangChainStream();
  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0,
    maxRetries: 1,
    streaming: true,
  });

  const prompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      "You are a laconic assistant that responds concisely"
    ),
    // https://js.langchain.com/docs/modules/memory/examples/buffer_memory_chat
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

  const chain = new ConversationChain({
    memory: new BufferMemory({
      returnMessages: true,
      memoryKey: "history",
      chatHistory: new SupaChatMessageHistory(id),
    }),
    prompt,
    llm: chat,
  });
  chain.call({ input }, [handlers]);

  return new StreamingTextResponse(stream);
};
