import * as dotenv from "dotenv";
import * as path from "path";
import { ConsoleCallbackHandler } from "langchain/callbacks";
import { OpenAI } from "langchain/llms/openai";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

/**
 * https://js.langchain.com/docs/modules/callbacks/
 */
async function foo() {
  const llm = new OpenAI({
    temperature: 0,
  });

  await llm.call("1 + 1 =", {
    tags: ["example", "callbacks", "request"],
    callbacks: [new ConsoleCallbackHandler()],
  });
}

foo();
