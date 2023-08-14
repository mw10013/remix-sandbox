import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";

export default function Route() {
  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Media Recorder</CardTitle>
          <CardDescription>Audio Only</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          {/* <p>Card Footer</p> */}
        </CardFooter>
      </Card>
    </div>
  );
}
