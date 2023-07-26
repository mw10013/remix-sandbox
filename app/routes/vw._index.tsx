import React from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";

export function useAtBottom(offset = 1) {
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

export default function Route() {
  const [count, setCount] = React.useState(11);
  const isAtBottom = useAtBottom();
  const { ref, entry, inView } = useInView({
    rootMargin: "0px 0px -200px 0px",
  });

  React.useEffect(() => {
    console.log({ isAtBottom, inView, entry });
    if (isAtBottom && !inView) {
      entry?.target.scrollIntoView({ block: "start" });
    }
  }, [inView, entry, isAtBottom]);

  return (
    <div className="max-w-md mx-auto bg-slate-100 flex flex-col gap-2 p-8 pb-[200px]">
      <Card className="fixed top-3 right-3 w-48">
        <CardContent>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            <span className="font-bold">isAtBottom:</span> {isAtBottom + ""}
            <br />
            <span className="font-bold">inView:</span> {inView + ""}
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
      <div ref={ref} className="h-0 w-full bg-orange-400" />
    </div>
  );
}
