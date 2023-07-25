import React from "react";
import { useInView } from "react-intersection-observer";
import { IconArrowDown } from "~/components/icons";
import type { ButtonProps } from "~/components/ui/button";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export default function Route() {
  const [count, setCount] = React.useState(12);
  const isAtBottom = useAtBottom();
  return (
    <div className="max-w-md mx-auto bg-slate-100 flex flex-col gap-2">
      <Card className="fixed top-2 right-2">
        <CardContent>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            <span className="font-bold">isAtBottom:</span> {isAtBottom + ""}
            <br />
            <span className="font-bold">Count:</span> {count}
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => setCount((c) => c + 1)}>
            Increment
          </Button>
        </CardFooter>
      </Card>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="p-4 bg-purple-300">
          {i}
        </div>
      ))}
    </div>
  );
}

export function useAtBottom(offset = 1) {
  // default is 1 to work accomodate fractional scrolling
  const [isAtBottom, setIsAtBottom] = React.useState(false);

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

export function ChatScrollAnchor({
  trackVisibility,
}: {
  trackVisibility?: boolean;
}) {
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
