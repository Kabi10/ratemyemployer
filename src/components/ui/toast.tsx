'use client'

import { Toaster } from 'sonner'
import * as React from 'react'

export type ToastProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: 'default' | 'destructive'
}

export type ToastActionElement = React.ReactElement

export function Toast() {
  return <Toaster richColors />
}

export { toast } from 'sonner'