import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className={styles.container}>
      <Loader2 className={styles.spinner} />
    </div>
  );
};

export default LoadingSpinner;
