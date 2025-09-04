'use client'

import { Toaster as SonnerToaster } from 'sonner'
import * as React from 'react'

export type ToastProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: 'default' | 'destructive'
}

export type ToastActionElement = React.ReactElement

export function Toast() {
  return <SonnerToaster richColors />
}

export { toast } from 'sonner'