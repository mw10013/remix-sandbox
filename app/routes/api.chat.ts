import { json, type ActionArgs } from "@remix-run/node";

export const action = async ({ request }: ActionArgs) => {
  const data = await request.json();
  console.log(data);
  return json({ message: `server hello world: ${new Date()}` });

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
