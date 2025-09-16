'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type OpenCV, useOpenCv } from '@/hooks/useOpenCv';
import { useStream } from '@/hooks/useStream';
import { useVideoStreamPreviewGl } from '@/hooks/useVideoStreamPreviewGl';
import styles from './index.module.css';

const cameraWidth = 320;
const cameraHeight = 240;
const cannyThreshold1 = 60;
const cannyThreshold2 = 120;
const laplacianKsize = 3;
const medianBlurKsize = 9;

export function PrototypePageTemplate() {
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
  const cannyRef = useRef<HTMLCanvasElement | null>(null);
  const flipRef = useRef<HTMLCanvasElement | null>(null);
  const laplacianRef = useRef<HTMLCanvasElement | null>(null);
  const medianBlurRef = useRef<HTMLCanvasElement | null>(null);
  const monochromeRef = useRef<HTMLCanvasElement | null>(null);
  const sobelRef = useRef<HTMLCanvasElement | null>(null);

  const renderCannyCanvas = useCallback(
    (
      cv: OpenCV,
      src: InstanceType<OpenCV['Mat']>,
      dist: InstanceType<OpenCV['Mat']>,
      width: number,
      height: number,
    ) => {
      if (cannyRef.current && gl) {
        const pixels = new Uint8Array(width * height * 4);

        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        src.data.set(pixels);
        cv.flip(src, src, 0);
        cv.cvtColor(src, dist, cv.COLOR_RGBA2GRAY);
        cv.Canny(src, dist, cannyThreshold1, cannyThreshold2);
        cv.imshow(cannyRef.current, dist);
      }
    },
    [gl],
  );

  const renderFlipCanvas = useCallback(
    (
      cv: OpenCV,
      src: InstanceType<OpenCV['Mat']>,
      dist: InstanceType<OpenCV['Mat']>,
      width: number,
      height: number,
    ) => {
      if (flipRef.current && gl) {
        const pixels = new Uint8Array(width * height * 4);

        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        src.data.set(pixels);
        cv.flip(src, dist, -1);
        cv.imshow(flipRef.current, dist);
      }
    },
    [gl],
  );

  const renderLaplacianCanvas = useCallback(
    (
      cv: OpenCV,
      src: InstanceType<OpenCV['Mat']>,
      dist: InstanceType<OpenCV['Mat']>,
      width: number,
      height: number,
    ) => {
      if (laplacianRef.current && gl) {
        const pixels = new Uint8Array(width * height * 4);

        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        src.data.set(pixels);
        cv.flip(src, src, 0);
        cv.cvtColor(src, dist, cv.COLOR_RGBA2GRAY);
        cv.Laplacian(dist, dist, cv.CV_8U, laplacianKsize);
        cv.imshow(laplacianRef.current, dist);
      }

      requestAnimationFrame(() => {
        renderLaplacianCanvas(cv, src, dist, width, height);
      });
    },
    [gl],
  );

  const renderMedianBlurCanvas = useCallback(
    (
      cv: OpenCV,
      src: InstanceType<OpenCV['Mat']>,
      dist: InstanceType<OpenCV['Mat']>,
      width: number,
      height: number,
    ) => {
      if (medianBlurRef.current && gl) {
        const pixels = new Uint8Array(width * height * 4);

        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        src.data.set(pixels);
        cv.flip(src, src, 0);
        cv.medianBlur(src, dist, medianBlurKsize);
        cv.imshow(medianBlurRef.current, dist);
      }

      requestAnimationFrame(() => {
        renderMedianBlurCanvas(cv, src, dist, width, height);
      });
    },
    [gl],
  );

  const renderMonochromeCanvas = useCallback(
    (
      cv: OpenCV,
      src: InstanceType<OpenCV['Mat']>,
      dist: InstanceType<OpenCV['Mat']>,
      width: number,
      height: number,
    ) => {
      if (monochromeRef.current && gl) {
        const pixels = new Uint8Array(width * height * 4);

        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        src.data.set(pixels);
        cv.flip(src, src, 0);
        cv.cvtColor(src, dist, cv.COLOR_RGBA2GRAY);
        cv.imshow(monochromeRef.current, dist);
      }

      requestAnimationFrame(() => {
        renderMonochromeCanvas(cv, src, dist, width, height);
      });
    },
    [gl],
  );

  const renderSobelCanvas = useCallback(
    (
      cv: OpenCV,
      src: InstanceType<OpenCV['Mat']>,
      dist: InstanceType<OpenCV['Mat']>,
      width: number,
      height: number,
    ) => {
      if (sobelRef.current && gl) {
        const pixels = new Uint8Array(width * height * 4);

        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        src.data.set(pixels);
        cv.flip(src, src, 0);
        cv.cvtColor(src, dist, cv.COLOR_RGBA2GRAY);
        cv.Sobel(dist, dist, cv.CV_8U, 1, 1);
        cv.imshow(sobelRef.current, dist);
      }

      requestAnimationFrame(() => {
        renderSobelCanvas(cv, src, dist, width, height);
      });
    },
    [gl],
  );

  const render = useCallback(
    (
      cv: OpenCV,
      src: InstanceType<OpenCV['Mat']>,
      dist: InstanceType<OpenCV['Mat']>,
      width: number,
      height: number,
    ) => {
      renderCannyCanvas(cv, src, dist, width, height);
      renderFlipCanvas(cv, src, dist, width, height);
      renderLaplacianCanvas(cv, src, dist, width, height);
      renderMedianBlurCanvas(cv, src, dist, width, height);
      renderMonochromeCanvas(cv, src, dist, width, height);
      renderSobelCanvas(cv, src, dist, width, height);

      requestAnimationFrame(() => {
        render(cv, src, dist, width, height);
      });
    },
    [
      renderCannyCanvas,
      renderFlipCanvas,
      renderLaplacianCanvas,
      renderMedianBlurCanvas,
      renderMonochromeCanvas,
      renderSobelCanvas,
    ],
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
      <ul className={styles.list}>
        <li>
          <Link href="/prototype/preview">
            <canvas ref={previewRef} />
          </Link>
        </li>
        <li>
          <Link href="/prototype/canny">
            <canvas ref={cannyRef} />
          </Link>
        </li>
        <li>
          <Link href="/prototype/flip">
            <canvas ref={flipRef} />
          </Link>
        </li>
        <li>
          <Link href="/prototype/laplacian">
            <canvas ref={laplacianRef} />
          </Link>
        </li>
        <li>
          <Link href="/prototype/median-blur">
            <canvas ref={medianBlurRef} />
          </Link>
        </li>
        <li>
          <Link href="/prototype/monochrome">
            <canvas ref={monochromeRef} />
          </Link>
        </li>
        <li>
          <Link href="/prototype/sobel">
            <canvas ref={sobelRef} />
          </Link>
        </li>
      </ul>
    </div>
  );
}
