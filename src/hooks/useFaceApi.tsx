import * as faceapi from 'face-api.js';
import { useEffect } from 'react';

const modelpath = 'https://justadudewhohacks.github.io/face-api.js/models';

type useFaceApiProps = {
  canvas: HTMLCanvasElement | null;
};

export function useFaceApi({ canvas }: useFaceApiProps) {
  useEffect(() => {
    (async () => {
      await faceapi.loadTinyFaceDetectorModel(modelpath);
      await faceapi.loadFaceExpressionModel(modelpath);

      if (canvas) {
        const displaySize = { width: canvas.width, height: canvas.height };
        faceapi.matchDimensions(canvas, displaySize);

        const interval = setInterval(async () => {
          const detections = await faceapi
            .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize,
          );
          canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        }, 100);

        return () => clearInterval(interval);
      }
    })();
  }, [canvas]);
}
