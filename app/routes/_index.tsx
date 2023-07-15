import type { V2_MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { useChat } from "ai/react";
import { Input } from "~/components/ui/input";
import { nanoid } from "~/lib/utils";
import type { Message } from "ai";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Virtual Nurse" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const id = nanoid();
  return <Chat id={id} />;
}

const initialMessages: Message[] = [
  {
    id: "0",
    role: "system",
    content: `
You are a friendly virtual nurse following up with a patient. Analyze the Patient Profile using the Rules. Ask the patient a question that helps you update the  Patient Profile to satisfy the Rules. In your responses include the Updated Patient Profile in full along with your next question, which should be generated from the Updated Patient Profile and the Rules.

Rules
- if recent visit, find out current status
- if pain symptoms, find current rating from 0-10
- if symptoms, find any new symptoms
- if regimen, find compliance
- if actions, find completion
- for actions re: making appointments, offer to show contact info if available, but not for finding
- if problem with prescriptions, share status and confirm location
- if patient wants to change the pharmacy for a prescription, confirm before updating
- any questions
- if there is confusion or don't know how to proceed, offer to connect to on-call provider

Patient Profile
ER visit yesterday.
`,
  },
];

function Chat({ id }: { id: string }) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/vn-messages",
    id,
    body: { id },
    initialMessages,
  });
  return (
    <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
      {messages.map((m) => (
        <div key={m.id}>
          {m.role === "user"
            ? "User: "
            : m.role === "assistant"
            ? "AI: "
            : "System: "}
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
