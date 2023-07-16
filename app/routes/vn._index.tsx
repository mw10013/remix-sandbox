import type { V2_MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { useChat } from "ai/react";
import { Input } from "~/components/ui/input";
import { nanoid } from "~/lib/utils";
import type { Message } from "ai";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import React from "react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Virtual Nurse" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [systemMessageContent, setSystemMessageContent] = React.useState(
    systemMessageContentDefault
  );
  const [patientProfileMessageContent, setPatientProfileMessageContent] =
    React.useState(patientProfileMessageContentDefault);
  // const initialMessages = React.useMemo(() => composeInitialMessages(systemMessageContent), [systemMessageContent]);
  const initialMessages = composeInitialMessages(
    systemMessageContent,
    patientProfileMessageContent
  );
  const id = nanoid();
  return (
    <Chat
      id={id}
      initialMessages={initialMessages}
      systemMessageContent={systemMessageContent}
      setSystemMessageContent={setSystemMessageContent}
      patientProfileMessageContent={patientProfileMessageContent}
      setPatientProfileMessageContent={setPatientProfileMessageContent}
    />
  );
}

const systemMessageContentDefault = `You are a friendly virtual nurse following up with a patient. Analyze the Patient Profile using the Rules. Ask the patient only one question in a response that helps you update the  Patient Profile to satisfy the Rules. In your responses include the Updated Patient Profile in full along with your next question, which should be generated from the Updated Patient Profile and the Rules.

Rules
- if recent visit, find out current status
- if Patient Profile has any pain, find current rating from 0-10 for each pain symptom
- if Patient Profile has any symptoms, find any new symptoms
- if regimen in Patient Profile, find compliance
- if actions in Patient Profile, find completion
- for action regarding making appointments, offer to show contact info if available, but not for finding
- if problem with prescriptions, share status and confirm location
- if patient wants to change the pharmacy for a prescription, confirm before updating
- any questions
- if there is confusion or you don't know how to proceed, offer to connect to on-call provider`;

const patientProfileMessageContentDefault = `Visit: ER visit yesterday.
Symptoms: none
Pain: none
Regimen: none
Actions: none
Prescriptions: none`;

function composeInitialMessages(
  systemMessageContent: string,
  patientProfileMessageContent: string
): Message[] {
  return [
    {
      id: "0",
      role: "system",
      content: `${systemMessageContent}

Patient Profile
${patientProfileMessageContent}`,
    },
    {
      id: "1",
      role: "assistant",
      content:
        "Hello. This is the St. John's Riverside Hospital virtual nurse. Are you ready for your follow-up call?",
    },
  ];
}

function Chat({
  id,
  initialMessages,
  systemMessageContent,
  setSystemMessageContent,
  patientProfileMessageContent,
  setPatientProfileMessageContent,
}: {
  id: string;
  initialMessages: Message[];
  systemMessageContent: string;
  setSystemMessageContent: React.Dispatch<React.SetStateAction<string>>;
  patientProfileMessageContent: string;
  setPatientProfileMessageContent: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/vn-messages",
    id,
    body: { id },
    initialMessages,
    initialInput: "Hello, I'm ready.",
  });
  const systemTextAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const patientProfileTextAreaRef = React.useRef<HTMLTextAreaElement>(null);
  return (
    <div className="grid grid-cols-3 gap-6 min-h-full items-stretch p-6">
      <div className="col-span-2">
        {messages.map((m) => (
          <div key={m.id}>
            {m.role === "user"
              ? "User: "
              : m.role === "assistant"
              ? "AI: "
              : "System: "}
            {m.content.split("\n").map((line, i) =>
              i === 0 ? (
                <span key={i}>{line}</span>
              ) : line === "" ? (
                <React.Fragment key={i}>
                  <br />
                  <br />
                </React.Fragment>
              ) : (
                <div key={i}>{line}</div>
              )
            )}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
          <Input value={input} onChange={handleInputChange} />
          <Button type="submit">Send</Button>
        </form>
      </div>
      <div className="grid w-full gap-3 self-start">
        <Label htmlFor="systemTextArea">System</Label>
        <Textarea
          id="systemTextArea"
          ref={systemTextAreaRef}
          rows={15}
          defaultValue={systemMessageContent}
        />
        <Label htmlFor="patient-profile">Patient Profile</Label>
        <Textarea
          id="patient-profile"
          ref={patientProfileTextAreaRef}
          rows={10}
          defaultValue={patientProfileMessageContent}
        />
        <Button
          variant="secondary"
          onClick={() => {
            // alert(systemTextAreaRef.current?.value);
            setSystemMessageContent(systemTextAreaRef.current?.value ?? "");
            setPatientProfileMessageContent(
              patientProfileTextAreaRef.current?.value ?? ""
            );
          }}
        >
          Run
        </Button>
      </div>
    </div>
  );
}
