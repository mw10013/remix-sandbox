import { type ActionArgs } from "@remix-run/node";
import type { Message } from "ai";
import { StreamingTextResponse, LangChainStream } from "ai";
import { AIMessage, HumanMessage } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
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
  console.log({ historicalMessages, question });

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
    new MessagesPlaceholder("historicalMessages"),
    HumanMessagePromptTemplate.fromTemplate("{question}"),
  ]);

  prompt
    .formatMessages({
      question,
      historicalMessages: (historicalMessages as Message[]).map((m) =>
        m.role == "user"
          ? new HumanMessage(m.content)
          : new AIMessage(m.content)
      ),
    })
    .then(console.log);

  const chain = new LLMChain({
    prompt,
    llm: chat,
  });
  chain
    .call(
      {
        question,
        historicalMessages: (historicalMessages as Message[]).map((m) =>
          m.role == "user"
            ? new HumanMessage(m.content)
            : new AIMessage(m.content)
        ),
      },
      [handlers]
    )
    .catch(console.error);
  return new StreamingTextResponse(stream);
};
