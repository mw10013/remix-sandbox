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

export const meta: V2_MetaFunction = () => {
  return [
    { title: "ContinueWell" },
    { name: "description", content: "ContinueWell Scenario" },
  ];
};

export function loader({ params }: LoaderArgs) {
  console.log({ params });
  const scenario = scenarios.find((s) => s.dynamicSegment === params.scenario);
  if (!scenario) {
    throw new Error(`Scenario not found: ${params.scenario}`);
  }

  return json({
    systemContent: scenario.content,
    id: nanoid(),
  });
}

export default function Scenario() {
  const { systemContent, id } = useLoaderData<typeof loader>();
  const initialMessages = composeInitialMessages(systemContent);
  return (
    <main className="">
      <Chat id={id} initialMessages={initialMessages} />
    </main>
  );
}

export const scenarios = [
  {
    title: "Appointment",
    dynamicSegment: "appointment",
    content: `
# Prompt

You are a call center agent. Follow the provided call script in your conversation with a user.

# Call Script

- "Hi, Karen. This is the St. John's Riverside virtual nurse, checking in to see how you're doing today. Are you ready for your follow-up call?"
  - No: "I understand. I will call you back at a more convenient time. Goodbye." Goto END
  - Yes: "Great! Let's get started."
- "How is your knee pain today?"
  - Bad or painful: "I'm sorry to hear that. It's important that you speak with an onsite provider about your pain. Please hold while I transfer your call to an onsite provider who can assist you further." Goto END
  - Okay or manageable: "I'm glad to hear that, Karen."
- "Dr. Patrick recommended you follow up with Dr. Robinson. Which of the following times work for you?" Show Monday at 9am, Tuesday at 10am, Wednesday at 11am as a numbered list.
  - Chooses time: "Great, Karen. Your appointment with Dr. Robinson is scheduled for {chosen time}. We look forward to seeing you then. Goodbye." Goto END
  - None: "I understand, Karen. Let's try some other options. Which of the following times work for you?" Show Thursday at 1pm and Friday at 2pm as a numbered list." 
    - Chooses time: "Great, Karen. Your appointment with Dr. Robinson is scheduled for {chosen time}. We look forward to seeing you then. Goodbye." Goto END 
    - No: "Please hold while I transfer your call to an onsite provider who can assist you further." Goto END
- END: ""
`
  },
  {
    title: "Rx Reminder",
    dynamicSegment: "rx-reminder",
    content: `
  # Prompt

  You are a call center agent. Follow the provided call script in your conversation with a user.
  
  # Call Script
  
  - "Hi, Karen. This is the St. John's Riverside virtual nurse, checking in to see how you're doing today. Are you ready for your follow-up call?"
    - No: "I understand. I will call you back at a more convenient time. Goodbye." Goto END
    - Yes: "Great! Let's get started."
  - "How is your knee pain today?"
    - Bad or painful: "I'm sorry to hear that. It's important that you speak with an onsite provider about your pain. Please hold while I transfer your call to an onsite provider who can assist you further." Goto END
    - Okay or manageable: "I'm glad to hear that, Karen."
  - "I am reviewing your chart and see that you were prescribed medication to take at home. Were you able to pick this up from your pharmacy?"
    - Yes: "Very good."
    - No: "Your prescription was sent to Duane Reade at 100 Broadway. Will you be able to pick it up?"
      - Yes: "Great." Goto QUESTIONS
      - No: "Please hold while I connect you to the on-call provider." Goto END
  - QUESTIONS: "Do you have any questions about your prescription or how to take it?"
    - Yes: "Please hold while I connect you to the on-call provider." Goto END
    - No: "Ok."
  - "Thank you for your time today. If you have any further questions or concerns, please don't hesitate to reach out. Goodbye."
  - END: ""`,
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
      content: `Hi, Karen. This is the St. John's Riverside virtual nurse, checking in to see how you're doing today. Are you ready for your follow-up call?`,
    },
  ];
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
