import { useEffect, useRef, useState } from 'react';
import styles from './index.module.css';

type FpsProps = {
  current: number;
};

export function Fps({ current }: FpsProps) {
  const [fps, setFps] = useState(0);
  const lastUpdateRef = useRef<number>(0);

  console.log(current);
  useEffect(() => {
    if (lastUpdateRef.current === 0) {
      lastUpdateRef.current = current;
      return;
    }

    const deltaTime = current - lastUpdateRef.current;

    if (0 < deltaTime) {
      setFps(1000 / deltaTime);
    }

    lastUpdateRef.current = current;
  }, [current]);

  return (
    <div className={styles.wrapper}>
      <span>FPS: {fps.toFixed(2)}</span>
    </div>
  );
}
