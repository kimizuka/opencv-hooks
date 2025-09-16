'use client';

import { InRangePageTemplate } from '@/components/templates/InRangePageTemplate';
import { useInRange } from '@/hooks/useInRange';
import styles from './index.module.css';

export default function InRangePage() {
  const { red2Range } = useInRange();

  return (
    <div className={styles.wrapper}>
      <InRangePageTemplate min={red2Range.min} max={red2Range.max} />
    </div>
  );
}
