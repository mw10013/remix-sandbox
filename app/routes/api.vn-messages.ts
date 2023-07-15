import { type ActionArgs } from "@remix-run/node";
import { AIMessage, HumanMessage, SystemMessage } from "langchain/schema";
import type { Message } from "ai";
import { StreamingTextResponse, LangChainStream } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";

export const action = async ({ request }: ActionArgs) => {
  const { messages } = await request.json();
  //   console.log(messages);
  //   const { content: question } = messages[messages.length - 1];
  //   console.log("chat-messages: ", question);

  const { stream, handlers } = LangChainStream();
  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0,
    maxRetries: 1,
    streaming: true,
  });
  chat
    .call(
      (messages as Message[]).map((m) =>
        m.role == "user"
          ? new HumanMessage(m.content)
          : m.role == "assistant"
          ? new AIMessage(m.content)
          : new SystemMessage(m.content)
      ),
      {},
      [handlers]
    )
    .catch(console.error);
  return new StreamingTextResponse(stream);
};
