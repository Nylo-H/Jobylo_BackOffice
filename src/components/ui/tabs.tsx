import * as React from 'react';
import { cn } from '../../lib/utils';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType>({
  value: '',
  onValueChange: () => {},
});

export function Tabs({ children, value, onValueChange, className }: {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-1 p-1 bg-surface-variant rounded-lg', className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ children, value, className }: { children: React.ReactNode; value: string; className?: string }) {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx.value === value;
  return (
    <button
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-md transition-colors',
        isActive ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value }: { children: React.ReactNode; value: string }) {
  const ctx = React.useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <div>{children}</div>;
}