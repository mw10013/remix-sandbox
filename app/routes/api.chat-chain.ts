import { type ActionArgs } from "@remix-run/node";
import { StreamingTextResponse, LangChainStream } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder
} from "langchain/prompts";

export const action = async ({ request }: ActionArgs) => {
  // [
  //   { role: 'user', content: "w'sup" },
  //   { role: 'assistant', content: 'Not much.' },
  //   { role: 'user', content: 'chill' },
  //   { role: 'assistant', content: 'OK.' },
  //   { role: 'user', content: 'peace' }
  // ]
  const { messages } = await request.json();
  console.log(messages);
  const historicalMessages = messages.slice(0, messages.length - 1);
  const { content: question } = messages[messages.length - 1];
  console.log({historicalMessages, question});

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

  prompt.formatMessages({ question }).then(console.log);

  const chain = new LLMChain({
    prompt,
    llm: chat,
  });
  chain.call({ question }, [handlers]).catch(console.error);
  return new StreamingTextResponse(stream);
};
