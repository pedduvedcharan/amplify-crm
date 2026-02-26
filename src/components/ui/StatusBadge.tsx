'use client'
import { cn } from '@/lib/utils'

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'purple'

const styles: Record<Variant, string> = {
  success: 'bg-g-green/10 text-g-green',
  warning: 'bg-g-yellow/10 text-amber-700',
  danger: 'bg-g-red/10 text-g-red',
  info: 'bg-g-blue/10 text-g-blue',
  purple: 'bg-g-purple/10 text-g-purple',
}

export default function StatusBadge({ variant, children, pulse }: { variant: Variant; children: React.ReactNode; pulse?: boolean }) {
  return (
    <span className={cn('text-[10px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 uppercase tracking-wide', styles[variant])}>
      {pulse && <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', variant === 'success' ? 'bg-g-green' : variant === 'danger' ? 'bg-g-red' : variant === 'purple' ? 'bg-g-purple' : variant === 'warning' ? 'bg-amber-500' : 'bg-g-blue')} />}
      {children}
    </span>
  )
}
