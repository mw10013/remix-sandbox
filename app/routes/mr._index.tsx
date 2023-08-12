import { Card, CardHeader, CardTitle } from "~/components/ui/card";

export default function Route() {
  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Media Recorder</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
