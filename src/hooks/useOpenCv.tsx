'use client';

import type OpenCVType from '@techstark/opencv-js';
import { useEffect, useRef, useState } from 'react';

export type OpenCV = typeof OpenCVType;

export function useOpenCv() {
  const [isLoading, setIsLoading] = useState(true);
  const [cv, setCv] = useState<OpenCV | null>(null);
  const isInitRef = useRef(false);

  useEffect(() => {
    if (!isInitRef.current) {
      isInitRef.current = true;

      (async () => {
        const cv = await import('@techstark/opencv-js');

        setCv(cv);
      })();
    }
  }, []);

  useEffect(() => {
    if (cv) {
      setIsLoading(false);
    }
  }, [cv]);

  return {
    isLoading,
    cv,
  };
}
