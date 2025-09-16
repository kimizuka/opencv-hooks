import { MonochromePageTemplate } from '@/components/templates/MonochromePageTemplate';
import styles from './index.module.css';

export default function MonochromePage() {
  return (
    <div className={styles.wrapper}>
      <MonochromePageTemplate />
    </div>
  );
}
