'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import {
  Activity,
  TrendingUp,
  Mail,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  DollarSign,
  Calendar,
  Wrench,
  Clock,
  Send,
  CheckCircle2,
  Bot,
} from 'lucide-react'
import PageTransition from '@/components/ui/PageTransition'
import KPICard from '@/components/ui/KPICard'
import LiveAgentFeed from '@/components/feed/LiveAgentFeed'
import StatusBadge from '@/components/ui/StatusBadge'
import { professionalCustomers, professionalStats, type Customer } from '@/data/mockData'
import { cn } from '@/lib/utils'

// --- Claude AI Insights ---
const aiInsights: Record<string, string> = {
  HP001: 'John has used 9/12 features and logs in daily. His team expanded 2x last quarter -- strong Enterprise upgrade candidate.',
  HP002: 'Amy\'s engagement dropped sharply after week 3. She hasn\'t explored integrations and has 5 open tickets. Immediate re-engagement needed.',
  HP003: 'Rachel\'s team consistently uses 8 features with zero support tickets. She is a textbook upsell candidate for Enterprise.',
  HP004: 'Sam\'s team adopted 7 features in 5 months and just added 2 new users. Growing usage signals Enterprise readiness.',
  HP005: 'Diana\'s e-commerce team leverages 7 features across 51+ employees. High-value account with clear Enterprise fit.',
  HP006: 'Tom\'s financial services team uses 6 features. Moderate engagement -- nurture before Enterprise pitch.',
  HP007: 'Jessica\'s login frequency dropped from 4.2 to 1.1/week. Feature usage declining. Risk of churn within 30 days.',
  HP008: 'Kevin\'s team uses 8 features with 5 integrations. 9 months on plan with zero tickets -- prime upsell opportunity.',
  HP014: 'Brian\'s retail team engagement is declining. Only 4/12 features used after 2 months. Needs guided onboarding refresh.',
}

// --- Upsell email templates ---
const upsellEmails: Record<string, { to: string; subject: string; body: string }> = {
  HP001: {
    to: 'john@techcorp.com',
    subject: 'You\'re ready for more, John',
    body: 'Hi John,\n\nYour team has been crushing it on Professional -- 9 of 12 features used this month, daily logins, and 6 active integrations.\n\nCustomers like TechCorp typically unlock 3x more value on Enterprise with API access, SSO, and dedicated support.\n\nWould you be open to a quick 15-min call this week to explore what Enterprise could look like for your team?\n\nBest,\nRetainIQ AI Agent',
  },
  HP003: {
    to: 'rachel@momentum.co',
    subject: 'Momentum Co is ready for Enterprise',
    body: 'Hi Rachel,\n\nYour team has been a model Professional customer -- 8 features, 5 integrations, and zero support tickets in 8 months.\n\nEnterprise would give you priority support, advanced analytics, and custom integrations your team has been requesting.\n\nLet me know if you\'d like to see a personalized ROI analysis.\n\nBest,\nRetainIQ AI Agent',
  },
  HP004: {
    to: 'sam@buildfast.io',
    subject: 'BuildFast is growing -- time for Enterprise?',
    body: 'Hi Sam,\n\nBuildFast has grown significantly on Professional -- 7 features adopted in just 5 months with steady login growth.\n\nEnterprise tier would support your scaling needs with unlimited integrations and team management tools.\n\nHappy to walk through the upgrade path whenever works for you.\n\nBest,\nRetainIQ AI Agent',
  },
}

// --- Sorted customers: at-risk first, then upsell-ready, then rest ---
const sortedCustomers = [...professionalCustomers].sort((a, b) => {
  const aRisk = a.churnRisk > 50 ? 0 : a.upsellReady ? 1 : 2
  const bRisk = b.churnRisk > 50 ? 0 : b.upsellReady ? 1 : 2
  if (aRisk !== bRisk) return aRisk - bRisk
  return b.churnRisk - a.churnRisk
})

const upsellReadyCustomers = professionalCustomers.filter(c => c.upsellReady)
const atRiskCustomers = professionalCustomers.filter(c => c.churnRisk > 50)

// --- Pipeline stages ---
const readyToSend = upsellReadyCustomers.filter(c => c.id === 'HP001' || c.id === 'HP003' || c.id === 'HP004' || c.id === 'HP008')
const sentAwaiting = [
  { name: 'Diana Ross', company: 'QuickScale', value: 10800 },
  { name: 'Tom Walsh', company: 'NextLevel', value: 7400 },
]
const monitoringCount = professionalCustomers.length - upsellReadyCustomers.length - atRiskCustomers.length

// --- Donut data ---
const emailDonutData = [
  { name: 'Sent', value: professionalStats.monthlySent, color: '#4285F4' },
  { name: 'Pending', value: professionalStats.monthlyPending, color: '#9AA0A6' },
]

// --- Health label helper ---
function healthLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'EXCELLENT', color: 'text-g-green' }
  if (score >= 60) return { label: 'GOOD', color: 'text-g-blue' }
  if (score >= 40) return { label: 'AT RISK', color: 'text-g-yellow' }
  return { label: 'CRITICAL', color: 'text-g-red' }
}

function healthBarColor(score: number): string {
  if (score >= 80) return 'bg-g-green'
  if (score >= 60) return 'bg-g-blue'
  if (score >= 40) return 'bg-g-yellow'
  return 'bg-g-red'
}

function churnGradient(risk: number): string {
  if (risk >= 70) return 'from-g-red to-g-red'
  if (risk >= 50) return 'from-g-yellow to-g-red'
  if (risk >= 30) return 'from-g-green via-g-yellow to-g-red'
  return 'from-g-green to-g-green'
}

function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

// --- Framer motion ease ---
const smoothEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

// --- Custom donut tooltip ---
function DonutTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload || !payload.length) return null
  const item = payload[0]
  return (
    <div className="bg-card rounded-2xl px-4 py-3 shadow-card-hover border border-gray-100">
      <p className="text-xs font-semibold text-text-primary">{item.name}</p>
      <p className="text-lg font-extrabold tracking-tight" style={{ color: item.payload.color }}>{item.value}</p>
    </div>
  )
}

export default function ProfessionalPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const firstUpsellCustomer = upsellReadyCustomers[0]
  const displayEmail = selectedCustomer && upsellEmails[selectedCustomer.id]
    ? upsellEmails[selectedCustomer.id]
    : upsellEmails[firstUpsellCustomer?.id ?? 'HP001']

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* ====== 1. HEADER BANNER ====== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: smoothEase }}
          className="bg-card rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden relative"
        >
          {/* Blue accent left edge */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-3xl bg-gradient-to-b from-g-blue to-g-blue/40" />
          <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-g-blue/5 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-text-primary flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-g-blue" />
                Professional Tier
              </h1>
              <p className="text-sm text-text-secondary mt-1.5">
                Agent monitoring <span className="font-semibold text-text-primary">22 customers</span> &mdash;{' '}
                <span className="font-semibold text-g-blue">$48,200 upsell pipeline</span>
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-text-secondary">Agent Status:</span>
                <div className="flex items-center gap-1.5 bg-g-blue/10 text-g-blue px-3.5 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-g-blue animate-pulse" />
                  <span className="text-[11px] font-bold uppercase">Running</span>
                </div>
              </div>
              <div className="text-xs text-text-muted">
                Last run: <span className="text-text-secondary font-medium">1m ago</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ====== 2. KPI ROW ====== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={Activity}
            label="Avg Health Score"
            value={professionalStats.avgHealth}
            suffix="%"
            sub="across 22 professional accounts"
            color="blue"
            delay={0}
          />
          <KPICard
            icon={TrendingUp}
            label="Upsell Ready"
            value={professionalStats.upsellReady}
            sub="customers ready for Enterprise"
            color="green"
            delay={0.1}
            pulse
          />
          <KPICard
            icon={Mail}
            label="Monthly Emails Sent"
            value={professionalStats.monthlyEmailsSent}
            sub="auto-generated by Claude AI"
            color="blue"
            delay={0.2}
          />
          <KPICard
            icon={AlertTriangle}
            label="At Risk"
            value={professionalStats.atRisk}
            sub="churn risk > 50% detected"
            color="red"
            delay={0.3}
            pulse
          />
        </div>

        {/* ====== 3. ROW 2 -- 58/42 SPLIT ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT -- Customer Health Cards (58%) */}
          <div className="lg:col-span-7">
            <div className="bg-card rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <div className="w-8 h-8 rounded-2xl bg-g-blue/10 flex items-center justify-center">
                    <Activity size={16} className="text-g-blue" />
                  </div>
                  Customer Health Monitor
                </h2>
                <StatusBadge variant="info" pulse>
                  {professionalCustomers.length} Accounts
                </StatusBadge>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                {sortedCustomers.map((customer, idx) => {
                  const hl = healthLabel(customer.healthScore)
                  const isAtRisk = customer.churnRisk > 50
                  const isUpsell = !!customer.upsellReady
                  const insight = aiInsights[customer.id]

                  return (
                    <motion.div
                      key={customer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3, ease: smoothEase }}
                      onClick={() => setSelectedCustomer(customer)}
                      className={cn(
                        'rounded-2xl border border-gray-100 p-4 cursor-pointer transition-all duration-300',
                        selectedCustomer?.id === customer.id
                          ? 'border-g-blue/40 bg-g-blue/5 shadow-card-hover'
                          : 'bg-card hover:shadow-card',
                        isAtRisk && 'border-l-[3px] border-l-g-red',
                        isUpsell && !isAtRisk && 'border-l-[3px] border-l-g-green'
                      )}
                    >
                      {/* Top: Avatar + Name + Company + Months */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                          isAtRisk ? 'bg-g-red/10 text-g-red' : isUpsell ? 'bg-g-green/10 text-g-green' : 'bg-g-blue/10 text-g-blue'
                        )}>
                          {initials(customer.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-text-primary truncate">{customer.name}</span>
                            <span className="text-[10px] text-text-muted truncate">{customer.company}</span>
                          </div>
                          <span className="text-[10px] text-text-muted">
                            Pro {customer.monthsOnPlan ?? 0} months
                          </span>
                        </div>
                        <div className="shrink-0">
                          <ChevronRight size={14} className="text-text-muted" />
                        </div>
                      </div>

                      {/* Health bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-text-muted">Health Score</span>
                          <div className="flex items-center gap-1.5">
                            <span className={cn('text-xs font-bold', hl.color)}>{customer.healthScore}%</span>
                            <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full', hl.color,
                              customer.healthScore >= 80 ? 'bg-g-green/10' :
                              customer.healthScore >= 60 ? 'bg-g-blue/10' :
                              customer.healthScore >= 40 ? 'bg-g-yellow/10' : 'bg-g-red/10'
                            )}>
                              {hl.label}
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-page rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${customer.healthScore}%` }}
                            transition={{ delay: idx * 0.03 + 0.2, duration: 0.8, ease: smoothEase }}
                            className={cn('h-full rounded-full', healthBarColor(customer.healthScore))}
                          />
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-4 mb-3 text-[11px] text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} className="text-text-muted" />
                          {customer.loginsPerWeek}/wk
                        </span>
                        <span className="flex items-center gap-1">
                          <Wrench size={10} className="text-text-muted" />
                          Features {customer.featuresUsed}/{customer.totalFeatures}
                        </span>
                        <span className="flex items-center gap-1">
                          {customer.loginsPerWeek >= 3 ? (
                            <ArrowUpRight size={10} className="text-g-green" />
                          ) : (
                            <ArrowDownRight size={10} className="text-g-red" />
                          )}
                          <span className={customer.loginsPerWeek >= 3 ? 'text-g-green' : 'text-g-red'}>
                            {customer.loginsPerWeek >= 3 ? 'Trending up' : 'Declining'}
                          </span>
                        </span>
                      </div>

                      {/* Churn risk gradient bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-text-muted">Churn Risk</span>
                          <span className={cn(
                            'text-[10px] font-bold',
                            customer.churnRisk >= 50 ? 'text-g-red' : customer.churnRisk >= 30 ? 'text-g-yellow' : 'text-g-green'
                          )}>
                            {customer.churnRisk}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-page rounded-full overflow-hidden relative">
                          <div className={cn('absolute inset-0 bg-gradient-to-r', churnGradient(customer.churnRisk), 'opacity-15 rounded-full')} />
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${customer.churnRisk}%` }}
                            transition={{ delay: idx * 0.03 + 0.4, duration: 0.8, ease: smoothEase }}
                            className={cn(
                              'h-full rounded-full bg-gradient-to-r',
                              churnGradient(customer.churnRisk)
                            )}
                          />
                        </div>
                      </div>

                      {/* Upsell Ready Banner */}
                      {isUpsell && !isAtRisk && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ delay: 0.3, ease: smoothEase }}
                          className="mt-3 bg-g-green/5 border border-g-green/15 rounded-2xl p-3.5"
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <DollarSign size={12} className="text-g-green" />
                            <span className="text-[11px] font-bold text-g-green uppercase">Upsell Ready</span>
                            {customer.upsellValue && (
                              <span className="text-[10px] text-g-green/80 ml-auto font-mono">
                                +${customer.upsellValue.toLocaleString()}/yr
                              </span>
                            )}
                          </div>
                          {insight && (
                            <p className="text-[10px] text-text-secondary italic leading-relaxed mb-1.5">
                              <Bot size={9} className="inline text-g-blue mr-1" />
                              &ldquo;{insight}&rdquo; &mdash; Claude AI
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 text-[10px] text-g-green">
                            <Mail size={9} />
                            <span>Upsell email: <span className="font-bold">QUEUED</span></span>
                          </div>
                        </motion.div>
                      )}

                      {/* At Risk Banner */}
                      {isAtRisk && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ delay: 0.3, ease: smoothEase }}
                          className="mt-3 bg-g-red/5 border border-g-red/15 rounded-2xl p-3.5"
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <AlertTriangle size={12} className="text-g-red" />
                            <span className="text-[11px] font-bold text-g-red uppercase">At Risk</span>
                            <span className="text-[10px] text-g-red/80 ml-auto font-mono">
                              {customer.churnRisk}% churn
                            </span>
                          </div>
                          {insight && (
                            <p className="text-[10px] text-text-secondary italic leading-relaxed mb-1.5">
                              <Bot size={9} className="inline text-g-blue mr-1" />
                              &ldquo;{insight}&rdquo; &mdash; Claude AI
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 text-[10px] text-g-red">
                            <Send size={9} />
                            <span>Re-engagement email: <span className="font-bold animate-pulse">SENDING NOW</span></span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT -- Upsell Pipeline + Email Preview (42%) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Pipeline Card */}
            <div className="bg-card rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-2xl bg-g-blue/10 flex items-center justify-center">
                  <DollarSign size={16} className="text-g-blue" />
                </div>
                <h2 className="text-base font-semibold text-text-primary">Upsell Pipeline</h2>
              </div>

              {/* Large value */}
              <div className="text-center mb-6">
                <div className="text-3xl font-extrabold tracking-tight text-g-blue">
                  $<CountUp start={0} end={48200} duration={2} separator="," />
                </div>
                <p className="text-xs text-text-muted mt-1">/year potential ARR</p>
              </div>

              {/* Pipeline Stages */}
              <div className="space-y-4">
                {/* READY TO SEND */}
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-g-green" />
                    <span className="text-[11px] font-bold text-g-green uppercase tracking-wider">Ready to Send</span>
                    <span className="text-[10px] text-text-muted ml-auto">{readyToSend.length} customers</span>
                  </div>
                  <div className="space-y-2">
                    {readyToSend.map((c, i) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, ease: smoothEase }}
                        className="flex items-center justify-between bg-g-green/5 rounded-2xl px-3.5 py-2.5 border-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-g-green/10 text-g-green flex items-center justify-center text-[9px] font-bold">
                            {initials(c.name)}
                          </div>
                          <div>
                            <span className="text-xs font-medium text-text-primary">{c.name}</span>
                            <span className="text-[10px] text-text-muted ml-1.5">{c.company}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-g-green">${(c.upsellValue || 0).toLocaleString()}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* SENT / AWAITING */}
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-g-blue" />
                    <span className="text-[11px] font-bold text-g-blue uppercase tracking-wider">Sent / Awaiting</span>
                    <span className="text-[10px] text-text-muted ml-auto">{sentAwaiting.length} customers</span>
                  </div>
                  <div className="space-y-2">
                    {sentAwaiting.map((c, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, ease: smoothEase }}
                        className="flex items-center justify-between bg-g-blue/5 rounded-2xl px-3.5 py-2.5 border-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-g-blue/10 text-g-blue flex items-center justify-center text-[9px] font-bold">
                            {initials(c.name)}
                          </div>
                          <div>
                            <span className="text-xs font-medium text-text-primary">{c.name}</span>
                            <span className="text-[10px] text-text-muted ml-1.5">{c.company}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-g-blue">${c.value.toLocaleString()}</span>
                          <Clock size={10} className="text-text-muted" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* MONITORING */}
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-text-muted" />
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Monitoring</span>
                  </div>
                  <div className="bg-page rounded-2xl px-4 py-3.5 border-none">
                    <p className="text-xs text-text-secondary mb-2.5">
                      <span className="font-semibold text-text-primary">{monitoringCount} customers</span> &mdash; avg usage 51%
                    </p>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-text-muted">Progress toward 65% upsell threshold</span>
                        <span className="text-[10px] text-text-muted">51 / 65%</span>
                      </div>
                      <div className="h-2 bg-card rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '78%' }}
                          transition={{ delay: 0.5, duration: 1.2, ease: smoothEase }}
                          className="h-full rounded-full bg-gradient-to-r from-text-muted/60 to-g-blue/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Preview Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, ease: smoothEase }}
              className="bg-card rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-2xl bg-g-blue/10 flex items-center justify-center">
                  <Mail size={16} className="text-g-blue" />
                </div>
                <h3 className="text-base font-semibold text-text-primary">Email Preview</h3>
                <StatusBadge variant="info" pulse>AI Generated</StatusBadge>
              </div>

              <div className="bg-page rounded-2xl p-4 space-y-3 border-none">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted w-12">To:</span>
                  <span className="text-xs text-text-primary font-mono">{displayEmail.to}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted w-12">Subject:</span>
                  <span className="text-xs text-text-primary font-semibold">{displayEmail.subject}</span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-[11px] text-text-secondary font-mono leading-relaxed whitespace-pre-line">
                    {displayEmail.body}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                    <Bot size={10} className="text-g-blue" />
                    Written by Claude AI
                  </div>
                  <div className="flex items-center gap-1.5 bg-g-blue/10 text-g-blue rounded-full px-3 py-1 text-[10px] font-bold">
                    <Clock size={10} />
                    QUEUED &mdash; sending in 4 min
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ====== 4. ROW 3 -- 60/40 SPLIT ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT -- Live Agent Feed (60%) */}
          <div className="lg:col-span-3">
            <LiveAgentFeed source="professional" />
          </div>

          {/* RIGHT -- Monthly Email Status (40%) */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, ease: smoothEase }}
              className="bg-card rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-2xl bg-g-blue/10 flex items-center justify-center">
                  <Calendar size={16} className="text-g-blue" />
                </div>
                <h3 className="text-base font-semibold text-text-primary">Monthly Summaries &mdash; Feb 2026</h3>
              </div>

              {/* Mini Donut */}
              <div className="relative h-44 mb-4">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={emailDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={68}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {emailDonutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-extrabold tracking-tight text-text-primary">{professionalStats.monthlyTotal}</span>
                  <span className="text-[10px] text-text-muted">total</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-g-blue" />
                  <span className="text-[11px] text-text-secondary font-medium">Sent ({professionalStats.monthlySent})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-text-muted" />
                  <span className="text-[11px] text-text-secondary font-medium">Pending ({professionalStats.monthlyPending})</span>
                </div>
              </div>

              {/* Status rows */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between px-4 py-2.5 bg-page rounded-2xl border-none">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-g-green" />
                    <span className="text-xs text-text-primary font-medium">Sent</span>
                  </div>
                  <span className="text-xs font-bold text-g-green">{professionalStats.monthlySent}/{professionalStats.monthlyTotal}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 bg-page rounded-2xl border-none">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-g-yellow" />
                    <span className="text-xs text-text-primary font-medium">Pending</span>
                  </div>
                  <span className="text-xs font-bold text-g-yellow">{professionalStats.monthlyPending}/{professionalStats.monthlyTotal}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 bg-page rounded-2xl border-none">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-g-green" />
                    <span className="text-xs text-text-primary font-medium">Failed</span>
                  </div>
                  <span className="text-xs font-bold text-g-green">0/{professionalStats.monthlyTotal}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                  <Calendar size={11} className="text-text-muted" />
                  Next batch: <span className="font-semibold text-text-primary">Mar 1</span> (auto)
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                  <Bot size={10} className="text-g-blue" />
                  All written by Claude AI
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </PageTransition>
  )
}
