import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export function loader({ params }: LoaderArgs) {
  return json({
    scenario: params.scenario ?? "",
  });
}

export default function Scenario({ params }: LoaderArgs) {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Scenario: {data.scenario}</h1>
    </div>
  );
}
