'use client';

import { useEffect, useRef, useState } from 'react';
import type { OpenCV } from '@/hooks/useOpenCv';

type useWebCameraOpenCvProps = {
  cv: OpenCV | null;
  canvas: HTMLCanvasElement | null;
  width?: number;
  height?: number;
};

export function useWebCameraOpenCv({
  cv,
  canvas,
  width = 640,
  height = 480,
}: useWebCameraOpenCvProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [blueLevel, setBlueLevel] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const blueCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    if (!blueCanvasRef.current) {
      blueCanvasRef.current = document.createElement('canvas');
    }
  }, []);

  useEffect(() => {
    if (cv && canvasRef.current && blueCanvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = width;
      blueCanvasRef.current.width = 16;
      blueCanvasRef.current.height = 16;
      document.body.appendChild(blueCanvasRef.current);

      const srcMat = new cv.Mat(height, width, cv.CV_8UC4);
      const distMat = new cv.Mat(height, width, cv.CV_8UC1);
      const blueMat = new cv.Mat(
        blueCanvasRef.current.width,
        blueCanvasRef.current.height,
        cv.CV_8UC4,
      );
      const blueDistMat = new cv.Mat(
        blueCanvasRef.current.width,
        blueCanvasRef.current.height,
        cv.CV_8UC1,
      );
      const minMat = cv.matFromArray(1, 3, cv.CV_8UC1, [127, 64, 0]);
      const maxMat = cv.matFromArray(1, 3, cv.CV_8UC1, [213, 255, 255]);
      const ctx = canvasRef.current.getContext('2d');

      processFrame();

      function processFrame() {
        if (cv && ctx && canvas && canvasRef.current) {
          ctx.drawImage(canvas, 0, 0, width, height);
          srcMat.data.set(ctx.getImageData(0, 0, width, height).data);

          cv.cvtColor(srcMat, distMat, cv.COLOR_RGB2HSV_FULL);
          cv.inRange(distMat, minMat, maxMat, distMat);
          cv.medianBlur(distMat, distMat, 7);
          cv.imshow(canvasRef.current, distMat);

          if (blueCanvasRef.current) {
            const blueCtx = blueCanvasRef.current.getContext('2d');

            if (blueCtx) {
              blueCtx.clearRect(
                0,
                0,
                blueCanvasRef.current.width,
                blueCanvasRef.current.height,
              );
              blueCtx.drawImage(
                canvasRef.current,
                -(width - blueCanvasRef.current.width) / 2,
                -40,
                width,
                height,
              );
              blueMat.data.set(
                blueCtx.getImageData(
                  0,
                  0,
                  blueCanvasRef.current.width,
                  blueCanvasRef.current.height,
                ).data,
              );
              cv.cvtColor(blueMat, blueDistMat, cv.COLOR_RGBA2GRAY);

              setBlueLevel(
                cv.countNonZero(blueDistMat) /
                  (blueCanvasRef.current.width * blueCanvasRef.current.height),
              );
            }
          }
        }
        requestAnimationFrame(processFrame);
      }

      setIsLoading(false);
    }
  }, [cv, canvas, width, height]);

  return { isLoading, canvasRef, blueLevel };
}
