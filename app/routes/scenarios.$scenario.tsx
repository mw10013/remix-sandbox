import type { V2_MetaFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import remarkGfm from "remark-gfm";
import type { Options } from "react-markdown";
import ReactMarkdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";
import type { ButtonProps } from "~/components/ui/button";
import { Button } from "~/components/ui/button";
import type { UseChatHelpers } from "ai/react";
import { useChat } from "ai/react";
import { cn, nanoid } from "~/lib/utils";
import type { Message } from "ai";
import { PanelRightOpen } from "lucide-react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Label } from "~/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Separator } from "~/components/ui/separator";
import { useToast } from "~/components/ui/use-toast";
import {
  IconArrowDown,
  IconArrowElbow,
  IconOpenAI,
  IconUser,
} from "~/components/icons";
import { useInView } from "react-intersection-observer";
import { Textarea } from "~/components/ui/textarea";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "ContinueWell" },
    { name: "description", content: "ContinueWell Scenario" },
  ];
};

export function loader({ params }: LoaderArgs) {
  const scenario = scenarios.find((s) => s.dynamicSegment === params.scenario);
  if (!scenario) {
    throw new Error(`Scenario not found: ${params.scenario}`);
  }

  return json({
    systemContent: scenario.content,
  });
}


export default function Scenario() {
  const data = useLoaderData<typeof loader>();
  const [id, setId] = React.useState(nanoid());
  const [systemContent, setSystemContent] = React.useState(
    data.systemContent
  );
  const newChat = (systemContent: string) => {
    setId(nanoid());
    setSystemContent(systemContent);
  };
  const initialMessages = composeInitialMessages(systemContent);
  return (
    <main className="">
      <Chat id={id} initialMessages={initialMessages} />
      <SideSheet systemContent={systemContent} newChat={newChat} />
    </main>
  );
}

const scenarios = [
  {
    title: "Appointment",
    dynamicSegment: "appointment",
    label: "Appointment",
    content: `
You are a friendly AI support agent following up with a patient. Use the provided STATE MACHINE, delimited by ###STATE MACHINE###, to guide the conversation and internally maintain and update the provided NOTES, delimited by ###NOTES###, during the conversation. Be ready to show NOTES when asked.

###STATE MACHINE###
STATE MACHINE

- initial state: GREET
- state: GREET
  - action: say hello and ask patient if ready to begin call
  - transition: SYMPTOM
    - condition: patient is ready
  - transition: BYE
    - condition: patient is not ready
- state: SYMPTOM
  - action: ask how the patient is doing with knee pain
  - transition: POSSIBLE_ESCALATE
    - condition: patient not doing so well with knee pain
    - action: express sympathy
  - transition: REFERRAL_APPOINTMENT
    - condition: patient doing ok with knee pain
  - transition: ESCALATE
    - condition: patient is confused
- state: POSSIBLE_ESCALATE:
    - action: ask if patient would like to speak with an on-site provider
    - transition: ESCALATE
      - condition: patient wants to speak with an on-site provider
    - transition: REFERRAL_APPOINTMENT
      - condition: patient does not want to speak with an on-site provider
- state: REFERRAL_APPOINTMENT
  - action: tell the patient that the primary doctor recommends follow-up with the referral doctor.
  - transition: APPOINTMENT_OPTIONS
- state: APPOINTMENT_OPTIONS
  - action: show the appointment options and ask if any will work
  - transition: APPOINTMENT_SCHEDULED
    - condition: patient selects an option that matches
    - action: update NOTES with the selection as scheduled appointment.
  - transition: OTHER_APPOINTMENT_OPTIONS
    - condition: patient does not select an option
- state: OTHER_APPOINTMENT_OPTIONS
  - action: show the other appointment options and ask if any will work
  - transition: APPOINTMENT_SCHEDULED
    - condition: patient selects an option that matches
    - action: update NOTES with the selection as scheduled appointment.
  - transition: ESCALATE
    - condition: patient does not select an option or is confused
- state: PREFERRED_APPOINTMENT_OPTION
  - action: ask for a preferred appointment date and time so you can check with the referral doctor and callback later.
  - transition: BYE
    - condition: patient responds with preference
    - action: update NOTES with preference as preferred appointment.
  - transition: BYE
    - condition: patient has no preference
    - action: say you will follow-up on this at a later date
- state: APPOINTMENT_SCHEDULED
  - action: say what the scheduled appointment is
  - transition: BYE
- final state: ESCALATE
  - action: say you are escalating to onsite provider
- final state: BYE
  - action: say goodbye

###STATE MACHINE###

###NOTES###

NOTES

- patient name: Karen
- symptom: knee pain
- primary doctor: Dr. Patrick
- referral doctor: Dr. Robinson
  - appointment options
    - Monday at 9am
    - Tuesday at 10am
    - Wednesday at 11am
  - other appointment options
    - Thursday at 1pm
    - Friday at 2pm
  - scheduled appointment:

###NOTES###    
`,
  },
  {
    title: "original",
    dynamicSegment: "original",
    label: "Original",
    content: `
You are a friendly AI support agent following up with a patient. Use the provided STATE MACHINE, delimited by ###STATE MACHINE###, to guide the conversation and internally maintain and update the provided NOTES, delimited by ###NOTES###, during the conversation. Be ready to show NOTES when asked.

###STATE MACHINE###
STATE MACHINE

- initial state: GREET
- state: GREET
  - action: say hello and ask patient if ready to begin call
  - transition: SYMPTOM
    - condition: patient is ready
  - transition: BYE
    - condition: patient is not ready
- state: SYMPTOM
  - action: ask for rating on knee pain from 0-10
  - transition: REFERRAL
    - condition: patient response with rating
    - action: update NOTES with knee pain rating
  - transition: ESCALATE
    - condition: patient is confused
- state: REFERRAL
  - action: tell the patient that the primary doctor recommends follow-up with the referral doctor.
  - transition: APPOINTMENT_OPTIONS
- state: APPOINTMENT_OPTIONS
  - action: show the appointment options and ask if any will work
  - transition: APPOINTMENT_SCHEDULED
    - condition: patient selects an option that matches
    - action: update NOTES with the selection as scheduled appointment.
  - transition: OTHER_APPOINTMENT_OPTIONS
    - condition: patient does not select an option
- state: OTHER_APPOINTMENT_OPTIONS
  - action: show the other appointment options and ask if any will work
  - transition: APPOINTMENT_SCHEDULED
    - condition: patient selects an option that matches
    - action: update NOTES with the selection as scheduled appointment.
  - transition: ESCALATE
    - condition: patient does not select an option or is confused
- state: PREFERRED_APPOINTMENT_OPTION
  - action: ask for a preferred appointment date and time so you can check with the referral doctor and callback later.
  - transition: BYE
    - condition: patient responds with preference
    - action: update NOTES with preference as preferred appointment.
  - transition: BYE
    - condition: patient has no preference
    - action: say you will follow-up on this at a later date
- state: APPOINTMENT_SCHEDULED
  - action: say what the scheduled appointment is
  - transition: BYE
- final state: ESCALATE
  - action: say you are escalating to onsite provider
- final state: BYE
  - action: say goodbye

###STATE MACHINE###

###NOTES###

NOTES

- patient name: Karen
- symptom: knee pain
- primary doctor: Dr. Patrick
- referral doctor: Dr. Robinson
  - appointment options
    - Monday at 9am
    - Tuesday at 10am
    - Wednesday at 11am
  - other appointment options
    - Thursday at 1pm
    - Friday at 2pm
  - scheduled appointment:

###NOTES###    
`,
  },
  {
    title: "ER",
    dynamicSegment: "er",
    label: "ER",
    content: `You are a friendly chat bot following up with a patient. 

NOTES are delimited by ###NOTES###. Maintain and update the NOTES internally during the conversation. Be ready to show NOTES when asked.

NOTES

###NOTES###
- ER visit yesterday
###NOTES###

RULES are delimited by ###RULES###. 

###RULES###

[Rule: Greet]
Condition: No greeting noted in NOTES
Action: Greet, ask how they are feeling, and update NOTES

[Rule: Visit]
Condition: No follow-up on visit in NOTES
Action: Ask if any questions after visit and update NOTES

[Rule: Confusion]
Condition: The patient seems confused in the conversation context
Action: Offer to escalate to on-site provider

###RULES###

Steps for each turn of the conversation

- Update NOTES internally based on conversation context and RULES
- Ask one question that helps you satisfy the RULES applied to NOTES and the conversation context.`,
  },
  {
    title: "Pain",
    dynamicSegment: "pain",
    label: "Pain",
    content: `You are a friendly chat bot following up with a patient. 

NOTES are delimited by ###NOTES###. Maintain and update the NOTES internally during the conversation. Be ready to show NOTES when asked.

NOTES

###NOTES###
- knee pain
- treatment plan to apply antibiotic ointment
- pending action to make appointment with orthopedist
###NOTES###

RULES are delimited by ###RULES###. 

###RULES###

[Rule: Greet]
Condition: No greeting noted in NOTES
Action: Greet, ask how they are feeling, and update NOTES

[Rule: Pain]
Condition: No pain follow-up in NOTES
Action: Ask for pain rating and update NOTES

[Rule: New]
Condition: No follow-up on new symptoms or conditions in NOTES
Action: Ask about any new symptoms or conditions and update NOTES

[Rule: Action]
Condition: NOTES contains pending action with no follow-up on whether complete
Action: Ask for status and update NOTES

[Rule: Confusion]
Condition: The patient seems confused in the conversation context
Action: Offer to escalate to on-site provider

###RULES###

Steps for each turn of the conversation

- Update NOTES internally based on conversation context and RULES
- Ask one question that helps you satisfy the RULES applied to NOTES and the conversation context.`,
  },
];

function composeInitialMessages(systemContent: string): Message[] {
  return [
    {
      id: "0",
      role: "system",
      content: `${systemContent}`,
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

function SideSheet({
  systemContent,
  newChat,
}: {
  systemContent: string;
  newChat: (systemContent: string) => void;
}) {
  const systemTextAreaRef = React.useRef<HTMLTextAreaElement>(null);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed top-2 right-2">
          <PanelRightOpen className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[640px] sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Configure Scenario</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <Label htmlFor="systemTextArea">System</Label>
            <ContentsDropDown
              textAreaRef={systemTextAreaRef}
              contents={scenarios}
            />
          </div>
          <Textarea
            id="systemTextArea"
            ref={systemTextAreaRef}
            rows={30}
            defaultValue={systemContent}
          />
        </div>
        <SheetFooter className="mt-2">
          <SheetClose asChild>
            <Button
              variant="secondary"
              onClick={() => {
                newChat(systemTextAreaRef.current?.value ?? "");
              }}
            >
              Run
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export const MemoizedReactMarkdown: React.FC<Options> = React.memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);

export function ChatMessage({ message, ...props }: { message: Message }) {
  return (
    <div
      className={cn("group relative mb-4 flex items-start md:-ml-12")}
      {...props}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
          message.role === "user"
            ? "bg-background"
            : "bg-primary text-primary-foreground"
        )}
      >
        {message.role === "user" ? <IconUser /> : <IconOpenAI />}
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>;
            },
          }}
        >
          {message.content}
        </MemoizedReactMarkdown>
      </div>
    </div>
  );
}

export function ChatList({ messages }: { messages: Message[] }) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages
        .filter((m) => m.role === "assistant" || m.role === "user")
        .map((message, index) => (
          <div key={index}>
            <ChatMessage message={message} />
            {index < messages.length - 1 && (
              <Separator className="my-4 md:my-8" />
            )}
          </div>
        ))}
    </div>
  );
}

/**
 * Returns boolean indicating whether the user has scrolled to the bottom of the page.
 * Offset defaults to 1 to accomodate fractional scrolling.
 *
 * Note this only recalcs after a scroll event. If you are at the bottom of the
 * page and the page height changes, this will not detect the height change until a scroll event.
 *
 * Taken from [ai-chatbot](https://github.com/vercel-labs/ai-chatbot)
 */
export function useAtBottom(offset = 1) {
  const [isAtBottom, setIsAtBottom] = React.useState(false);

  // q: what is window.innerHeight?
  // a: The innerHeight property returns the height of a window's content area. This includes the area inside the browser window, as well as the area below the horizontal scroll bar if present.
  // q: what is window.scrollY?
  // a: The scrollY property returns the number of pixels that the document is currently scrolled vertically. This value is subpixel precise in modern browsers, meaning that it isn't necessarily a whole number. You can get the number of pixels the document is scrolled horizontally from the scrollX property.
  // q: what is document.body.offsetHeight?
  // a: The offsetHeight property returns the viewable height of an element in pixels, including padding, border and scrollbar, but not the margin.
  React.useEffect(() => {
    const handleScroll = () => {
      setIsAtBottom(
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - offset
      );
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [offset]);

  return isAtBottom;
}

/**
 * Returns a transparent 100px div that is scrolled to when the user is at the bottom of the page.
 *
 * Threshold is 1 to ensure the entire div is in view since the div also serves as padding.
 * @todo Multiple lines of text streamed rapidly can get ahead of the logic.
 */
export function ChatScrollAnchor() {
  const isAtBottom = useAtBottom();
  const { ref, entry, inView } = useInView({
    threshold: 1,
    // rootMargin: "0px 0px -20px 0px",
  });

  React.useEffect(() => {
    if (isAtBottom && !inView) {
      entry?.target.scrollIntoView({
        block: "start",
      });
    }
  }, [inView, entry, isAtBottom]);

  return <div ref={ref} className="h-[100px] w-full bg-transparent" />;
}

export function ButtonScrollToBottom({ className, ...props }: ButtonProps) {
  const isAtBottom = useAtBottom();

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "absolute right-4 top-1 z-10 bg-background transition-opacity duration-300 sm:right-8 md:top-2",
        isAtBottom ? "opacity-0" : "opacity-100",
        className
      )}
      onClick={() =>
        window.scrollTo({
          top: document.body.offsetHeight,
          behavior: "smooth",
        })
      }
      {...props}
    >
      <IconArrowDown />
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  );
}

export function ChatPanel({
  id,
  isLoading,
  append,
  input,
  setInput,
}: {
  id?: string;
} & Pick<UseChatHelpers, "append" | "isLoading" | "input" | "setInput">) {
  return (
    <div className="fixed inset-x-0 bottom-0 bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50%">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm
            onSubmit={async (value) => {
              await append({
                id,
                content: value,
                role: "user",
              });
            }}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export function useEnterSubmit(): {
  formRef: React.RefObject<HTMLFormElement>;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
} {
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      formRef.current?.requestSubmit();
      event.preventDefault();
    }
  };

  return { formRef, onKeyDown: handleKeyDown };
}

export interface PromptProps
  extends Pick<UseChatHelpers, "input" | "setInput"> {
  onSubmit: (value: string) => Promise<void>;
  isLoading: boolean;
}

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading,
}: PromptProps) {
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!input?.trim()) {
          return;
        }
        setInput("");
        await onSubmit(input);
      }}
      ref={formRef}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background pr-8 sm:rounded-md sm:border sm:pr-12">
        <TextareaAutosize
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message."
          spellCheck={false}
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
        />
        <div className="absolute right-0 top-4 sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-8 w-8 p-0"
                type="submit"
                size="icon"
                disabled={isLoading || input === ""}
              >
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  );
}

function Chat({
  id,
  initialMessages,
  className,
}: {
  id: string;
  initialMessages: Message[];
} & React.ComponentProps<"div">) {
  const { toast } = useToast();
  const { messages, append, isLoading, input, setInput } = useChat({
    api: "/api/scenario-messages",
    id,
    body: { id },
    initialMessages,
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: (
          <div
            dangerouslySetInnerHTML={{
              __html: error.message.replace(/\n/g, "<br>"),
            }}
          />
        ),
      });
    },
  });
  return (
    <>
      <div className={cn("pt-4 md:pt-10", className)}>
        <ChatList messages={messages} />
        <ChatScrollAnchor />
      </div>

      <ChatPanel
        id={id}
        isLoading={isLoading}
        append={append}
        input={input}
        setInput={setInput}
      />
    </>
  );
}
