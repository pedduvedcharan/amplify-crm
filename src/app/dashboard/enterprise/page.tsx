'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import {
  Building2,
  AlertTriangle,
  Shield,
  Activity,
  FileText,
  TrendingDown,
  Clock,
  CalendarCheck,
  BarChart3,
  ExternalLink,
  Cpu,
  Headphones,
  Zap,
  Bot,
  Loader2,
} from 'lucide-react'

import PageTransition from '@/components/ui/PageTransition'
import KPICard from '@/components/ui/KPICard'
import LiveAgentFeed from '@/components/feed/LiveAgentFeed'
import StatusBadge from '@/components/ui/StatusBadge'
import { cn, formatCurrency } from '@/lib/utils'

// -- Types --------------------------------------------------------------------

interface MappedCustomer {
  id: string
  name: string
  email: string
  company: string
  tier: string
  healthScore: number
  churnRisk: number
  loginsPerWeek: number
  featuresUsed: number
  totalFeatures: number
  daysSinceLogin: number
  supportTickets: number
  apiCalls: number
  apiTrend: number
  arr: number
  lastLogin: string
  onboardingStatus?: string
  onboardingDay?: number
  upsellReady?: boolean
  upsellValue?: number | null
}

// -- SWR fetcher --------------------------------------------------------------

const fetcher = (url: string) => fetch(url).then(r => r.json())

// -- Hardcoded weekly report summary (previously from mockData) ---------------

const weeklyReportSummary = `This week's enterprise portfolio shows concerning signals from 2 accounts. Acme Corp represents the highest churn risk at $380K ARR \u2014 login frequency declined 91%, with only 2 of 15 features remaining active. Immediate executive escalation recommended. Globex ($290K ARR) also shows HIGH risk with a 14-day login gap and declining API usage. Remaining 8 accounts are stable or improving, with Hooli and Apex Industries showing the strongest engagement metrics.`

// -- Helpers ------------------------------------------------------------------

function riskLevel(churnRisk: number) {
  if (churnRisk > 80) return { label: 'CRITICAL', bg: 'bg-churn-critical', text: 'text-churn-critical', variant: 'danger' as const }
  if (churnRisk > 60) return { label: 'HIGH', bg: 'bg-churn-high', text: 'text-churn-high', variant: 'warning' as const }
  if (churnRisk > 30) return { label: 'MEDIUM', bg: 'bg-churn-medium', text: 'text-churn-medium', variant: 'warning' as const }
  return { label: 'LOW', bg: 'bg-churn-low', text: 'text-churn-low', variant: 'success' as const }
}

function riskBarGradient(churnRisk: number) {
  if (churnRisk > 80) return 'from-churn-critical to-red-700'
  if (churnRisk > 60) return 'from-churn-high to-orange-600'
  if (churnRisk > 30) return 'from-churn-medium to-yellow-600'
  return 'from-churn-low to-green-600'
}

function riskTint(churnRisk: number) {
  if (churnRisk > 80) return 'bg-g-red/5 border border-g-red/15'
  if (churnRisk > 60) return 'bg-orange-50 border border-orange-200/50'
  if (churnRisk > 30) return 'bg-yellow-50/60 border border-yellow-200/50'
  return 'bg-g-green/5 border border-g-green/15'
}

// Dynamic color palette for company avatars
const avatarColors = [
  '#EA4335', '#F29900', '#4285F4', '#FBBC04', '#34A853',
  '#9334E6', '#4285F4', '#F29900', '#34A853', '#9334E6',
]

function getCompanyColor(company: string, index: number): string {
  return avatarColors[index % avatarColors.length]
}

function getInitials(company: string) {
  return company
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// Generate fake 30-day activity data for critical accounts (dramatic decline)
function generateDecliningChart(severity: 'critical' | 'high') {
  return Array.from({ length: 30 }, (_, i) => {
    const base = severity === 'critical' ? 85 : 70
    const decay = severity === 'critical' ? 0.08 : 0.05
    const noise = (Math.random() - 0.5) * 10
    const value = Math.max(2, base * Math.exp(-decay * i) + noise)
    return { day: i + 1, usage: Math.round(value) }
  })
}

const criticalChartData = generateDecliningChart('critical')
const highChartData = generateDecliningChart('high')

// Shared motion ease
const smoothEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

// Light-theme tooltip style
const chartTooltipStyle = {
  background: '#fff',
  border: '1px solid #E8E8E4',
  borderRadius: '12px',
  fontSize: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

// -- Page Component -----------------------------------------------------------

export default function EnterprisePage() {
  const [selectedCustomer, setSelectedCustomer] = useState<MappedCustomer | null>(null)

  const { data, isLoading } = useSWR('/api/customers/enterprise', fetcher, { refreshInterval: 30000 })

  // Map BigQuery snake_case fields to camelCase + derive enterprise-specific fields
  const customers: MappedCustomer[] = useMemo(() => {
    if (!data?.customers) return []
    return data.customers.slice(0, 10).map((c: any) => ({
      ...c,
      healthScore: c.health_score,
      churnRisk: c.churn_risk,
      loginsPerWeek: c.logins_per_week,
      featuresUsed: c.features_used,
      totalFeatures: c.total_features,
      daysSinceLogin: c.days_since_last_login,
      supportTickets: c.support_tickets,
      apiCalls: Math.floor(c.logins_per_week * 500),
      apiTrend: c.churn_risk > 50 ? -Math.floor(c.churn_risk) : Math.floor(c.health_score / 4),
      arr: c.arr,
      company: c.company?.split(' - ')[0] || c.company,
      lastLogin: c.last_login ? formatRelativeDate(c.last_login) : 'N/A',
    }))
  }, [data])

  // Top 2 customers by churn_risk for the critical section
  const criticalCustomers = useMemo(() => {
    return [...customers].sort((a, b) => b.churnRisk - a.churnRisk).slice(0, 2)
  }, [customers])

  // Stats from API
  const totalARR = data?.stats?.total_arr ?? 0
  const criticalRiskCount = data?.stats?.critical_risk ?? 0
  const avgLoginFreq = data?.stats?.avg_login_freq ?? 0
  const totalAccounts = data?.stats?.total ?? 0

  // Loading state
  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 size={40} className="animate-spin text-g-purple" />
          <p className="text-sm text-text-secondary font-medium">Loading enterprise data from BigQuery...</p>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* ================================================================ */}
        {/* 1. HEADER                                                        */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: smoothEase }}
          className="relative overflow-hidden bg-card rounded-3xl shadow-card"
        >
          {/* Purple accent bar on left edge */}
          <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-g-purple to-purple-700 rounded-l-3xl" />
          {/* Very subtle purple gradient wash */}
          <div className="absolute inset-0 bg-gradient-to-r from-g-purple/[0.04] via-transparent to-transparent pointer-events-none" />

          <div className="relative flex items-center justify-between px-8 py-6">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-9 h-9 rounded-2xl bg-g-purple/10 flex items-center justify-center">
                  <Building2 size={18} className="text-g-purple" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
                  Enterprise Tier
                </h1>
              </div>
              <p className="text-sm text-text-secondary ml-12">
                {totalAccounts.toLocaleString()} accounts &mdash; {formatCurrency(totalARR)} ARR under 24/7 AI monitoring
              </p>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5 bg-g-purple/8 px-4 py-2.5 rounded-full">
                <span className="text-xs text-text-secondary font-medium">Agent Status</span>
                <span className="w-2 h-2 rounded-full bg-g-purple animate-pulse" />
                <span className="text-xs font-bold text-g-purple uppercase tracking-wide">Running</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-text-muted block">Last run</span>
                <span className="text-xs font-mono text-g-purple font-semibold">18s ago</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ================================================================ */}
        {/* 2. KPI ROW                                                       */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={Building2}
            label="Total ARR"
            value={totalARR >= 1_000_000 ? +(totalARR / 1_000_000).toFixed(1) : totalARR}
            prefix="$"
            suffix={totalARR >= 1_000_000 ? 'M' : ''}
            decimals={totalARR >= 1_000_000 ? 1 : 0}
            sub="Combined enterprise portfolio value"
            color="purple"
            delay={0}
          />
          <KPICard
            icon={AlertTriangle}
            label="Critical Risk"
            value={criticalRiskCount}
            sub="Accounts requiring immediate action"
            color="red"
            delay={0.1}
            pulse
          />
          <KPICard
            icon={Activity}
            label="Avg Login Frequency"
            value={avgLoginFreq}
            suffix="x/wk"
            decimals={1}
            sub="Across all enterprise accounts"
            color="purple"
            delay={0.2}
          />
          <KPICard
            icon={FileText}
            label="Reports Sent"
            value={10}
            sub="Auto-generated this week by AI"
            color="blue"
            delay={0.3}
          />
        </div>

        {/* ================================================================ */}
        {/* 3. CHURN RISK HEATMAP                                            */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, ease: smoothEase }}
          className="bg-card rounded-3xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-g-red/8 flex items-center justify-center">
                <AlertTriangle size={16} className="text-g-red" />
              </div>
              <h2 className="text-base font-semibold text-text-primary">
                Churn Risk Heatmap &mdash; All Enterprise Customers
              </h2>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              {[
                { color: 'bg-churn-critical', label: 'CRITICAL >80%' },
                { color: 'bg-churn-high', label: 'HIGH 60-80%' },
                { color: 'bg-churn-medium', label: 'MEDIUM 30-60%' },
                { color: 'bg-churn-low', label: 'LOW <30%' },
              ].map(legend => (
                <div key={legend.label} className="flex items-center gap-1.5">
                  <span className={cn('w-3 h-2 rounded-sm', legend.color)} />
                  <span className="text-text-muted">{legend.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap grid 5x2 */}
          <div className="grid grid-cols-5 gap-3">
            {customers.map((customer, i) => {
              const risk = riskLevel(customer.churnRisk)
              const isCritical = customer.churnRisk > 80
              const isSelected = selectedCustomer?.id === customer.id

              return (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.06, ease: smoothEase }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  onClick={() => setSelectedCustomer(isSelected ? null : customer)}
                  className={cn(
                    'relative rounded-2xl p-4 cursor-pointer transition-all duration-200',
                    riskTint(customer.churnRisk),
                    isSelected && 'ring-2 ring-g-purple ring-offset-2 ring-offset-page shadow-card-hover',
                    isCritical && 'animate-pulse-slow'
                  )}
                >
                  {/* Avatar + Company */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white shadow-sm"
                      style={{ backgroundColor: getCompanyColor(customer.company, i) }}
                    >
                      {getInitials(customer.company)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-primary truncate">{customer.company}</p>
                      <p className="text-xs text-text-secondary">{formatCurrency(customer.arr)} ARR</p>
                    </div>
                  </div>

                  {/* Churn risk bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-text-muted font-medium">Churn Risk</span>
                      <span className={cn('text-xs font-bold', risk.text)}>{customer.churnRisk.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-page rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${customer.churnRisk}%` }}
                        transition={{ delay: 0.5 + i * 0.06, duration: 1, ease: 'easeOut' }}
                        className={cn('h-full rounded-full bg-gradient-to-r', riskBarGradient(customer.churnRisk))}
                      />
                    </div>
                  </div>

                  {/* Risk label + last login */}
                  <div className="flex items-center justify-between">
                    <StatusBadge variant={risk.variant} pulse={isCritical}>
                      {risk.label}
                    </StatusBadge>
                    <span className="text-[10px] text-text-muted">
                      <Clock size={9} className="inline mr-0.5" />
                      {customer.lastLogin}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Expanded customer detail below heatmap */}
          <AnimatePresence>
            {selectedCustomer && (
              <motion.div
                key={selectedCustomer.id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: smoothEase }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: getCompanyColor(selectedCustomer.company, customers.findIndex(c => c.id === selectedCustomer.id)) }}
                      >
                        {getInitials(selectedCustomer.company)}
                      </div>
                      <h3 className="text-base font-semibold text-text-primary">{selectedCustomer.company}</h3>
                      <span className="text-sm text-text-secondary">{formatCurrency(selectedCustomer.arr)} ARR</span>
                      <StatusBadge variant={riskLevel(selectedCustomer.churnRisk).variant} pulse={selectedCustomer.churnRisk > 80}>
                        {riskLevel(selectedCustomer.churnRisk).label}
                      </StatusBadge>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedCustomer(null) }}
                      className="text-xs text-text-muted hover:text-text-primary px-3 py-1.5 rounded-full bg-page transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Left: Activity stats */}
                    <div className="bg-page rounded-2xl p-5 border border-gray-100">
                      <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Activity Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Last Login', value: selectedCustomer.lastLogin, icon: Clock },
                          { label: 'Logins / Week', value: `${selectedCustomer.loginsPerWeek}x`, icon: Activity },
                          { label: 'Features Active', value: `${selectedCustomer.featuresUsed}/${selectedCustomer.totalFeatures}`, icon: Zap },
                          { label: 'API Calls', value: (selectedCustomer.apiCalls ?? 0).toLocaleString(), icon: Cpu },
                          { label: 'API Trend', value: `${selectedCustomer.apiTrend ?? 0}%`, icon: TrendingDown },
                          { label: 'Support Tickets', value: selectedCustomer.supportTickets.toString(), icon: Headphones },
                        ].map((stat) => (
                          <div key={stat.label} className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-card flex items-center justify-center shadow-sm">
                              <stat.icon size={13} className="text-text-muted" />
                            </div>
                            <div>
                              <p className="text-[10px] text-text-muted">{stat.label}</p>
                              <p className={cn(
                                'text-sm font-semibold',
                                stat.label === 'API Trend' && (selectedCustomer.apiTrend ?? 0) < 0
                                  ? 'text-churn-critical'
                                  : 'text-text-primary'
                              )}>{stat.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Churn meter + chart */}
                    <div className="space-y-3">
                      {/* Churn risk meter */}
                      <div className="bg-page rounded-2xl p-5 border border-gray-100">
                        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Churn Risk Score</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="h-4 bg-card rounded-full overflow-hidden shadow-sm">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${selectedCustomer.churnRisk}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                className={cn('h-full rounded-full bg-gradient-to-r', riskBarGradient(selectedCustomer.churnRisk))}
                              />
                            </div>
                          </div>
                          <span className={cn('text-2xl font-extrabold tracking-tight', riskLevel(selectedCustomer.churnRisk).text)}>
                            {selectedCustomer.churnRisk.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Mini line chart - show for top 2 critical customers */}
                      {criticalCustomers.some(c => c.id === selectedCustomer.id) && (
                        <div className="bg-page rounded-2xl p-5 border border-gray-100">
                          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">30-Day Usage Trend</h4>
                          <div className="h-24">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={selectedCustomer.id === criticalCustomers[0]?.id ? criticalChartData : highChartData}>
                                <XAxis dataKey="day" tick={{ fill: '#9AA0A6', fontSize: 9 }} axisLine={false} tickLine={false} interval={6} />
                                <YAxis tick={{ fill: '#9AA0A6', fontSize: 9 }} axisLine={false} tickLine={false} width={30} />
                                <Tooltip
                                  contentStyle={chartTooltipStyle}
                                  labelFormatter={(v) => `Day ${v}`}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="usage"
                                  stroke="#EA4335"
                                  strokeWidth={2}
                                  dot={false}
                                  animationDuration={1500}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ================================================================ */}
        {/* 4. CRITICAL CUSTOMER DEEP DIVE                                   */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ease: smoothEase }}
          className="bg-card rounded-3xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-2xl bg-g-red/8 flex items-center justify-center">
              <AlertTriangle size={16} className="text-g-red" />
            </div>
            <h2 className="text-base font-semibold text-text-primary">Critical Customers &mdash; Immediate Action Required</h2>
            <StatusBadge variant="danger" pulse>{criticalCustomers.length} accounts</StatusBadge>
          </div>

          <div className="space-y-6">
            {criticalCustomers.length === 0 && (
              <div className="text-center py-8 text-text-secondary text-sm">
                No critical-risk customers detected. All enterprise accounts are healthy.
              </div>
            )}
            {criticalCustomers.map((customer, ci) => {
              const chartData = ci === 0 ? criticalChartData : highChartData
              const analysis = ci === 0
                ? `${customer.company} exhibits concerning churn indicators. Login frequency is ${customer.loginsPerWeek}x/week with ${customer.featuresUsed} of ${customer.totalFeatures} features active. Churn risk at ${customer.churnRisk.toFixed(1)}%. Recommend: immediate exec escalation, emergency QBR within 7 days.`
                : `${customer.company} shows elevated churn risk at ${customer.churnRisk.toFixed(1)}%. ${customer.daysSinceLogin}-day login gap with declining engagement. Support tickets trending up. Schedule urgent review with account team.`
              const actions = ci === 0
                ? [
                    { icon: '\uD83D\uDCE7', action: `Critical churn alert emailed to Account Manager`, time: 'Feb 26, 9:42 AM' },
                    { icon: '\uD83D\uDCC5', action: 'Emergency QBR scheduled for Mar 4', time: 'Feb 26, 9:43 AM' },
                    { icon: '\uD83D\uDCCA', action: 'Executive risk report generated & sent', time: 'Feb 26, 9:45 AM' },
                    { icon: '\uD83D\uDCDE', action: 'CS team notified via Slack', time: 'Feb 26, 9:46 AM' },
                  ]
                : [
                    { icon: '\uD83D\uDCE7', action: `High-risk alert emailed to Account Manager`, time: 'Feb 26, 9:50 AM' },
                    { icon: '\uD83D\uDCC5', action: 'QBR scheduled for Mar 6', time: 'Feb 26, 9:51 AM' },
                    { icon: '\uD83D\uDCCA', action: 'Usage decline report generated', time: 'Feb 26, 9:53 AM' },
                  ]

              return (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + ci * 0.15, ease: smoothEase }}
                  className="rounded-2xl border border-g-red/15 bg-g-red/[0.03] p-6"
                >
                  {/* Header row */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm"
                      style={{ backgroundColor: getCompanyColor(customer.company, customers.findIndex(c => c.id === customer.id)) }}
                    >
                      {getInitials(customer.company)}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">{customer.company}</h3>
                      <p className="text-xs text-text-secondary">{customer.name} &middot; {customer.email}</p>
                    </div>
                    <span className="text-sm font-semibold text-text-secondary ml-2">{formatCurrency(customer.arr)} ARR</span>
                    <StatusBadge variant="danger" pulse>CRITICAL</StatusBadge>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    {/* LEFT: Activity stats + chart */}
                    <div className="space-y-4">
                      <div className="bg-card rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                          <Activity size={12} className="inline mr-1.5" />
                          Activity Overview
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { label: 'Last Login', value: customer.lastLogin },
                            { label: 'Logins / Week', value: `${customer.loginsPerWeek}x` },
                            { label: 'Features Active', value: `${customer.featuresUsed}/${customer.totalFeatures}` },
                            { label: 'API Calls', value: (customer.apiCalls ?? 0).toLocaleString() },
                            { label: 'API Trend', value: `${customer.apiTrend ?? 0}%`, critical: true },
                            { label: 'Support Tickets', value: customer.supportTickets.toString() },
                          ].map((stat) => (
                            <div key={stat.label}>
                              <p className="text-[10px] text-text-muted mb-0.5">{stat.label}</p>
                              <p className={cn(
                                'text-sm font-bold',
                                stat.critical ? 'text-churn-critical' : 'text-text-primary'
                              )}>
                                {stat.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Activity chart */}
                      <div className="bg-card rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                          <TrendingDown size={12} className="inline mr-1.5 text-churn-critical" />
                          30-Day Activity Decline
                        </h4>
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <XAxis
                                dataKey="day"
                                tick={{ fill: '#9AA0A6', fontSize: 9 }}
                                axisLine={false}
                                tickLine={false}
                                interval={4}
                              />
                              <YAxis
                                tick={{ fill: '#9AA0A6', fontSize: 9 }}
                                axisLine={false}
                                tickLine={false}
                                width={30}
                              />
                              <Tooltip
                                contentStyle={chartTooltipStyle}
                                labelFormatter={(v) => `Day ${v}`}
                              />
                              <Line
                                type="monotone"
                                dataKey="usage"
                                stroke="#EA4335"
                                strokeWidth={2.5}
                                dot={false}
                                animationDuration={2000}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Churn meter + AI Analysis + Actions */}
                    <div className="space-y-4">
                      {/* Large churn risk meter */}
                      <div className="bg-card rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Churn Risk Score</h4>
                        <div className="flex items-end gap-4 mb-2">
                          <div className="flex-1">
                            <div className="h-5 bg-page rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${customer.churnRisk}%` }}
                                transition={{ delay: 0.6 + ci * 0.15, duration: 1.2, ease: 'easeOut' }}
                                className={cn('h-full rounded-full bg-gradient-to-r', riskBarGradient(customer.churnRisk))}
                              />
                            </div>
                          </div>
                          <span className="text-3xl font-extrabold tracking-tight text-churn-critical">
                            <CountUp start={0} end={parseFloat(customer.churnRisk.toFixed(1))} duration={1.5} delay={0.6 + ci * 0.15} suffix="%" decimals={1} />
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle size={12} className="text-churn-critical" />
                          <span className="text-[11px] text-churn-critical font-semibold">
                            {customer.churnRisk > 80 ? 'Exceeds critical threshold (80%)' : 'High risk — close monitoring required'}
                          </span>
                        </div>
                      </div>

                      {/* Claude AI Analysis */}
                      <div className="bg-g-purple/[0.04] rounded-2xl p-5 border border-g-purple/15">
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="w-6 h-6 rounded-lg bg-g-purple/10 flex items-center justify-center">
                            <Bot size={14} className="text-g-purple" />
                          </div>
                          <h4 className="text-xs font-semibold text-g-purple uppercase tracking-wider">Claude AI Analysis</h4>
                        </div>
                        <p className="text-[13px] text-text-secondary leading-relaxed">
                          {analysis}
                        </p>
                      </div>

                      {/* Agent Actions Taken */}
                      <div className="bg-card rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                          <Shield size={12} className="inline mr-1.5 text-g-green" />
                          Agent Actions Taken
                        </h4>
                        <div className="space-y-2.5">
                          {actions.map((action, ai) => (
                            <motion.div
                              key={ai}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.8 + ai * 0.1, ease: smoothEase }}
                              className="flex items-start gap-2.5"
                            >
                              <span className="text-sm flex-shrink-0 mt-0.5">{action.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-text-primary leading-snug">{action.action}</p>
                                <p className="text-[10px] text-text-muted mt-0.5">{action.time}</p>
                              </div>
                              <div className="w-5 h-5 rounded-full bg-g-green/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] text-g-green">{'\u2713'}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ================================================================ */}
        {/* 5. BOTTOM ROW: Feed (60%) + Weekly Report (40%)                  */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Live Agent Feed (60%) */}
          <div className="lg:col-span-3">
            <LiveAgentFeed source="enterprise" />
          </div>

          {/* RIGHT: Weekly Report Panel (40%) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, ease: smoothEase }}
            className="lg:col-span-2 bg-card rounded-3xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-6"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-2xl bg-g-purple/10 flex items-center justify-center">
                <BarChart3 size={16} className="text-g-purple" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Auto-Generated Weekly Reports</h3>
            </div>

            {/* Metadata */}
            <div className="space-y-2.5 mb-5">
              {[
                { label: 'Last generated', value: 'Mon Feb 24, 8:00 AM' },
                { label: 'Written by', value: 'Claude AI + BigQuery data' },
                { label: 'Delivered via', value: 'Gmail' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="text-text-secondary font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Executive summary */}
            <div className="relative bg-g-purple/[0.04] rounded-2xl p-5 border border-g-purple/10 mb-5">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-6 h-6 rounded-lg bg-g-purple/10 flex items-center justify-center">
                  <Bot size={14} className="text-g-purple" />
                </div>
                <span className="text-[10px] font-bold text-g-purple uppercase tracking-wider">Claude AI Executive Summary</span>
              </div>
              <p className="text-[12px] text-text-secondary leading-relaxed italic">
                &ldquo;{weeklyReportSummary}&rdquo;
              </p>
              <p className="text-[10px] text-text-muted mt-3 text-right">
                &mdash; Claude AI, Feb 24 2026
              </p>
            </div>

            {/* Action links */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2.5 text-xs text-g-blue hover:text-g-blue/80 cursor-pointer transition-colors font-medium">
                <div className="w-7 h-7 rounded-xl bg-g-blue/8 flex items-center justify-center">
                  <BarChart3 size={13} className="text-g-blue" />
                </div>
                <span>Open in Google Sheets</span>
                <ExternalLink size={10} className="text-text-muted" />
              </div>
              <div className="flex items-center gap-2.5 text-xs text-g-blue hover:text-g-blue/80 cursor-pointer transition-colors font-medium">
                <div className="w-7 h-7 rounded-xl bg-g-blue/8 flex items-center justify-center">
                  <FileText size={13} className="text-g-blue" />
                </div>
                <span>Open Report Archive</span>
                <ExternalLink size={10} className="text-text-muted" />
              </div>
            </div>

            {/* Next report */}
            <div className="bg-page rounded-2xl px-4 py-3.5 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-g-purple/10 flex items-center justify-center">
                  <CalendarCheck size={15} className="text-g-purple" />
                </div>
                <div>
                  <p className="text-[11px] text-text-muted">Next report</p>
                  <p className="text-xs font-semibold text-text-primary">Mon Mar 3, 8:00 AM <span className="text-text-muted font-normal">(automatic)</span></p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </PageTransition>
  )
}

// -- Helper: format relative date from ISO date string ------------------------

function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'today'
    if (diffDays === 1) return '1d ago'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return `${Math.floor(diffDays / 30)}mo ago`
  } catch {
    return dateStr
  }
}
