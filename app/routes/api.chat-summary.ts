import { type ActionArgs } from "@remix-run/node";
import { StreamingTextResponse, LangChainStream } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import type { ConversationSummaryMemoryInput } from "langchain/memory";
import { ConversationSummaryMemory } from "langchain/memory";
import type { BaseMessage, InputValues, StoredMessage } from "langchain/schema";
import { supabaseAdmin } from "~/lib/supabase";
import {
  AIMessage,
  BaseListChatMessageHistory,
  HumanMessage,
  SystemMessage,
} from "langchain/schema";
import type { Json } from "types/database";
import type { OutputValues } from "langchain/dist/memory/base";

export interface SupaConversationSummaryMemoryInput
  extends ConversationSummaryMemoryInput {
  id: string;
  buffer: string;
}

export class SupaConversationSummaryMemory extends ConversationSummaryMemory {
  id: string;

  constructor(fields: SupaConversationSummaryMemoryInput) {
    const { id, buffer, ...superFields } = fields;
    super(superFields);
    this.id = id;
    this.buffer = buffer;
  }

  static async fromId(
    fields: Omit<SupaConversationSummaryMemoryInput, "buffer">
  ): Promise<SupaConversationSummaryMemory> {
    const { id, ...instanceFields } = fields;
    const { data } = await supabaseAdmin
      .from("chat_summary")
      .select("summary")
      .eq("id", id)
      .throwOnError()
      .maybeSingle();

    const buffer: string = data?.summary ? data.summary : "";
    console.log(`SupaConversationSummaryMemory: fromId: ${buffer}`);
    return new SupaConversationSummaryMemory({ id, buffer, ...instanceFields });
  }

  async saveContext(
    inputValues: InputValues,
    outputValues: OutputValues
  ): Promise<void> {
    await super.saveContext(inputValues, outputValues);
    console.log(`SupaConversationSummaryMemory: saveContext: ${this.buffer}`);
    await supabaseAdmin
      .from("chat_summary")
      .upsert({
        id: this.id,
        summary: this.buffer,
      })
      .throwOnError();
  }
}

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

// payload │ {"messages": [{"data": {"content": "yo", "additional_kwargs": {}}, "type": "human"}, {"data": {"content": "Hello! How can I assist you today?", "additional_kwargs": {}}, "type": "ai"}]}
export class SupaChatMessageHistory extends BaseListChatMessageHistory {
  lc_namespace = ["langchain", "stores", "message", "in_memory"];

  private id: string;
  private messages: BaseMessage[];

  constructor(id: string, messages: BaseMessage[]) {
    super();
    this.id = id;
    this.messages = messages;
  }

  static async fromId(id: string): Promise<SupaChatMessageHistory> {
    const { data } = await supabaseAdmin
      .from("chat_message_history")
      .select("payload")
      .eq("id", id)
      .throwOnError()
      .maybeSingle();

    const messages: BaseMessage[] =
      data?.payload &&
      typeof data.payload === "object" &&
      "messages" in data.payload
        ? mapStoredMessagesToChatMessages(
            data.payload.messages as unknown as StoredMessage[]
          )
        : [];

    return new SupaChatMessageHistory(id, messages);
  }

  async getMessages(): Promise<BaseMessage[]> {
    // console.log("SupaChatMessageHistory: getMessages", {
    //   messages: JSON.stringify(this.messages, null, 2),
    // });
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
    throw new Error("SupaChatMessageHistory: clear: unimplemented");
  }
}

export const action = async ({ request }: ActionArgs) => {
  const { id, messages } = await request.json();
  const { content: input } = messages[messages.length - 1];
  console.log({ id, input });

  const { stream, handlers } = LangChainStream();
  // const memory = new SupaConversationSummaryMemory({
  //   memoryKey: "chat_history",
  //   llm: new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 }),
  // });
  const memory = await SupaConversationSummaryMemory.fromId({
    id,
    memoryKey: "chat_history",
    llm: new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 }),
  });

  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0,
    maxRetries: 1,
    streaming: true,
  });
  const prompt =
    PromptTemplate.fromTemplate(`The following is a concise conversation between a human and an AI. The AI is laconic and concisely provides specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

  Current conversation:
  {chat_history}
  Human: {input}
  AI:`);
  const chain = new LLMChain({ llm: chat, prompt, memory, verbose: true });
  chain.call({ input }, [handlers]);
  return new StreamingTextResponse(stream);
};
