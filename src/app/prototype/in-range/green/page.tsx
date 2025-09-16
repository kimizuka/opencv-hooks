'use client';

import { InRangePageTemplate } from '@/components/templates/InRangePageTemplate';
import { useInRange } from '@/hooks/useInRange';
import styles from './index.module.css';

export default function InRangePage() {
  const { greenRange } = useInRange();

  return (
    <div className={styles.wrapper}>
      <InRangePageTemplate min={greenRange.min} max={greenRange.max} />
    </div>
  );
}
