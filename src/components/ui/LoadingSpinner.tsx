'use client';

import Lottie from 'lottie-react';
import loadingAnimation from '@/lib/animations/loading.json';

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export default function LoadingSpinner({ className = '', size = 40 }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Lottie
        animationData={loadingAnimation}
        style={{ width: size, height: size }}
        loop={true}
      />
    </div>
  );
} 