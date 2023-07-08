import { type ActionArgs } from "@remix-run/node";
import type { CreateEmbeddingResponse} from "openai-edge";
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "~/lib/ai-hacks";
import GPT3Tokenizer from "gpt3-tokenizer";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "types/database";

export const runtime = "edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const action = async ({ request }: ActionArgs) => {
  const { messages } = await request.json();
  console.log(messages);
  const { content: question } = messages[messages.length - 1];
  console.log("chat: ", question);
  const sanitizedQuestion = question.trim();

  const embeddingResponse = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: sanitizedQuestion.replaceAll("\n", " "),
  });

  if (embeddingResponse.status !== 200) {
    console.log({ embeddingResponse });
    throw new Error("Failed to create embedding for question");
  }

  const {
    data: [{ embedding }],
  }: CreateEmbeddingResponse = await embeddingResponse.json();

  const supabaseClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
  const { error: matchError, data: docs } = await supabaseClient.rpc(
    "match_documents",
    {
      query_embedding: embedding as unknown as string,
      match_threshold: 0.8,
      match_count: 10,
    }
  );

  if (matchError) {
    console.log({ matchError });
    throw new Error("Error matching question to documents");
  }
  console.log({ docsCount: docs.length });

  const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
  let tokenCount = 0;
  let contextText = "";

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const content = doc.content;
    const encoded = tokenizer.encode(content);
    tokenCount += encoded.text.length;

    if (tokenCount >= 1500) {
      break;
    }

    contextText += `${content.trim()}\n---\n`;
  }
  console.log({ tokenCount });

  const prompt = `You are a researcher. Given the following sections, 
  answer the question using only that information.
  If you are unsure, say "Sorry, I don't know how to help with that."

  Context sections:
  ${contextText}

  Question: """
  ${sanitizedQuestion}
  """
  `;
  console.log({ prompt });

  const response = await openai.createCompletion({
    model: "text-ada-001",
    prompt,
    max_tokens: 450,
    temperature: 0,
    stream: true,
  });

  if (!response.ok) {
    const error = await response.json();
    console.log({ error });
    throw new Error("Failed to generate completion");
  }

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);

  //   const response = await openai.createChatCompletion({
  //     model: "gpt-3.5-turbo",
  //     messages,
  //     stream: true,
  //   });
  //   const stream = OpenAIStream(response);
  //   return new StreamingTextResponse(stream);

  // const { messages, transcriptId } = z
  //     .object({
  //         messages: z.array(
  //             z
  //                 .object({
  //                     content: z.string(),
  //                     role: z.union([z.literal('user'), z.literal('system'), z.literal('assistant')]),
  //                 })
  //                 .passthrough(),
  //         ),
  //         transcriptId: z.string(),
  //     })
  //     .parse(await request.json());

  // // Load transcript set from Redis, turn it into a string
  // const transcriptArray = await transcriptQueries.getTranscriptArray(redisClient, { transcriptKey: transcriptId });
  // const transcript = transcriptArray;
  // const prompt = `<my prompt>`;
  // const content = prompt.replace('{transcript}', constrainLinesToTokenLimit(transcript, prompt, 6000).join('\n'));

  // const newMessages = [
  //     {
  //         role: 'system',
  //         content,
  //     },
  //     ...messages,
  // ] as const;

  // const response = await openai.createChatCompletion({
  //     // model: 'gpt-3.5-turbo-16k',
  //     model: 'gpt-4',
  //     // @ts-expect-error
  //     messages: newMessages,
  //     stream: true,
  // });
  // const stream = OpenAIStream(response);

  // return new StreamingTextResponse(stream);
};
