import { type ActionArgs } from "@remix-run/node";
// import type { Message } from "ai";
import { StreamingTextResponse, LangChainStream } from "ai";
// import { AIMessage, HumanMessage } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from "langchain/prompts";
import { BufferMemory } from "langchain/memory";
import type {
  BaseMessage} from "langchain/schema";
import {
  BaseListChatMessageHistory,
} from "langchain/schema";

export class SupaChatMessageHistory extends BaseListChatMessageHistory {
  lc_namespace = ["langchain", "stores", "message", "in_memory"];

  private messages: BaseMessage[] = [];

  constructor(messages?: BaseMessage[]) {
    super(...arguments);
    this.messages = messages ?? [];
  }

  async getMessages(): Promise<BaseMessage[]> {
    console.log("SupaChatMessageHistory: getMessages", {
      messages: this.messages,
    });
    return this.messages;
  }

  async addMessage(message: BaseMessage) {
    console.log("SupaChatMessageHistory: addMessage", { message });
    this.messages.push(message);
  }

  async clear() {
    console.log("SupaChatMessageHistory: clear");
    this.messages = [];
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
  const { messages } = await request.json();
  const { content: input } = messages[messages.length - 1];
  console.log({ input });

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
      chatHistory: new SupaChatMessageHistory(),
    }),
    prompt,
    llm: chat,
  });
  chain.call({ input }, [handlers]);

  return new StreamingTextResponse(stream);
};
