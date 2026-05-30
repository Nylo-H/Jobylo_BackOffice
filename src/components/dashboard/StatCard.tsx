import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  trend?: string;
  prefix?: string;
  className?: string;
}

function CountUp({ value, duration = 1 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setCount(0);
      return;
    }
    const start = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

export function StatCard({ icon, label, value, trend, prefix, className }: StatCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
      }}
    >
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
            {trend && (
              <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                {trend}
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-text-primary">
              {prefix}
              <CountUp value={value} />
            </p>
            <p className="text-sm text-text-secondary mt-1">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}