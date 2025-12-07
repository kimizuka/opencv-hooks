'use client';

import { useEffect, useRef, useState } from 'react';
import { useResize } from '@/hooks/useResize';
import styles from './index.module.css';

type SushiProps = {
  isOpen: boolean;
  beat: boolean;
};

const colors = ['', 'red', '', 'green', '', 'blue', '', 'yellow'];

export function Sushi({ isOpen, beat }: SushiProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const { windowWidth, windowHeight } = useResize();
  const countRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = windowWidth * 2;
    canvas.height = windowHeight * 2;

    setCanvas(canvas);
    setCtx(ctx);
  }, [windowWidth, windowHeight]);

  useEffect(() => {
    let frameId: number;

    render();

    function render() {
      if (!canvas) return;
      if (!ctx) return;

      const fontSize = 200;

      canvas.width = windowWidth * 2;
      canvas.height = windowHeight * 2;
      ctx.font = `${fontSize}px serif`;

      ctx.save();

      const netaPerRow = 8;
      const stepSize = (windowWidth * 2) / netaPerRow;
      const speed = 0.01;
      const rows = Math.floor((windowHeight * 2) / 400);
      const neta = ['🍣', '🐟', '🥒', '🦑', '🥚'];
      const count = countRef.current;
      const marginX = (windowWidth * 2 - stepSize * (netaPerRow - 1)) * 0.8;
      const marginY = 320;

      for (let row = 0; row < rows; row++) {
        const y = marginY + row * fontSize * 2 - ((count * speed) % fontSize);

        for (let col = 0; col < netaPerRow; col++) {
          ctx.fillText(
            neta[(count + netaPerRow - col) % neta.length],
            windowWidth * 2 - (marginX + col * stepSize),
            y,
          );
        }
      }

      ctx.restore();

      frameId = requestAnimationFrame(render);

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');

        canvasRef.current.width = windowWidth * 2;
        canvasRef.current.height = windowHeight * 2;

        if (ctx) {
          const color = colors[count % colors.length];

          if (color) {
            ctx.save();
            ctx.globalCompositeOperation = 'luminosity';
            ctx.fillStyle = color;

            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(canvas, 0, 0);
            ctx.restore();
            ctx.restore();

            ctx.save();
            ctx.globalCompositeOperation = 'destination-in';

            if (isOpen) {
              ctx.filter = 'blur(64px)';
            } else {
              ctx.filter = 'blur(8px)';
            }

            ctx.drawImage(canvas, 0, 0);
            ctx.restore();
          }

          ctx.save();
          if (isOpen) {
            ctx.globalCompositeOperation = 'lighter';
          }
          ctx.drawImage(canvas, 0, 0);
          ctx.restore();
        }
      }
    }

    return () => {
      ctx?.clearRect(0, 0, windowWidth * 2, windowHeight * 2);
      cancelAnimationFrame(frameId);
    };
  }, [isOpen, windowWidth, windowHeight, canvas, ctx]);

  useEffect(() => {
    if (beat) {
      countRef.current += 1;
    }
  }, [beat]);

  return (
    <div data-is-open={isOpen} className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
