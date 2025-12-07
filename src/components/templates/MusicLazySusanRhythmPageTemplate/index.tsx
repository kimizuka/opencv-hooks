'use client';

import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Sushi } from '@/components/elements/Sushi';
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

export const fixedRedRange = {
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

export const fixedYellowRange = {
  min: [20, 120, 80],
  max: [60, 255, 200],
};

const cameraWidth = 320;
const cameraHeight = 240;
const needleWidth = 4;
const x = -(cameraWidth - needleWidth) / 2;

const bpm = 120;

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

export function MusicLazySusanRhythmPageTemplate() {
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
  const [yNeedleContext, setYNeedleContext] =
    useState<CanvasRenderingContext2D | null>(null);
  const rRef = useRef<HTMLCanvasElement | null>(null);
  const gRef = useRef<HTMLCanvasElement | null>(null);
  const bRef = useRef<HTMLCanvasElement | null>(null);
  const yRef = useRef<HTMLCanvasElement | null>(null);
  const isPlayRRef = useRef(false);
  const isPlayGRef = useRef(false);
  const isPlayBRef = useRef(false);
  const isPlayYRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [baseGain, setBaseGain] = useState<GainNode | null>(null);
  const [c2Gain, setC2Gain] = useState<GainNode | null>(null);
  const [c4Gain, setC4Gain] = useState<GainNode | null>(null);
  const [e4Gain, setE4Gain] = useState<GainNode | null>(null);
  const [g4Gain, setG4Gain] = useState<GainNode | null>(null);
  const rNeedleRef = useRef<HTMLCanvasElement | null>(null);
  const gNeedleRef = useRef<HTMLCanvasElement | null>(null);
  const bNeedleRef = useRef<HTMLCanvasElement | null>(null);
  const yNeedleRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef(-1);
  const beatRef = useRef(false);
  const offBeatRef = useRef(true);
  const isOpenRef = useRef(false);
  const [beat, setBeat] = useState(beatRef.current);

  const play = useCallback(() => {
    if (
      rRef.current &&
      gRef.current &&
      bRef.current &&
      yRef.current &&
      rNeedleContext &&
      gNeedleContext &&
      bNeedleContext &&
      yNeedleContext
    ) {
      rNeedleContext.clearRect(0, 0, needleWidth, cameraHeight);
      gNeedleContext.clearRect(0, 0, needleWidth, cameraHeight);
      bNeedleContext.clearRect(0, 0, needleWidth, cameraHeight);
      yNeedleContext.clearRect(0, 0, needleWidth, cameraHeight);

      rNeedleContext.drawImage(rRef.current, x, 0, cameraWidth, cameraHeight);
      gNeedleContext.drawImage(gRef.current, x, 0, cameraWidth, cameraHeight);
      bNeedleContext.drawImage(bRef.current, x, 0, cameraWidth, cameraHeight);
      yNeedleContext.drawImage(yRef.current, x, 0, cameraWidth, cameraHeight);

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
      const yWhitePixelPercent = getWhitePixelPercent(
        yNeedleContext,
        cameraWidth,
        cameraHeight,
      );

      isPlayRRef.current = 0 < rWhitePixelPercent;
      isPlayGRef.current = 0 < gWhitePixelPercent;
      isPlayBRef.current = 0 < bWhitePixelPercent;
      isPlayYRef.current = 0 < yWhitePixelPercent;
    }
  }, [rNeedleContext, gNeedleContext, bNeedleContext, yNeedleContext]);

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
          min: fixedRedRange.min,
          max: fixedRedRange.max,
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
        {
          ref: yRef,
          min: fixedYellowRange.min,
          max: fixedYellowRange.max,
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

      [65.4, 130.8, 261.6, 329.6, 392.0].forEach((frequency) => {
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
          case 65.4:
            setC2Gain(gainNode);
            break;
          case 130.8:
            setBaseGain(gainNode);
            break;
          case 261.6:
            setC4Gain(gainNode);
            break;
          case 329.6:
            setE4Gain(gainNode);
            break;
          case 392.0:
            setG4Gain(gainNode);
            break;
        }

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        oscillator.start();
      });

      audioContextRef.current = audioContext;
      window.removeEventListener('click', handleClickWindow);
    }
  }, []);

  useEffect(() => {
    if (baseGain && c2Gain && e4Gain && g4Gain && c4Gain) {
      clearInterval(timerRef.current);
      timerRef.current = window.setInterval(
        () => {
          if (audioContextRef.current) {
            if (!isOpenRef.current && offBeatRef.current) {
              offBeatRef.current = false;
            } else {
              beatRef.current = true;
              setBeat(beatRef.current);
              baseGain?.gain.setValueAtTime(
                1,
                audioContextRef.current.currentTime,
              );
              offBeatRef.current = true;
            }

            if (isPlayRRef.current) {
              if (c4Gain?.gain.value === 0) {
                c4Gain.gain.setValueAtTime(
                  1,
                  audioContextRef.current.currentTime,
                );
              }
            } else {
              if (c4Gain?.gain.value === 1) {
                c4Gain.gain.setValueAtTime(
                  0,
                  audioContextRef.current.currentTime,
                );
              }
            }

            if (isPlayGRef.current) {
              if (e4Gain?.gain.value === 0) {
                e4Gain.gain.setValueAtTime(
                  1,
                  audioContextRef.current.currentTime,
                );
              }
            } else {
              if (e4Gain?.gain.value === 1) {
                e4Gain.gain.setValueAtTime(
                  0,
                  audioContextRef.current.currentTime,
                );
              }
            }

            if (isPlayBRef.current) {
              if (g4Gain?.gain.value === 0) {
                g4Gain.gain.setValueAtTime(
                  1,
                  audioContextRef.current.currentTime,
                );
              }
            } else {
              if (g4Gain?.gain.value === 1) {
                g4Gain.gain.setValueAtTime(
                  0,
                  audioContextRef.current.currentTime,
                );
              }
            }

            if (isPlayYRef.current) {
              if (c2Gain?.gain.value === 0) {
                c2Gain.gain.setValueAtTime(
                  1,
                  audioContextRef.current.currentTime,
                );
              }
            } else {
              if (c2Gain?.gain.value === 1) {
                c2Gain.gain.setValueAtTime(
                  0,
                  audioContextRef.current.currentTime,
                );
              }
            }

            setTimeout(
              () => {
                if (audioContextRef.current) {
                  beatRef.current = false;
                  setBeat(beatRef.current);
                  baseGain?.gain.setValueAtTime(
                    0,
                    audioContextRef.current.currentTime,
                  );
                }
              },
              1000 / ((bpm * 2) / 60) / 4,
            );
          }
        },
        1000 / ((bpm * 2) / 60),
      );
    }
  }, [baseGain, c4Gain, e4Gain, g4Gain, c2Gain]);

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

    if (yNeedleRef.current) {
      yNeedleRef.current.width = needleWidth;
      yNeedleRef.current.height = cameraHeight;
      setYNeedleContext(yNeedleRef.current.getContext('2d'));
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
    <div data-is-show={!isLoading} data-beat={beat} className={styles.wrapper}>
      <div className={styles.background}>
        <Sushi isOpen={isOpenRef.current} beat={beat} />
      </div>
      <div className={styles.content}>
        <div className={styles.box}>
          <canvas ref={previewRef} />
        </div>
        <div className={styles.rgb}>
          <div
            data-is-play={isPlayRRef.current}
            className={classNames(styles.box, styles.red)}
          >
            <canvas ref={rRef} />
            <canvas data-color="r" ref={rNeedleRef} className={styles.needle} />
          </div>
          <div
            data-is-play={isPlayGRef.current}
            className={classNames(styles.box, styles.green)}
          >
            <canvas ref={gRef} />
            <canvas data-color="g" ref={gNeedleRef} className={styles.needle} />
          </div>
          <div
            data-is-play={isPlayBRef.current}
            className={classNames(styles.box, styles.blue)}
          >
            <canvas ref={bRef} />
            <canvas data-color="b" ref={bNeedleRef} className={styles.needle} />
          </div>
          <div
            data-is-play={isPlayYRef.current}
            className={classNames(styles.box, styles.yellow)}
          >
            <canvas ref={yRef} />
            <canvas data-color="y" ref={yNeedleRef} className={styles.needle} />
          </div>
        </div>
      </div>
      {/* <button
        className={styles.button}
        type="button"
        onClick={() => {
          isOpenRef.current = !isOpenRef.current;
        }}
      >
        {isOpenRef.current ? 'CLOSE' : 'OPEN'}
      </button> */}
    </div>
  );
}
