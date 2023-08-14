import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type State = "initializing" | "ready" | "recording" | "error";

function useMediaRecorder() {
  const mediaRecorder = React.useRef<MediaRecorder | null>(null);
  const mediaStream = React.useRef<MediaStream | null>(null);
  const mediaChunks = React.useRef<Blob[]>([]);
  const [state, setState] = React.useState<State>("initializing");
  const [mediaBlobUrl, setMediaBlobUrl] = React.useState<string | undefined>(
    undefined
  );

  React.useEffect(() => {
    async function effect() {
      const stream = await window.navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = ({ data }: BlobEvent) => {
        mediaChunks.current.push(data);
      };
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(mediaChunks.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        setMediaBlobUrl(url);
        mediaChunks.current = [];
        setState("ready");
      };
      setState("ready");
    }
    effect();
  }, [mediaStream]);

  const record = () => {
    if (state !== "ready" || !mediaRecorder.current) return;
    mediaRecorder.current.start();
    setState("recording");
  };

  const stop = () => {
    if (state !== "recording" || !mediaRecorder.current) return;
    mediaRecorder.current.stop();
  };

  return {
    state,
    mediaBlobUrl,
    record,
    stop,
  };
}

export default function Route() {
  const { state, mediaBlobUrl, record, stop } = useMediaRecorder();
  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Media Recorder</CardTitle>
          <CardDescription>Audio Only</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{state}</p>
          <button disabled={state !== "ready"} onClick={record}>
            Record
          </button>
          <button disabled={state !== "recording"} onClick={stop}>
            Stop
          </button>
          <audio controls src="/t-rex-roar.mp3" />
          {mediaBlobUrl && <audio controls src={mediaBlobUrl} />}
        </CardContent>
        <CardFooter>{/* <p>Card Footer</p> */}</CardFooter>
      </Card>
    </div>
  );
}
