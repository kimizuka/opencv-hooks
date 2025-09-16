'use client';

import { useEffect, useState } from 'react';

type useStreamProps = MediaStreamConstraints;

export function useStream(
  props: useStreamProps = { video: true, audio: false },
) {
  const [isLoading, setIsLoading] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(props);

        setStream(stream);
      } catch (err) {
        console.error('Error accessing webcam:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [props, isLoading]);

  return {
    isLoading,
    stream,
  };
}
