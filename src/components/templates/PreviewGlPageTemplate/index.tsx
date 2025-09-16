'use client';

import { useStream } from '@/hooks/useStream';
import { useVideoStreamPreviewGl } from '@/hooks/useVideoStreamPreviewGl';
import styles from './index.module.css';

export function PreviewGlPageTemplate() {
  const { stream } = useStream();
  const { canvasRef } = useVideoStreamPreviewGl({
    stream,
  });

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} />
    </div>
  );
}
