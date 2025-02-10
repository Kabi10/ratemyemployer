'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast';
import { useToast } from './use-toast';
import type { ToasterToast } from './use-toast';

interface ToasterProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  duration?: number;
}

export function Toaster({
  position = 'top-right',
  duration = 3000,
}: ToasterProps) {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      <ToastViewport />
      {toasts?.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} duration={duration} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
    </ToastProvider>
  );
}
