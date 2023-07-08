import type { V2_MetaFunction } from "@remix-run/node";
// import { useFetcher } from "@remix-run/react";
// import { Button } from "~/components/ui/button";
import { useChat } from "ai/react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Remix Sandbox" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  // const fetcher = useFetcher();
  // console.log({ data: fetcher.data, json: fetcher.json });
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
      {messages.map((m) => (
        <div key={m.id}>
          {m.role === "user" ? "User: " : "AI: "}
          {m.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <label>
          Say something...
          <input
            className="fixed w-full max-w-md bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2"
            value={input}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Send</button>
      </form>
    </div>
    // <div>
    //   <h1 className="text-gray-500 text-2xl">Remix Sandbox</h1>
    //   <div>Data: {JSON.stringify(fetcher.data, null, 2)}</div>
    //   <div>
    //     <Button
    //       onClick={(e) => {
    //         fetcher.submit(
    //           {
    //             messages: [
    //               { role: "system", content: "You are a helpful assistant." },
    //               { role: "user", content: "Hello!" },
    //             ],
    //           },
    //           {
    //             method: "POST",
    //             action: "/api/chat",
    //             encType: "application/json",
    //             replace: true,
    //           }
    //         );
    //       }}
    //     >
    //       Click me
    //     </Button>
    //   </div>
    // </div>
  );
}
