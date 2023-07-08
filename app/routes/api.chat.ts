import { type ActionArgs } from "@remix-run/node";
// import { OpenAIStream, StreamingTextResponse } from "~/lib/ai-hacks";
import { AIMessage, HumanMessage } from "langchain/schema";
import type { Message } from "ai";
import { StreamingTextResponse, LangChainStream } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";

export const runtime = "edge";

export const action = async ({ request }: ActionArgs) => {
  const { messages } = await request.json();
  console.log(messages);
  const { content: question } = messages[messages.length - 1];
  console.log("chat: ", question);

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
          : new AIMessage(m.content)
      ),
      {},
      [handlers]
    )
    .catch(console.error);

  return new StreamingTextResponse(stream);

  //   const chat = new ChatOpenAI({
  //     modelName: "gpt-3.5-turbo",
  //     temperature: 0,
  //     maxRetries: 1,
  //     streaming: true,
  //   });

  //   const response = await chat.call(
  //     [new HumanMessage("Tell me a joke.")],
  //     undefined,
  //     [
  //       {
  //         handleLLMNewToken(token: string) {
  //           console.log({ token });
  //         },
  //       },
  //     ]
  //   );
};
