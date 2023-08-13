import * as React from "react";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";

// function useMediaRecorder(stream) {
//   const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
//   const [chunks, setChunks] = React.useState([]);
//   const [blob, setBlob] = React.useState(null);
//   const [url, setUrl] = React.useState(null);
//   const [isRecording, setIsRecording] = React.useState(false);

//   function startRecording() {
//     const recorder = new MediaRecorder(stream);
//     recorder.ondataavailable = (e) => {
//       setChunks((prev) => [...prev, e.data]);
//     };
//     recorder.onstop = () => {
//       const blob = new Blob(chunks, { type: 'video/webm' });
//       setBlob(blob);
//     };
//     recorder.onerror = (e) => {
//       console.error(e);
//     };
//     recorder.start();
//     setMediaRecorder(recorder);
//     setIsRecording(true);
//   }

//   function stopRecording() {
//     mediaRecorder.stop();
//     setIsRecording(false);
//   }

//   function downloadRecording() {
//     const url = URL.createObjectURL(blob);
//     setUrl(url);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'recording.webm';
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   }

//   return {
//     mediaRecorder,
//     blob,
//     url,
//     isRecording,
//     startRecording,
//     stopRecording,
//     downloadRecording,
//   };
// }


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
