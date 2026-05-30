import * as React from 'react';
import { cn } from '../../lib/utils';

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType>({
  open: false,
  onOpenChange: () => {},
});

function Dialog({ children, open: controlledOpen, onOpenChange }: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const handleOpenChange = onOpenChange ?? setInternalOpen;

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => handleOpenChange(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {children}
          </div>
        </>
      )}
    </DialogContext.Provider>
  );
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, ...props }, ref) => {
    const { onOpenChange } = React.useContext(DialogContext);
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
  }
);
DialogTrigger.displayName = 'DialogTrigger';

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open } = React.useContext(DialogContext);
    if (!open) return null;
    return (
      <div
        ref={ref}
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-surface p-6 shadow-lg rounded-lg',
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);

const DialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
);

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };