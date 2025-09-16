'use client';

import { InRangePageTemplate } from '@/components/templates/InRangePageTemplate';
import { useInRange } from '@/hooks/useInRange';
import styles from './index.module.css';

export default function InRangePage() {
  const { yellowRange } = useInRange();

  return (
    <div className={styles.wrapper}>
      <InRangePageTemplate min={yellowRange.min} max={yellowRange.max} />
    </div>
  );
}
