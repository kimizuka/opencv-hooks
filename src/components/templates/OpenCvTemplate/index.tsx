'use client';

import { useEffect, useState } from 'react';
import { useOpenCv } from '@/hooks/useOpenCv';
import { useStream } from '@/hooks/useStream';
import { useVideoStreamPreview } from '@/hooks/useVideoStreamPreview';
import { useWebCameraOpenCv } from '@/hooks/useWebCameraOpenCv';
import styles from './index.module.css';

export function OpenCvTemplate() {
  const { isLoading: isLoadingOpenCv, cv } = useOpenCv();
  const { isLoading: isLoadingWebCamera, stream } = useStream();
  const { canvasRef: previewRef } = useVideoStreamPreview({
    stream,
  });
  const { canvasRef: openCvRef, blueLevel } = useWebCameraOpenCv({
    cv,
    canvas: previewRef.current,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);

  useEffect(() => {
    setIsLoading(isLoadingOpenCv && isLoadingWebCamera);
  }, [isLoadingOpenCv, isLoadingWebCamera]);

  useEffect(() => {
    if (isLoading && audioContext === null) {
      setAudioContext(new AudioContext());
    }
  }, [isLoading, audioContext]);

  useEffect(() => {
    if (!audioContext) {
      return;
    }

    if (audioContext) {
      if (oscillator === null) {
        if (blueLevel === 1) {
          const oscillatorNode = audioContext.createOscillator();

          oscillatorNode.type = 'sine';
          oscillatorNode.frequency.setValueAtTime(
            440,
            audioContext.currentTime,
          );
          oscillatorNode.connect(audioContext.destination);
          oscillatorNode.start();
          setOscillator(oscillatorNode);
        }
      } else {
        if (blueLevel === 0) {
          oscillator.stop();
          setOscillator(null);
        }
      }
    }
  }, [blueLevel, audioContext, oscillator]);

  return (
    <div>
      <canvas ref={previewRef} />
      <div className={styles.wrapper}>
        <canvas ref={openCvRef} />
        <div className={styles.rect} />
        <p>{blueLevel}</p>
      </div>
    </div>
  );
}
