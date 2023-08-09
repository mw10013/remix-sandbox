import {
  PDFReader,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const reader = new PDFReader();
  const documents = await reader.loadData(`${__dirname}/basb.pdf`);

  // Had to delete llama-pdf-storage to prevent Error: Cannot initialize VectorStoreIndex with both nodes and indexStruct
  const storageContext = await storageContextFromDefaults({
    persistDir: `${__dirname}/llama-pdf-storage`,
  });
  const index = await VectorStoreIndex.fromDocuments(documents, {
    storageContext,
  });

  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("Summarize");
  console.log(response.toString());
}

main().catch(console.error);
