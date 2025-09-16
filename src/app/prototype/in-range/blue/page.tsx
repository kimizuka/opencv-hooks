'use client';

import { InRangePageTemplate } from '@/components/templates/InRangePageTemplate';
import { useInRange } from '@/hooks/useInRange';
import styles from './index.module.css';

export default function InRangePage() {
  const { blueRange } = useInRange();

  return (
    <div className={styles.wrapper}>
      <InRangePageTemplate min={blueRange.min} max={blueRange.max} />
    </div>
  );
}
