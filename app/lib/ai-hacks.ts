import { createEventStreamTransformer, trimStartOfStreamHelper } from "ai";
import { ReadableStream as PolyfillReadableStream } from "web-streams-polyfill";
import { createReadableStreamWrapper } from "@mattiasbuelens/web-streams-adapter";

// https://github.com/vercel-labs/ai/issues/199

// @ts-expect-error bad types
const toPolyfillReadable = createReadableStreamWrapper(PolyfillReadableStream);
const toNativeReadable = createReadableStreamWrapper(ReadableStream);

export class StreamingTextResponse extends Response {
  constructor(res: ReadableStream, init?: ResponseInit) {
    const headers: HeadersInit = {
      "Content-Type": "text/plain; charset=utf-8",
      ...init?.headers,
    };
    super(res, { ...init, status: 200, headers });
    this.getRequestHeaders();
  }

  getRequestHeaders() {
    return addRawHeaders(this.headers);
  }
}

function addRawHeaders(headers: Headers) {
  // @ts-expect-error shame on me
  headers.raw = function () {
    const rawHeaders = {};
    const headerEntries = headers.entries();
    for (const [key, value] of headerEntries) {
      const headerKey = key.toLowerCase();
      if (rawHeaders.hasOwnProperty(headerKey)) {
        // @ts-expect-error shame on me
        rawHeaders[headerKey].push(value);
      } else {
        // @ts-expect-error shame on me
        rawHeaders[headerKey] = [value];
      }
    }
    return rawHeaders;
  };
  return headers;
}

function parseOpenAIStream(): (data: string) => string | void {
  const trimStartOfStream = trimStartOfStreamHelper();
  return (data) => {
    // TODO: Needs a type
    const json = JSON.parse(data);

    // this can be used for either chat or completion models
    const text = trimStartOfStream(
      json.choices[0]?.delta?.content ?? json.choices[0]?.text ?? ""
    );

    return text;
  };
}

export function OpenAIStream(response: Response): ReadableStream<any> {
  if (!response.ok || !response.body) {
    throw new Error(
      `Failed to convert the response to stream. Received status code: ${response.status}.`
    );
  }

  const responseBodyStream = toPolyfillReadable(response.body);

  // @ts-expect-error
  return toNativeReadable(
    // @ts-expect-error
    responseBodyStream.pipeThrough(
      createEventStreamTransformer(parseOpenAIStream())
    )
  );
}
