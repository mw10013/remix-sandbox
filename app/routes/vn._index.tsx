import type { V2_MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { useChat } from "ai/react";
import { Input } from "~/components/ui/input";
import { nanoid } from "~/lib/utils";
import type { Message } from "ai";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import React from "react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Virtual Nurse" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [systemContent, setSystemContent] = React.useState(
    systemContents[0].content
  );
  const [patientProfileContent, setPatientProfileContent] = React.useState(
    patientProfileContents[0].content
  );
  const initialMessages = composeInitialMessages(
    systemContent,
    patientProfileContent
  );
  const id = nanoid();
  return (
    <Chat
      id={id}
      initialMessages={initialMessages}
      systemContent={systemContent}
      setSystemContent={setSystemContent}
      patientProfileContent={patientProfileContent}
      setPatientProfileContent={setPatientProfileContent}
    />
  );
}

const systemContents = [
  {
    label: "Basic",
    content: `You are a friendly virtual nurse following up with a patient. Analyze the Patient Profile using the Rules. Ask the patient only one question in a response that helps you update the  Patient Profile to satisfy the Rules. In your responses include the Updated Patient Profile in full along with your next question, which should be generated from the Updated Patient Profile and the Rules.

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
- if there is confusion or you don't know how to proceed, offer to connect to on-call provider`,
  },
  {
    label: "Simple",
    content: `You are a friendly virtual nurse following up with a patient. Analyze the Patient Profile using the Rules. Ask the patient a question that helps you update the  Patient Profile to satisfy the Rules. In your responses include the Updated Patient Profile in full along with your next question, which should be generated from the Updated Patient Profile and the Rules.

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
- if there is confusion or don't know how to proceed, offer to connect to on-call provider`,
  },
];

const patientProfileContents = [
  {
    label: "Profile 1",
    content: `Visit: ER visit yesterday.
Symptoms: none
Pain: none
Regimen: none
Actions: none
Prescriptions: none`,
  },
  {
    label: "Profile 2",
    content: `Symptoms: knee pain
Regimen: apply prescribed antibiotic ointment
Actions: make appointment with orthopedist (contact: Mr. Ortho, 111-222-3333)`,
  },
  {
    label: "Profile 3",
    content: `Actions: Follow up with Dr Nelson (contact: 111-222-3333) re: blood pressure
Prescriptions: Antibiotic (Status: electronically sent this morning.
Pharmacy: CVS at 2290 central park ave.`,
  },
  {
    label: "Profile 4",
    content: `Symptoms: recurrent episodes of lightheadedness (Status: severe. When: yesterday)
Actions: find primary care doctor or cardiologist to follow-up with
ER visit yesterday`,
  },
  {
    label: "Simple Profile 1",
    content: `Visit: ER visit yesterday`,
  },
];

function composeInitialMessages(
  systemContent: string,
  patientProfileContent: string
): Message[] {
  return [
    {
      id: "0",
      role: "system",
      content: `${systemContent}

Patient Profile
${patientProfileContent}
`,
    },
    {
      id: "1",
      role: "assistant",
      content: `Hello. This is the St. John's Riverside Hospital virtual nurse. Are you ready for your follow-up call?`,
    },
  ];
}

function ContentsDropDown({
  textAreaRef,
  contents,
}: {
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  contents: { label: string; content: string }[];
}) {
  const handler = (content: string) => () => {
    if (textAreaRef.current) {
      textAreaRef.current.value = content;
      textAreaRef.current.focus();
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {contents.map((c) => (
          <DropdownMenuItem key={c.label} onClick={handler(c.content)}>
            {c.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Chat({
  id,
  initialMessages,
  systemContent,
  setSystemContent,
  patientProfileContent,
  setPatientProfileContent,
}: {
  id: string;
  initialMessages: Message[];
  systemContent: string;
  setSystemContent: React.Dispatch<React.SetStateAction<string>>;
  patientProfileContent: string;
  setPatientProfileContent: React.Dispatch<React.SetStateAction<string>>;
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
                <React.Fragment key={i}>
                  <span>{line}</span>
                  <br />
                </React.Fragment>
              ) : line === "" ? (
                <br key={i} />
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
      <div className="grid w-full gap-1 self-start">
        <div className="flex justify-between items-baseline">
          <Label htmlFor="systemTextArea">System</Label>
          <ContentsDropDown
            textAreaRef={systemTextAreaRef}
            contents={systemContents}
          />
        </div>
        <Textarea
          id="systemTextArea"
          ref={systemTextAreaRef}
          rows={15}
          defaultValue={systemContent}
        />
        <div className="flex justify-between items-baseline">
          <Label htmlFor="patientProfileTextArea">Patient Profile</Label>
          <ContentsDropDown
            textAreaRef={patientProfileTextAreaRef}
            contents={patientProfileContents}
          />
        </div>
        <Textarea
          id="patientProfileTextArea"
          ref={patientProfileTextAreaRef}
          rows={10}
          defaultValue={patientProfileContent}
        />
        <Button
          variant="secondary"
          onClick={() => {
            setSystemContent(systemTextAreaRef.current?.value ?? "");
            setPatientProfileContent(
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
