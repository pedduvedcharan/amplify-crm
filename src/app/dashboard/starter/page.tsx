'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Circle,
  Mail,
  Clock,
  AlertTriangle,
  Send,
} from 'lucide-react'
import PageTransition from '@/components/ui/PageTransition'
import KPICard from '@/components/ui/KPICard'
import LiveAgentFeed from '@/components/feed/LiveAgentFeed'
import StatusBadge from '@/components/ui/StatusBadge'
import { starterCustomers, starterStats, faqQuestions, type Customer } from '@/data/mockData'
import { cn } from '@/lib/utils'

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

const ONBOARDING_STEPS: Array<{ key: keyof NonNullable<Customer['onboardingSteps']>; label: string }> = [
  { key: 'profile', label: 'Profile' },
  { key: 'first_login', label: '1st Login' },
  { key: 'feature_use', label: 'Feature' },
  { key: 'integration', label: 'Integration' },
  { key: 'first_export', label: 'Export' },
]

const stuckEmails: Record<string, { to: string; subject: string; body: string }> = {
  HS002: {
    to: 'mike@agencypro.com',
    subject: 'Quick tip: Try your first feature in 2 minutes',
    body: `Hi Mike,\n\nWe noticed you haven't explored your first feature yet — and we totally get it, getting started can feel like a lot.\n\nHere's a 2-minute shortcut:\n1. Open Dashboard > Campaigns\n2. Click "New Campaign" and choose a template\n3. Hit Send — done!\n\nOver 80% of our users who complete this step say it was their "aha moment."\n\nNeed a hand? Reply to this email or chat with our AI assistant 24/7.\n\nCheers,\nRetainIQ Onboarding Bot`,
  },
  HS005: {
    to: 'priya@healthfirst.com',
    subject: 'We miss you, Priya! Let us help you get started',
    body: `Hi Priya,\n\nIt's been 12 days since your last login and we want to make sure you get the most out of RetainIQ.\n\nWe've set up a personalized onboarding checklist just for HealthFirst:\n- Complete your profile (2 min)\n- Log in and explore the dashboard\n- Try sending a test campaign\n\nWould a 15-minute walkthrough call help? Book one here: [link]\n\nWe're here for you!\n\nBest,\nRetainIQ Onboarding Bot`,
  },
  HS007: {
    to: 'emma@brandcraft.co',
    subject: 'BrandCraft: Your next step to unlock full value',
    body: `Hi Emma,\n\nYou're off to a great start — profile and first login are done!\n\nThe next step is trying your first feature. Here's what other marketing agencies love:\n- Campaign Builder (most popular)\n- Audience Segmentation\n- A/B Testing\n\nPick one and give it a spin. It takes under 5 minutes.\n\nLet us know if you have questions!\n\nBest,\nRetainIQ Onboarding Bot`,
  },
  HS012: {
    to: 'ryan@quickserve.com',
    subject: 'Ryan, let us help you move forward',
    body: `Hi Ryan,\n\nWe see you've been stuck on the feature exploration step for about a week. No worries — here's a quick path forward:\n\n1. Log in to your dashboard\n2. Click "Features" in the sidebar\n3. Try the "Quick Report" — it generates in 30 seconds\n\nWe also have a live workshop this Thursday if you'd like guided help.\n\nReply anytime — we're here to help!\n\nBest,\nRetainIQ Onboarding Bot`,
  },
  HS016: {
    to: 'ben@supplyhub.com',
    subject: 'Ben, a quick win to get you back on track',
    body: `Hi Ben,\n\nLooks like you haven't tried a feature yet — totally normal at this stage.\n\nHere's the fastest way to see value:\n1. Go to Dashboard > Analytics\n2. Click "Generate Sample Report"\n3. See your data come alive!\n\nCustomers who complete this step see 3x more engagement in their first month.\n\nLet me know if you need anything!\n\nBest,\nRetainIQ Onboarding Bot`,
  },
}

function HealthBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-g-green' : score >= 50 ? 'bg-g-yellow' : 'bg-g-red'
  return (
    <div className="flex items-center gap-2.5 flex-1">
      <div className="flex-1 h-2 bg-page rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
      <span
        className={cn(
          'text-[11px] font-bold tabular-nums',
          score >= 70 ? 'text-g-green' : score >= 50 ? 'text-g-yellow' : 'text-g-red'
        )}
      >
        {score}
      </span>
    </div>
  )
}

function AnimatedDots() {
  return (
    <span className="inline-flex">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
          className="text-g-yellow"
        >
          .
        </motion.span>
      ))}
    </span>
  )
}

function FAQProgressCircle({ percentage }: { percentage: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#F0EFEB" strokeWidth="5" />
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#34A853"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-g-green">{percentage}%</span>
      </div>
    </div>
  )
}

export default function StarterPage() {
  const sortedCustomers = useMemo(() => {
    return [...starterCustomers].sort((a, b) => {
      const statusOrder = { stuck: 0, on_track: 1, done: 2 }
      const aOrder = statusOrder[a.onboardingStatus || 'on_track']
      const bOrder = statusOrder[b.onboardingStatus || 'on_track']
      if (aOrder !== bOrder) return aOrder - bOrder
      return a.healthScore - b.healthScore
    })
  }, [])

  const firstStuckCustomer = useMemo(() => {
    return sortedCustomers.find((c) => c.onboardingStatus === 'stuck')
  }, [sortedCustomers])

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    firstStuckCustomer?.id ?? null
  )

  const selectedCustomer = useMemo(() => {
    return starterCustomers.find((c) => c.id === selectedCustomerId) ?? firstStuckCustomer ?? null
  }, [selectedCustomerId, firstStuckCustomer])

  const emailForPreview = selectedCustomer
    ? stuckEmails[selectedCustomer.id] ?? {
        to: selectedCustomer.email,
        subject: selectedCustomer.lastEmailSubject ?? 'Check-in from RetainIQ',
        body: `Hi ${selectedCustomer.name.split(' ')[0]},\n\nJust checking in on your onboarding progress. You're on Day ${selectedCustomer.onboardingDay} and doing great!\n\nHere's what's next on your list. Let us know if you need any help.\n\nBest,\nRetainIQ Onboarding Bot`,
      }
    : null

  const maxFaqCount = Math.max(...faqQuestions.map((q) => q.count))

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* ===== 1. HEADER BANNER ===== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="bg-card rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 border-none relative overflow-hidden"
        >
          <div className="absolute inset-y-0 left-0 w-80 bg-gradient-to-r from-g-green/5 to-transparent pointer-events-none rounded-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-g-green inline-block" />
                Starter Tier
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Agent monitoring 18 customers
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-text-secondary font-medium">Agent Status:</span>
                <div className="flex items-center gap-1.5 bg-g-green/10 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-g-green animate-pulse" />
                  <span className="text-[11px] font-bold text-g-green uppercase tracking-wide">
                    Running
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-text-muted block">Last run</span>
                <span className="text-xs text-text-secondary font-mono">43s ago</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ===== 2. KPI ROW ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={CheckCircle2}
            label="Fully Onboarded"
            value={starterStats.fullyOnboarded}
            sub={`${Math.round((starterStats.fullyOnboarded / 18) * 100)}% completion rate`}
            color="green"
            delay={0}
          />
          <KPICard
            icon={AlertTriangle}
            label="Stuck in Onboarding"
            value={starterStats.stuck}
            sub="Requires AI follow-up"
            color="yellow"
            delay={0.1}
            pulse
          />
          <KPICard
            icon={Mail}
            label="Emails Sent This Week"
            value={starterStats.emailsSentThisWeek}
            sub="Automated by Claude AI"
            color="blue"
            delay={0.2}
          />
          <KPICard
            icon={Clock}
            label="Avg Onboard Time"
            value={starterStats.avgOnboardTime}
            suffix=" days"
            decimals={1}
            sub="Target: 5.0 days"
            color="green"
            delay={0.3}
          />
        </div>

        {/* ===== 3. SPLIT LAYOUT ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-20 gap-4">
          {/* LEFT -- Onboarding Progress Tracker (65%) */}
          <div className="lg:col-span-13">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease }}
              className="bg-card rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 border-none"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-text-primary">
                  Customer Onboarding Tracker
                </h3>
                <span className="text-[10px] text-text-muted bg-page px-3 py-1.5 rounded-full font-mono">
                  Auto-refresh
                </span>
              </div>

              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {sortedCustomers.map((customer, idx) => {
                    const isStuck = customer.onboardingStatus === 'stuck'
                    const isDone = customer.onboardingStatus === 'done'
                    const isSelected = selectedCustomerId === customer.id

                    return (
                      <motion.div
                        key={customer.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.3, ease }}
                        onClick={() => setSelectedCustomerId(customer.id)}
                        className={cn(
                          'rounded-2xl p-4 cursor-pointer transition-all duration-300',
                          isSelected
                            ? 'bg-g-green/5 shadow-card-hover ring-1 ring-g-green/20'
                            : 'bg-white hover:shadow-card border border-gray-100',
                          isStuck && !isSelected && 'border-l-[3px] border-l-g-yellow'
                        )}
                      >
                        {/* Top row: avatar, name, email, day, status */}
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar */}
                            <div
                              className={cn(
                                'w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0',
                                isDone
                                  ? 'bg-g-green/10 text-g-green'
                                  : isStuck
                                    ? 'bg-g-yellow/10 text-g-yellow'
                                    : 'bg-g-blue/10 text-g-blue'
                              )}
                            >
                              {customer.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-text-primary truncate">
                                  {customer.name}
                                </span>
                                <span className="text-[11px] text-text-muted bg-page px-2 py-0.5 rounded-full font-mono">
                                  Day {customer.onboardingDay}
                                </span>
                              </div>
                              <span className="text-[11px] text-text-muted truncate block mt-0.5">
                                {customer.email}
                              </span>
                            </div>
                          </div>

                          {/* Status badge */}
                          <div className="flex-shrink-0">
                            {isDone ? (
                              <StatusBadge variant="success">Done</StatusBadge>
                            ) : isStuck ? (
                              <StatusBadge variant="warning">Stuck</StatusBadge>
                            ) : (
                              <StatusBadge variant="success" pulse>
                                On Track
                              </StatusBadge>
                            )}
                          </div>
                        </div>

                        {/* Health bar */}
                        <div className="flex items-center gap-2.5 mb-3">
                          <span className="text-[10px] text-text-muted w-12 flex-shrink-0 font-medium">
                            Health
                          </span>
                          <HealthBar score={customer.healthScore} />
                        </div>

                        {/* Onboarding step pills */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                          {ONBOARDING_STEPS.map((step) => {
                            const completed = customer.onboardingSteps?.[step.key] ?? false
                            return (
                              <div
                                key={step.key}
                                className={cn(
                                  'flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-medium transition-colors duration-200',
                                  completed
                                    ? 'bg-g-green/10 text-g-green'
                                    : 'bg-page text-text-muted'
                                )}
                              >
                                {completed ? (
                                  <CheckCircle2 size={10} className="flex-shrink-0" />
                                ) : (
                                  <Circle size={10} className="flex-shrink-0" />
                                )}
                                {step.label}
                              </div>
                            )
                          })}
                        </div>

                        {/* Last email info */}
                        {customer.lastEmailSubject && (
                          <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                            <Mail size={10} />
                            <span className="truncate">
                              Last email: &quot;{customer.lastEmailSubject}&quot;
                            </span>
                            {customer.lastEmailTime && (
                              <span className="flex-shrink-0">
                                &middot; {customer.lastEmailTime}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Stuck: agent action banner */}
                        {isStuck && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 bg-g-yellow/10 rounded-2xl px-4 py-2.5 flex items-center gap-2"
                          >
                            <span className="text-[11px]">&#x1F916;</span>
                            <span className="text-[11px] text-g-yellow font-medium">
                              Agent Action: Follow-up email sending now
                              <AnimatedDots />
                            </span>
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* RIGHT -- Stacked Panels (35%) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Panel 1: Email Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease }}
              className="bg-card rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 border-none"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <Mail size={16} className="text-g-blue" />
                  Email Preview
                </h3>
                <div className="flex items-center gap-1.5 bg-g-green/10 px-3 py-1.5 rounded-full">
                  <Send size={10} className="text-g-green" />
                  <span className="text-[10px] font-bold text-g-green uppercase tracking-wide">
                    Sending
                  </span>
                </div>
              </div>

              {emailForPreview && selectedCustomer ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-text-muted uppercase font-medium w-10 flex-shrink-0">
                      To:
                    </span>
                    <span className="text-xs text-text-primary font-mono bg-page px-3 py-1.5 rounded-full">
                      {emailForPreview.to}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-medium block mb-1">
                      Subject:
                    </span>
                    <span className="text-xs text-text-primary font-bold">
                      {emailForPreview.subject}
                    </span>
                  </div>
                  <div className="bg-page rounded-2xl p-4 max-h-52 overflow-y-auto">
                    <pre className="text-[11px] text-text-secondary font-mono whitespace-pre-wrap leading-relaxed">
                      {emailForPreview.body}
                    </pre>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-text-muted font-medium">
                      Written by Claude AI
                    </span>
                    <span className="text-[10px] bg-g-green/10 text-g-green font-bold px-3 py-1 rounded-full">
                      SENDING
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-page rounded-2xl py-8 text-center">
                  <p className="text-xs text-text-muted">
                    Select a customer to preview their email
                  </p>
                </div>
              )}
            </motion.div>

            {/* Panel 2: FAQ Chatbot Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease }}
              className="bg-card rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 border-none"
            >
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-5">
                <span className="w-7 h-7 rounded-2xl bg-g-purple/10 flex items-center justify-center">
                  <span className="text-xs">&#x1F916;</span>
                </span>
                FAQ Chatbot
              </h3>

              {/* Resolution rate + Escalated */}
              <div className="flex items-center gap-5 mb-6">
                <FAQProgressCircle percentage={starterStats.aiResolutionRate} />
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase block font-medium">
                      AI Resolution Rate
                    </span>
                    <span className="text-xl font-extrabold text-g-green tracking-tight">
                      {starterStats.aiResolutionRate}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted uppercase font-medium">Escalated:</span>
                    <span className="text-[10px] font-bold bg-g-red/10 text-g-red px-2.5 py-0.5 rounded-full">
                      {starterStats.escalated}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Questions */}
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-3 font-medium">
                  Top Questions
                </span>
                <div className="space-y-2">
                  {faqQuestions.map((q, i) => (
                    <div key={i} className="relative rounded-2xl overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-g-green/8 rounded-2xl"
                        style={{ width: `${(q.count / maxFaqCount) * 100}%` }}
                      />
                      <div className="relative flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[10px] font-bold text-g-green w-4 flex-shrink-0">
                            {i + 1}.
                          </span>
                          <span className="text-[11px] text-text-primary truncate">
                            {q.question}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-text-secondary bg-page px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                          {q.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ===== 4. LIVE AGENT FEED ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease }}
        >
          <LiveAgentFeed source="starter" />
        </motion.div>
      </div>
    </PageTransition>
  )
}
