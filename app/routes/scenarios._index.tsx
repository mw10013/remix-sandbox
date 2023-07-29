import { redirect } from "@remix-run/node";

export function loader() {
  return redirect("/scenarios/appointment");
}
