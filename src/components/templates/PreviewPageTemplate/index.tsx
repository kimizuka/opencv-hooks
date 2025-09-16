'use client';

import { useStream } from '@/hooks/useStream';
import { useVideoStreamPreview } from '@/hooks/useVideoStreamPreview';
import styles from './index.module.css';

export function PreviewPageTemplate() {
  const { stream } = useStream();
  const { canvasRef } = useVideoStreamPreview({
    stream,
  });

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} />
    </div>
  );
}
