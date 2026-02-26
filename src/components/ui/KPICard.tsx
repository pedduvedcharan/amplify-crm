'use client'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  label: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  sub: string
  color: 'blue' | 'red' | 'green' | 'purple' | 'yellow'
  delay?: number
  pulse?: boolean
  gradient?: boolean
}

const colorMap = {
  blue: {
    iconBg: 'bg-gradient-to-br from-[#4285F4]/10 to-[#669DF6]/10',
    iconText: 'text-[#4285F4]',
    valueText: 'text-[#1C1C2E]',
  },
  red: {
    iconBg: 'bg-gradient-to-br from-[#F2766B]/15 to-[#F5576C]/10',
    iconText: 'text-[#F2766B]',
    valueText: 'text-[#1C1C2E]',
  },
  green: {
    iconBg: 'bg-gradient-to-br from-[#34A853]/10 to-[#81C995]/10',
    iconText: 'text-[#34A853]',
    valueText: 'text-[#1C1C2E]',
  },
  purple: {
    iconBg: 'bg-gradient-to-br from-[#A142F4]/10 to-[#C58AF9]/10',
    iconText: 'text-[#A142F4]',
    valueText: 'text-[#1C1C2E]',
  },
  yellow: {
    iconBg: 'bg-gradient-to-br from-[#FBBC04]/15 to-[#FDD663]/10',
    iconText: 'text-[#E8A000]',
    valueText: 'text-[#1C1C2E]',
  },
}

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

export default function KPICard({ icon: Icon, label, value, prefix = '', suffix = '', decimals = 0, sub, color, delay = 0, pulse, gradient }: Props) {
  const c = colorMap[color]

  if (gradient) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5, ease }}
        className="rounded-3xl p-6 bg-gradient-to-br from-[#F97794] via-[#F5576C] to-[#F2766B] text-white relative overflow-hidden shadow-card-hover"
      >
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/[0.08] rounded-full -translate-y-14 translate-x-14" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/[0.05] rounded-full translate-y-10 -translate-x-10" />
        <p className="text-[13px] font-medium text-white/80 mb-1.5">{label}</p>
        <div className="text-[38px] font-extrabold tracking-tight leading-none mb-3">
          <CountUp start={0} end={value} duration={1.5} delay={delay} prefix={prefix} suffix={suffix} decimals={decimals} separator="," />
        </div>
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-white/50" />
          <span className="text-[12px] text-white/60 font-medium">{sub}</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease }}
      className="bg-card rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', c.iconBg)}>
          <Icon size={18} className={cn(c.iconText, pulse && 'animate-pulse')} />
        </div>
      </div>
      <div className={cn('text-[32px] font-extrabold tracking-tight leading-none mb-1', c.valueText)}>
        <CountUp start={0} end={value} duration={1.5} delay={delay} prefix={prefix} suffix={suffix} decimals={decimals} separator="," />
      </div>
      <p className="text-[13px] font-medium text-text-secondary mb-0.5">{label}</p>
      <span className="text-[11px] text-text-muted">{sub}</span>
    </motion.div>
  )
}
