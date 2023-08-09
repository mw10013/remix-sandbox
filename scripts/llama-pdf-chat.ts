// @ts-ignore
import * as readline from "node:readline/promises";
// @ts-ignore
import { stdin as input, stdout as output } from "node:process";
import * as dotenv from "dotenv";
import { ContextChatEngine, VectorStoreIndex, storageContextFromDefaults } from "llamaindex";

dotenv.config();

async function main() {
  const storageContext = await storageContextFromDefaults({
    persistDir: `${__dirname}/llama-pdf-storage`,
  });
  const index = await VectorStoreIndex.init({
    storageContext: storageContext,
  });
  const retriever = index.asRetriever();
  retriever.similarityTopK = 5;
  const chatEngine = new ContextChatEngine({ retriever });
  const rl = readline.createInterface({ input, output });

  while (true) {
    const query = await rl.question("Query: ");
    const response = await chatEngine.chat(query);
    console.log(response.toString());
  }
}

main().catch(console.error);
