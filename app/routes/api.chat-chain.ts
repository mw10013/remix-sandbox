import { type ActionArgs } from "@remix-run/node";
import { AIMessage, HumanMessage } from "langchain/schema";
import type { Message } from "ai";
import { StreamingTextResponse, LangChainStream } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts";

type T = ChatOpenAI["CallOptions"];

export const action = async ({ request }: ActionArgs) => {
  const { messages } = await request.json();
  console.log(messages);
  const { content: question } = messages[messages.length - 1];
  console.log("chat-chain: ", question);

  const { stream, handlers } = LangChainStream();
  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0,
    maxRetries: 1,
    streaming: true,
  });

  const prompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      "You are a helpful assistant that responds in the language of the king james version of the bible."
    ),
    HumanMessagePromptTemplate.fromTemplate("{text}"),
  ]);

  const chain = new LLMChain({
    prompt,
    llm: chat,
  });
  chain
    .call({text: question}, [handlers])
    .catch(console.error);

  // chat
  //   .call(
  //     (messages as Message[]).map((m) =>
  //       m.role == "user"
  //         ? new HumanMessage(m.content)
  //         : new AIMessage(m.content)
  //     ),
  //     {},
  //     [handlers]
  //   )
  //   .catch(console.error);
  return new StreamingTextResponse(stream);
};
