import * as React from 'react';
import { cn } from '../../lib/utils';

interface DropdownMenuContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType>({
  open: false,
  onOpenChange: () => {},
});

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, onOpenChange: setOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DropdownMenuContext);
  return (
    <button
      ref={ref}
      className={cn('', className)}
      onClick={(e) => {
        onOpenChange(true);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'end' }
>(({ className, align = 'start', ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(DropdownMenuContext);
  if (!open) return null;

  const handleBackdropClick = () => {
    onOpenChange(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={handleBackdropClick} />
      <div
        ref={ref}
        className={cn(
          'absolute z-50 min-w-[12rem] rounded-md border border-border bg-surface shadow-lg py-1',
          align === 'end' ? 'right-0' : 'left-0',
          className
        )}
        {...props}
      />
    </>
  );
});
DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, onClick, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DropdownMenuContext);
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-surface-variant transition-colors',
        className
      )}
      onClick={(e) => {
        onOpenChange(false);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuSeparator = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('h-px bg-border my-1', className)} {...props} />
);