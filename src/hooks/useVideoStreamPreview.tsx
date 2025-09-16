'use client';

import { useEffect, useRef, useState } from 'react';

type useVideoStreamPreviewProps = {
  stream: MediaStream | null;
  width?: number;
  height?: number;
};

export function useVideoStreamPreview({
  stream,
  width = 640,
  height = 480,
}: useVideoStreamPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
  }, []);

  useEffect(() => {
    if (stream && canvasRef.current) {
      const video = document.createElement('video');

      video.srcObject = stream;
      video.play();

      canvasRef.current.width = width;
      canvasRef.current.height = height;

      const ctx = canvasRef.current.getContext('2d');

      if (ctx) {
        setCtx(ctx);
      }

      console.log();
      drawFrame();
      setIsLoading(false);

      function drawFrame() {
        if (ctx && canvasRef.current) {
          ctx.drawImage(
            video,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
          );
        }
        requestAnimationFrame(drawFrame);
      }
    }
  }, [stream, width, height]);

  return { isLoading, canvasRef, ctx };
}
