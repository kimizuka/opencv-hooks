'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { type OpenCV, useOpenCv } from '@/hooks/useOpenCv';
import { useStream } from '@/hooks/useStream';
import { useVideoStreamPreviewGl } from '@/hooks/useVideoStreamPreviewGl';
import styles from './index.module.css';

export const notBlackRange = {
  min: [0, 0, 64],
  max: [255, 255, 255],
};

export const red1Range = {
  min: [0, 64, 0],
  max: [21, 255, 255],
};

export const red2Range = {
  min: [212, 64, 0],
  max: [255, 255, 255],
};

export const greenRange = {
  min: [43, 64, 0],
  max: [127, 255, 255],
};

export const blueRange = {
  min: [127, 64, 0],
  max: [213, 255, 255],
};

export const yellowRange = {
  min: [30, 51, 0],
  max: [43, 255, 255],
};

const cameraWidth = 320;
const cameraHeight = 240;
const needleWidth = 4;
const x = -(cameraWidth - needleWidth) / 2;

function getWhitePixelPercent(
  context: CanvasRenderingContext2D | null,
  width: number,
  height: number,
) {
  if (!context) return 0;

  const totalPixelCount = cameraWidth * cameraHeight;
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (r > 200 && g > 200 && b > 200 && a > 200) {
      count++;
    }
  }

  return count / totalPixelCount;
}

export function MusicLazySusanPageTemplate() {
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
  const [rNeedleContext, setRNeedleContext] =
    useState<CanvasRenderingContext2D | null>(null);
  const [gNeedleContext, setGNeedleContext] =
    useState<CanvasRenderingContext2D | null>(null);
  const [bNeedleContext, setBNeedleContext] =
    useState<CanvasRenderingContext2D | null>(null);
  const rRef = useRef<HTMLCanvasElement | null>(null);
  const gRef = useRef<HTMLCanvasElement | null>(null);
  const bRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [cGain, setCGain] = useState<GainNode | null>(null);
  const [eGain, setEGain] = useState<GainNode | null>(null);
  const [gGain, setGGain] = useState<GainNode | null>(null);
  const [drumAAudio, setDrumAAudio] = useState<HTMLAudioElement | null>(null);
  const [drumEAudio, setDrumEAudio] = useState<HTMLAudioElement | null>(null);
  const [drumGAudio, setDrumGAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlayC, setIsPlayC] = useState(false);
  const [isPlayE, setIsPlayE] = useState(false);
  const [isPlayG, setIsPlayG] = useState(false);
  const rNeedleRef = useRef<HTMLCanvasElement | null>(null);
  const gNeedleRef = useRef<HTMLCanvasElement | null>(null);
  const bNeedleRef = useRef<HTMLCanvasElement | null>(null);

  const play = useCallback(() => {
    if (
      rRef.current &&
      gRef.current &&
      bRef.current &&
      rNeedleContext &&
      gNeedleContext &&
      bNeedleContext
    ) {
      rNeedleContext.clearRect(0, 0, needleWidth, cameraHeight);
      gNeedleContext.clearRect(0, 0, needleWidth, cameraHeight);
      bNeedleContext.clearRect(0, 0, needleWidth, cameraHeight);

      rNeedleContext.drawImage(rRef.current, x, 0, cameraWidth, cameraHeight);
      gNeedleContext.drawImage(gRef.current, x, 0, cameraWidth, cameraHeight);
      bNeedleContext.drawImage(bRef.current, x, 0, cameraWidth, cameraHeight);

      const rWhitePixelPercent = getWhitePixelPercent(
        rNeedleContext,
        cameraWidth,
        cameraHeight,
      );
      const gWhitePixelPercent = getWhitePixelPercent(
        gNeedleContext,
        cameraWidth,
        cameraHeight,
      );
      const bWhitePixelPercent = getWhitePixelPercent(
        bNeedleContext,
        cameraWidth,
        cameraHeight,
      );

      setIsPlayC(0 < rWhitePixelPercent);
      setIsPlayE(0 < gWhitePixelPercent);
      setIsPlayG(0 < bWhitePixelPercent);

      // console.log(rWhitePixelPercent, gWhitePixelPercent, bWhitePixelPercent);
    }
  }, [rNeedleContext, gNeedleContext, bNeedleContext]);

  const render = useCallback(
    (
      cv: OpenCV,
      src: InstanceType<OpenCV['Mat']>,
      dist: InstanceType<OpenCV['Mat']>,
      width: number,
      height: number,
    ) => {
      [
        {
          ref: rRef,
          min: red2Range.min,
          max: red2Range.max,
        },
        {
          ref: gRef,
          min: greenRange.min,
          max: greenRange.max,
        },
        {
          ref: bRef,
          min: blueRange.min,
          max: blueRange.max,
        },
      ].forEach(({ ref, min, max }) => {
        if (ref.current && gl && min && max) {
          const pixels = new Uint8Array(width * height * 4);
          const minMat = cv.matFromArray(1, 3, cv.CV_8UC1, min);
          const maxMat = cv.matFromArray(1, 3, cv.CV_8UC1, max);

          gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

          src.data.set(pixels);
          cv.flip(src, src, 0);
          cv.cvtColor(src, dist, cv.COLOR_RGB2HSV_FULL);
          cv.inRange(dist, minMat, maxMat, dist);
          cv.imshow(ref.current, dist);
        }
      });

      requestAnimationFrame(() => {
        render(cv, src, dist, width, height);
        play();
      });
    },
    [gl, play],
  );

  useEffect(() => {
    window.addEventListener('click', handleClickWindow);

    return () => {
      window.removeEventListener('click', handleClickWindow);
    };

    function handleClickWindow() {
      const audioContext = new AudioContext();

      [261.6, 329.6, 392.0].forEach((frequency) => {
        const gainNode = audioContext.createGain();
        const oscillator = audioContext.createOscillator();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(
          frequency,
          audioContext.currentTime,
        );
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch (frequency) {
          case 261.6:
            setCGain(gainNode);
            break;
          case 329.6:
            setEGain(gainNode);
            break;
          case 392.0:
            setGGain(gainNode);
            break;
        }

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        oscillator.start();
      });

      new Array(3).fill(null).forEach((_, i) => {
        const gainNode = audioContext.createGain();
        const audioElement = document.createElement('audio');
        audioElement.src = `/drum-${i}.mp3`;
        audioElement.load();

        const track = audioContext.createMediaElementSource(audioElement);

        track.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch (i) {
          case 0:
            setDrumAAudio(audioElement);
            break;
          case 1:
            setDrumEAudio(audioElement);
            break;
          case 2:
            setDrumGAudio(audioElement);
            break;
        }
      });

      audioContextRef.current = audioContext;
      window.removeEventListener('click', handleClickWindow);
    }
  }, []);

  useEffect(() => {
    if (audioContextRef.current) {
      if (isPlayC) {
        cGain?.gain.setValueAtTime(1, audioContextRef.current.currentTime);
      } else {
        cGain?.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      }

      if (isPlayE) {
        eGain?.gain.setValueAtTime(1, audioContextRef.current.currentTime);
      } else {
        eGain?.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      }

      if (isPlayG) {
        gGain?.gain.setValueAtTime(1, audioContextRef.current.currentTime);
      } else {
        gGain?.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      }
    }
  }, [isPlayC, isPlayE, isPlayG, cGain, eGain, gGain]);

  // useEffect(() => {
  //   if (audioContextRef.current) {
  //     if (isPlayC) {
  //       drumAAudio?.play();
  //     } else {
  //       drumAAudio?.pause();
  //     }

  //     if (isPlayE) {
  //       drumEAudio?.play();
  //     } else {
  //       drumEAudio?.pause();
  //     }

  //     if (isPlayG) {
  //       drumGAudio?.play();
  //     } else {
  //       drumGAudio?.pause();
  //     }
  //   }
  // }, [isPlayC, isPlayE, isPlayG, drumAAudio, drumEAudio, drumGAudio]);

  useEffect(() => {
    if (rNeedleRef.current) {
      rNeedleRef.current.width = needleWidth;
      rNeedleRef.current.height = cameraHeight;
      setRNeedleContext(rNeedleRef.current.getContext('2d'));
    }

    if (gNeedleRef.current) {
      gNeedleRef.current.width = needleWidth;
      gNeedleRef.current.height = cameraHeight;
      setGNeedleContext(gNeedleRef.current.getContext('2d'));
    }

    if (bNeedleRef.current) {
      bNeedleRef.current.width = needleWidth;
      bNeedleRef.current.height = cameraHeight;
      setBNeedleContext(bNeedleRef.current.getContext('2d'));
    }
  }, []);

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
      <div className={styles.box}>
        <canvas ref={previewRef} />
      </div>
      <div className={styles.box}>
        <canvas ref={rRef} />
        <canvas data-color="r" ref={rNeedleRef} className={styles.needle} />
      </div>
      <div className={styles.box}>
        <canvas ref={gRef} />
        <canvas data-color="g" ref={gNeedleRef} className={styles.needle} />
      </div>
      <div className={styles.box}>
        <canvas ref={bRef} />
        <canvas data-color="b" ref={bNeedleRef} className={styles.needle} />
      </div>
    </div>
  );
}
