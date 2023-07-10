import type { V2_MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { useChat } from "ai/react";
import { Input } from "~/components/ui/input";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Remix Sandbox" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat-chain",
  });
  return (
    <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
      {messages.map((m) => (
        <div key={m.id}>
          {m.role === "user" ? "User: " : "AI: "}
          {m.content}
        </div>
      ))}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <Input value={input} onChange={handleInputChange} />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
