import { FaissStore } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createConversationalRetrievalAgent, createRetrieverTool } from "langchain/agents/toolkits";
import * as dotenv from "dotenv";
import { ChatOpenAI } from "langchain/chat_models/openai";

dotenv.config();

async function main() {
  const loader = new TextLoader(`${__dirname}/abramov.txt`);
  const docs = await loader.load();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
  });

  const texts = await splitter.splitDocuments(docs);
  console.log({texts})

  const vectorStore = await FaissStore.fromDocuments(
    texts,
    new OpenAIEmbeddings()
  );

  await vectorStore.save(`${__dirname}/abramov-faiss`);

  const retriever = vectorStore.asRetriever();
  const tool = createRetrieverTool(retriever, {
    name: "search_abramov_text",
    description: "Searches and returns documents regarding the abramov text.",
  });

  const model = new ChatOpenAI({
    temperature: 0,
  });
  
  const executor = await createConversationalRetrievalAgent(model, [tool], {
    verbose: true,
  });

  const result = await executor.call({
    input: "Hi, I'm Bob!"
  });
  
  console.log(result);
  
  /*
    {
      output: 'Hello Bob! How can I assist you today?',
      intermediateSteps: []
    }
  */
  
  const result2 = await executor.call({
    input: "What's my name?"
  });
  
  console.log(result2);
  
  /*
    { output: 'Your name is Bob.', intermediateSteps: [] }
  */
  
  const result3 = await executor.call({
    input: "Summarize the abramov text"
  });
  
  console.log(result3);
  
  /*
    {
      output: "In the most recent state of the union, President Biden mentioned Ketanji Brown Jackson. He nominated her as a Circuit Court of Appeals judge and described her as one of the nation's top legal minds who will continue Justice Breyer's legacy of excellence. He mentioned that she has received a broad range of support, including from the Fraternal Order of Police and former judges appointed by Democrats and Republicans.",
      intermediateSteps: [
        {...}
      ]
    }
  */
  
  const result4 = await executor.call({
    input: "Where did he work?"
  });
  
  console.log(result4);
  
  /*
    {
      output: 'President Biden nominated Ketanji Brown Jackson four days before the most recent state of the union address.',
      intermediateSteps: []
    }
  */
}

main().catch(console.error);
