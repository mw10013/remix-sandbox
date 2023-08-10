import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { FaissStore } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
  createConversationalRetrievalAgent,
  createRetrieverTool,
} from "langchain/agents/toolkits";
import { ChatOpenAI } from "langchain/chat_models/openai";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const vectorStore = await FaissStore.load(
    `${__dirname}/abramov-faiss`,
    new OpenAIEmbeddings()
  );

  const retriever = vectorStore.asRetriever();
  const tool = createRetrieverTool(retriever, {
    name: "search_abramov_text",
    description: "Searches and returns documents regarding the abramov text.",
  });

  const model = new ChatOpenAI({
    temperature: 0,
  });

  const executor = await createConversationalRetrievalAgent(model, [tool], {
    // verbose: true,
  });

  const rl = readline.createInterface({ input, output });

  while (true) {
    const input = await rl.question("QUERY: ");
    const result = await executor.call({
      input,
    });
    console.log(result.output);
  }
}

main().catch(console.error);
