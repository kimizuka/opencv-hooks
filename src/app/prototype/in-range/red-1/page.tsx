'use client';

import { InRangePageTemplate } from '@/components/templates/InRangePageTemplate';
import { useInRange } from '@/hooks/useInRange';
import styles from './index.module.css';

export default function InRangePage() {
  const { red1Range } = useInRange();

  return (
    <div className={styles.wrapper}>
      <InRangePageTemplate min={red1Range.min} max={red1Range.max} />
    </div>
  );
}
