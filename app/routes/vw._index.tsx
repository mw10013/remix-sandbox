import React from "react";
import { useInView } from "react-intersection-observer";
import { IconArrowDown } from "~/components/icons";
import { Button, ButtonProps } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

export default function Route() {
  const [count, setCount] = React.useState(10);
  const isAtBottom = useAtBottom();
  return (
    <div className="max-w-md mx-auto bg-slate-100 flex flex-col gap-2">
      <Card className="fixed top-2 right-2">
        <CardContent>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            <span className="font-bold">isAtBottom:</span> {isAtBottom + ""}<br />
            <span className="font-bold">Count:</span> {count}
          </p>
        </CardContent>
        <CardFooter>
            <Button
                variant="outline"
                onClick={() => setCount((c) => c + 1)}
            >
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
  const [isAtBottom, setIsAtBottom] = React.useState(false);

  // q: what is window.innerHeight?
  // a: The innerHeight property returns the height of a window's content area. This includes the area inside the browser window, as well as the area below the horizontal scroll bar if present.
  // q: what is window.scrollY?
  // a: The scrollY property returns the number of pixels that the document is currently scrolled vertically. This value is subpixel precise in modern browsers, meaning that it isn't necessarily a whole number. You can get the number of pixels the document is scrolled horizontally from the scrollX property.
  // q: what is document.body.offsetHeight?
  // a: The offsetHeight property returns the viewable height of an element in pixels, including padding, border and scrollbar, but not the margin.
  React.useEffect(() => {
    const handleScroll = () => {
      // console.log({
      //   innerPlusScroll: window.innerHeight + window.scrollY,
      //   offsetMinusOffset: document.body.offsetHeight - offset,
      //   isAtBottom:
      //     window.innerHeight + window.scrollY >=
      //     document.body.offsetHeight - offset,
      // });
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
