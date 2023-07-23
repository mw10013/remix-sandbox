import React from "react";
import remarkGfm from "remark-gfm";
import type { Options } from "react-markdown";
import ReactMarkdown from "react-markdown";
import type { V2_MetaFunction } from "@remix-run/node";
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
    { title: "Scenario" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [id, setId] = React.useState(nanoid());
  const [systemContent, setSystemContent] = React.useState(
    systemContents[0].content
  );
  const newChat = (systemContent: string) => {
    setId(nanoid());
    setSystemContent(systemContent);
  };
  const initialMessages = composeInitialMessages(systemContent);
  return (
    <div className="relative w-full h-full">
      <Chat id={id} initialMessages={initialMessages} />
      <SideSheet systemContent={systemContent} newChat={newChat} />
    </div>
  );
}

const systemContents = [
  {
    label: "Scenario 1",
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
    label: "Scenario 2",
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
              contents={systemContents}
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

export interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
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
          // remarkPlugins={[remarkGfm, remarkMath]}
          remarkPlugins={[remarkGfm]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>;
            },
            // code({ node, inline, className, children, ...props }) {
            //   if (children.length) {
            //     if (children[0] == '▍') {
            //       return (
            //         <span className="mt-1 animate-pulse cursor-default">▍</span>
            //       )
            //     }

            //     children[0] = (children[0] as string).replace('`▍`', '▍')
            //   }

            //   const match = /language-(\w+)/.exec(className || '')

            //   if (inline) {
            //     return (
            //       <code className={className} {...props}>
            //         {children}
            //       </code>
            //     )
            //   }

            //   return (
            //     <CodeBlock
            //       key={Math.random()}
            //       language={(match && match[1]) || ''}
            //       value={String(children).replace(/\n$/, '')}
            //       {...props}
            //     />
            //   )
            // }
          }}
        >
          {message.content}
        </MemoizedReactMarkdown>
        {/* <ChatMessageActions message={message} /> */}
      </div>
    </div>
  );
}

export interface ChatList {
  messages: Message[];
}

export function ChatList({ messages }: ChatList) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
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

export function useAtBottom(offset = 0) {
  const [isAtBottom, setIsAtBottom] = React.useState(false);

  // q: what is window.innerHeight?
  // a: The innerHeight property returns the height of a window's content area. This includes the area inside the browser window, as well as the area below the horizontal scroll bar if present.
  // q: what is window.scrollY?
  // a: The scrollY property returns the number of pixels that the document is currently scrolled vertically. This value is subpixel precise in modern browsers, meaning that it isn't necessarily a whole number. You can get the number of pixels the document is scrolled horizontally from the scrollX property.
  // q: what is document.body.offsetHeight?
  // a: The offsetHeight property returns the viewable height of an element in pixels, including padding, border and scrollbar, but not the margin.
  React.useEffect(() => {
    const handleScroll = () => {
      console.log({
        innerHeight: window.innerHeight,
        scrollY: window.scrollY,
        offsetHeight: document.body.offsetHeight,
        offset,
        innerPlusScroll: window.innerHeight + window.scrollY,
        offsetMinusOffset: document.body.offsetHeight - offset,
      });
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

interface ChatScrollAnchorProps {
  trackVisibility?: boolean;
}

export function ChatScrollAnchor({ trackVisibility }: ChatScrollAnchorProps) {
  const isAtBottom = useAtBottom();
  const { ref, entry, inView } = useInView({
    trackVisibility,
    delay: 100,
    rootMargin: "0px 0px -150px 0px",
  });

  React.useEffect(() => {
    if (isAtBottom && trackVisibility && !inView) {
      entry?.target.scrollIntoView({
        block: "start",
      });
    }
  }, [inView, entry, isAtBottom, trackVisibility]);

  return <div ref={ref} className="h-px w-full" />;
}

export function ButtonScrollToBottom({ className, ...props }: ButtonProps) {
  const isAtBottom = useAtBottom();

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "absolute right-4 top-1 z-10 bg-background transition-opacity duration-300 sm:right-8 md:top-2",
        // isAtBottom ? "opacity-0" : "opacity-100",
        "opacity-100",
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
      isAtBottom: {isAtBottom.toString()}
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  );
}

export interface ChatPanelProps
  extends Pick<
    UseChatHelpers,
    | "append"
    | "isLoading"
    | "reload"
    | "messages"
    | "stop"
    | "input"
    | "setInput"
  > {
  id?: string;
}

export function ChatPanel({
  id,
  isLoading,
  stop,
  append,
  reload,
  input,
  setInput,
  messages,
}: ChatPanelProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50%">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        {/* <div className="flex h-10 items-center justify-center">
          {isLoading ? (
            <Button
              variant="outline"
              onClick={() => stop()}
              className="bg-background"
            >
              <IconStop className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length > 0 && (
              <Button
                variant="outline"
                onClick={() => reload()}
                className="bg-background"
              >
                <IconRefresh className="mr-2" />
                Regenerate response
              </Button>
            )
          )}
        </div> */}
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
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/"
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "absolute left-0 top-4 h-8 w-8 rounded-full bg-background p-0 sm:left-4"
              )}
            >
              <IconPlus />
              <span className="sr-only">New Chat</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip> */}
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
  const {
    messages,
    append,
    reload,
    stop,
    isLoading,
    input,
    setInput,
    // handleInputChange,
    // handleSubmit,
  } = useChat({
    api: "/api/sn-messages",
    id,
    body: { id },
    initialMessages,
    initialInput: "Hello, I'm ready.",
    onResponse(response) {
      if (response.status === 401) {
        toast({
          variant: "destructive",
          title: "Unauthorized",
          description: response.statusText,
        });
      }
    },
  });
  return (
    <div className="w-full max-w-4xl mx-auto min-h-full p-6">
      <div className={cn("pb-[200px] pt-4 md:pt-10", className)}>
        <ChatList messages={messages} />
        <ChatScrollAnchor trackVisibility={isLoading} />
      </div>

      {/* <div className="col-span-2">
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
        ))} */}
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />
    </div>
  );
}
