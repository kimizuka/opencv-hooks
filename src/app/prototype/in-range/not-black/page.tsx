'use client';

import { InRangePageTemplate } from '@/components/templates/InRangePageTemplate';
import { useInRange } from '@/hooks/useInRange';
import styles from './index.module.css';

export default function InRangePage() {
  const { notBlackRange } = useInRange();

  return (
    <div className={styles.wrapper}>
      <InRangePageTemplate min={notBlackRange.min} max={notBlackRange.max} />
    </div>
  );
}
