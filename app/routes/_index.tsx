import type { V2_MetaFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Remix Sandbox" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const fetcher = useFetcher();
  console.log({ data: fetcher.data, json: fetcher.json });
  return (
    <div>
      <h1 className="text-gray-500 text-2xl">Remix Sandbox</h1>
      <div>Data: {JSON.stringify(fetcher.data, null, 2)}</div>
      <div>
        <Button
          onClick={(e) => {
            fetcher.submit(
              { prompt: `client hello world: ${new Date()}` },
              {
                method: "POST",
                action: "/api/chat",
                encType: "application/json",
                replace: true,
              }
            );
            // alert("Hello World");
          }}
        >
          Click me
        </Button>
      </div>
      {/* <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul> */}
    </div>
  );
}
