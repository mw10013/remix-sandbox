import { Link, Outlet, useLocation } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { scenarios } from "./scenarios.$scenario";

export default function Scenarios() {
  return (
    <div>
      {/* <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur"> */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <MainNav />
        </div>
      </header>
      <Outlet />
    </div>
  );
}

function IconLogo(props: React.HTMLAttributes<SVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" {...props}>
      <rect width="256" height="256" fill="none" />
      <line
        x1="208"
        y1="128"
        x2="128"
        y2="208"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
      <line
        x1="192"
        y1="40"
        x2="40"
        y2="192"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
    </svg>
  );
}

export function MainNav() {
  const pathname = useLocation().pathname;

  return (
    <div className="mr-4 hidden md:flex">
      <Link to="/scenarios" className="mr-6 flex items-center space-x-2">
        <IconLogo className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">ContinueWell</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        {scenarios.map((scenario) => {
          return (
            <Link
              key={scenario.dynamicSegment}
              to={`/scenarios/${scenario.dynamicSegment}`}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith(`/scenarios/${scenario.dynamicSegment}`)
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              {scenario.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
