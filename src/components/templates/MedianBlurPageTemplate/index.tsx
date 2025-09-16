'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { type OpenCV, useOpenCv } from '@/hooks/useOpenCv';
import { useStream } from '@/hooks/useStream';
import { useVideoStreamPreviewGl } from '@/hooks/useVideoStreamPreviewGl';
import styles from './index.module.css';

const cameraWidth = 320;
const cameraHeight = 240;
const ksize = 9;

export function MedianBlurPageTemplate() {
  const { isLoading: isLoadingOpenCv, cv } = useOpenCv();
  const { isLoading: isLoadingWebCamera, stream } = useStream({
    video: {
      facingMode: 'user',
      width: { ideal: cameraWidth },
      height: { ideal: cameraHeight },
    },
    audio: false,
  });
  const { canvasRef: previewRef, gl } = useVideoStreamPreviewGl({
    stream,
    width: cameraWidth,
    height: cameraHeight,
  });
  const [isLoading, setIsLoading] = useState(true);
  const cvRef = useRef<HTMLCanvasElement | null>(null);

  const render = useCallback(
    (
      cv: OpenCV,
      src: InstanceType<OpenCV['Mat']>,
      dist: InstanceType<OpenCV['Mat']>,
      width: number,
      height: number,
    ) => {
      if (cvRef.current && gl) {
        const pixels = new Uint8Array(width * height * 4);

        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        src.data.set(pixels);
        cv.flip(src, src, 0);
        cv.cvtColor(src, dist, cv.COLOR_RGBA2GRAY);
        cv.medianBlur(src, dist, ksize);
        cv.imshow(cvRef.current, dist);
      }

      requestAnimationFrame(() => {
        render(cv, src, dist, width, height);
      });
    },
    [gl],
  );

  useEffect(() => {
    setIsLoading(isLoadingOpenCv || isLoadingWebCamera);
  }, [isLoadingOpenCv, isLoadingWebCamera]);

  useEffect(() => {
    if (isLoading || !cv || !previewRef.current) {
      return;
    }

    const canvas = previewRef.current;
    const srcMat = new cv.Mat(canvas.height, canvas.width, cv.CV_8UC4);
    const distMat = new cv.Mat(canvas.height, canvas.width, cv.CV_8UC1);

    render(cv, srcMat, distMat, canvas.width, canvas.height);
  }, [isLoading, cv, previewRef.current, render]);

  return (
    <div data-is-show={!isLoading} className={styles.wrapper}>
      <canvas ref={previewRef} />
      <canvas ref={cvRef} />
    </div>
  );
}
