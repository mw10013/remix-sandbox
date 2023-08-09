import {
  Document,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const document = new Document({
    text: `
- Stable-World Principle
  - Complex algorithms work best in well-defined, stable situations where large amounts of data are available. Human intenlligence has evolved to deal with uncertainty, independent of whether big or small data are available.`,
  });

  const storageContext = await storageContextFromDefaults({
    persistDir: `${__dirname}/llama-pdf-storage`,
  });
  const index = await VectorStoreIndex.fromDocuments([document], {
    storageContext,
  });

  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "Summarize the stable-world principle"
  );

  console.log(response.toString());
}

main().catch(console.error);
