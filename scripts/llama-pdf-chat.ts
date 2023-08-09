import * as dotenv from "dotenv";
import { VectorStoreIndex, storageContextFromDefaults } from "llamaindex";

dotenv.config();

async function main() {
  const storageContext = await storageContextFromDefaults({
    persistDir: `${__dirname}/llama-pdf-storage`,
  });
  const loadedIndex = await VectorStoreIndex.init({
    storageContext: storageContext,
  });
  const loadedQueryEngine = loadedIndex.asQueryEngine();
  const loadedResponse = await loadedQueryEngine.query(
    "Summarize the stable-world principle"
  );
  console.log(loadedResponse.toString());
}

main().catch(console.error);
