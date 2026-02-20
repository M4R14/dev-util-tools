import React from 'react';
import { AlertTriangle, CheckCircle2, Info, LoaderCircle, X, XCircle } from 'lucide-react';
import { Toaster as Sonner } from 'sonner';
import { cn } from '../../lib/utils';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({
  className,
  toastOptions,
  icons,
  ...props
}: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      position="top-right"
      richColors
      expand
      visibleToasts={4}
      closeButton
      swipeDirections={['right', 'top']}
      offset={{ top: 16, right: 16, bottom: 16, left: 16 }}
      mobileOffset={{ top: 12, right: 12, bottom: 12, left: 12 }}
      containerAriaLabel="Notifications"
      className={cn('toaster group', className)}
      icons={{
        success: <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />,
        info: <Info className="size-4 text-sky-500" aria-hidden="true" />,
        warning: <AlertTriangle className="size-4 text-amber-500" aria-hidden="true" />,
        error: <XCircle className="size-4 text-rose-500" aria-hidden="true" />,
        loading: <LoaderCircle className="size-4 text-indigo-500 animate-spin" aria-hidden="true" />,
        close: <X className="size-3.5" aria-hidden="true" />,
        ...icons,
      }}
      toastOptions={{
        duration: 4200,
        closeButtonAriaLabel: 'Dismiss notification',
        ...toastOptions,
        classNames: {
          toast: cn(
            'group toast group-[.toaster]:w-[calc(100vw-1rem)] sm:group-[.toaster]:w-[24rem] group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:bg-background/95 group-[.toaster]:text-foreground group-[.toaster]:shadow-xl group-[.toaster]:backdrop-blur-md group-[.toaster]:overflow-hidden',
            toastOptions?.classNames?.toast,
          ),
          content: cn(
            'group-[.toast]:p-0 group-[.toast]:px-4 group-[.toast]:py-3.5 group-[.toast]:gap-3',
            toastOptions?.classNames?.content,
          ),
          title: cn(
            'group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:tracking-tight',
            toastOptions?.classNames?.title,
          ),
          description: cn(
            'group-[.toast]:mt-1 group-[.toast]:text-xs group-[.toast]:leading-relaxed group-[.toast]:text-muted-foreground',
            toastOptions?.classNames?.description,
          ),
          icon: cn(
            'group-[.toast]:size-4 group-[.toast]:mt-0.5 group-[.toast]:shrink-0',
            toastOptions?.classNames?.icon,
          ),
          closeButton: cn(
            'group-[.toast]:left-auto group-[.toast]:right-3 group-[.toast]:top-3 group-[.toast]:border group-[.toast]:border-border/70 group-[.toast]:bg-background/80 group-[.toast]:text-muted-foreground group-[.toast]:transition-colors group-[.toast]:hover:bg-muted group-[.toast]:hover:text-foreground',
            toastOptions?.classNames?.closeButton,
          ),
          actionButton: cn(
            'group-[.toast]:h-8 group-[.toast]:rounded-md group-[.toast]:bg-primary group-[.toast]:px-3 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:text-primary-foreground',
            toastOptions?.classNames?.actionButton,
          ),
          cancelButton: cn(
            'group-[.toast]:h-8 group-[.toast]:rounded-md group-[.toast]:border group-[.toast]:border-border group-[.toast]:bg-muted group-[.toast]:px-3 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:text-muted-foreground',
            toastOptions?.classNames?.cancelButton,
          ),
          success: cn(
            'group-[.toast]:border-emerald-500/35 group-[.toast]:bg-emerald-500/[0.07]',
            toastOptions?.classNames?.success,
          ),
          info: cn(
            'group-[.toast]:border-sky-500/35 group-[.toast]:bg-sky-500/[0.07]',
            toastOptions?.classNames?.info,
          ),
          warning: cn(
            'group-[.toast]:border-amber-500/35 group-[.toast]:bg-amber-500/[0.08]',
            toastOptions?.classNames?.warning,
          ),
          error: cn(
            'group-[.toast]:border-rose-500/35 group-[.toast]:bg-rose-500/[0.07]',
            toastOptions?.classNames?.error,
          ),
          loading: cn(
            'group-[.toast]:border-indigo-500/35 group-[.toast]:bg-indigo-500/[0.07]',
            toastOptions?.classNames?.loading,
          ),
          default: cn(
            'group-[.toast]:border-border group-[.toast]:bg-background/95',
            toastOptions?.classNames?.default,
          ),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
