import { type ActionArgs } from "@remix-run/node";
import { StreamingTextResponse, LangChainStream } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";

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
      "You are a laconic assistant that responds concisely"
    ),
    HumanMessagePromptTemplate.fromTemplate("{question}"),
  ]);

  const chain = new LLMChain({
    prompt,
    llm: chat,
  });
  chain.call({ question }, [handlers]).catch(console.error);
  return new StreamingTextResponse(stream);
};
