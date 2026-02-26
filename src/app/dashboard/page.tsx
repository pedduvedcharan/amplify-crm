'use client'
import { motion } from 'framer-motion'
import { Users, AlertTriangle, Mail, Shield, ArrowUpRight, Loader2 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import Link from 'next/link'
import useSWR from 'swr'
import PageTransition from '@/components/ui/PageTransition'
import KPICard from '@/components/ui/KPICard'
import LiveAgentFeed from '@/components/feed/LiveAgentFeed'

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

const fetcher = (url: string) => fetch(url).then(r => r.json())

const tierColors = ['#34A853', '#4285F4', '#A142F4']
const tooltipStyle = { background: '#fff', border: 'none', borderRadius: '14px', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function DashboardPage() {
  const { data, isLoading } = useSWR('/api/dashboard/stats', fetcher, { refreshInterval: 30000 })

  const tierDistribution = data?.tierDistribution?.map((t: { tier: string; count: number }) => ({
    name: t.tier.charAt(0).toUpperCase() + t.tier.slice(1),
    value: t.count,
    color: t.tier === 'starter' ? '#34A853' : t.tier === 'professional' ? '#4285F4' : '#A142F4',
  })) || []

  const healthByTier = data?.tierDistribution?.map((t: { tier: string; avg_health: number }) => ({
    name: t.tier.charAt(0).toUpperCase() + t.tier.slice(1),
    health: Math.round(t.avg_health),
  })) || []

  const tierCards = data?.tierDistribution ? [
    {
      name: 'Starter Tier',
      href: '/dashboard/starter',
      count: data.tierDistribution.find((t: { tier: string }) => t.tier === 'starter')?.count || 0,
      gradient: 'from-[#34A853] via-[#5BB974] to-[#81C995]',
      stat: `Avg Health: ${Math.round(data.tierDistribution.find((t: { tier: string }) => t.tier === 'starter')?.avg_health || 0)}%`,
      extra: `${formatNumber(data.tierDistribution.find((t: { tier: string }) => t.tier === 'starter')?.total_arr || 0)} ARR`,
    },
    {
      name: 'Professional Tier',
      href: '/dashboard/professional',
      count: data.tierDistribution.find((t: { tier: string }) => t.tier === 'professional')?.count || 0,
      gradient: 'from-[#4285F4] via-[#5E97F6] to-[#8AB4F8]',
      stat: `Avg Health: ${Math.round(data.tierDistribution.find((t: { tier: string }) => t.tier === 'professional')?.avg_health || 0)}%`,
      extra: `${formatNumber(data.tierDistribution.find((t: { tier: string }) => t.tier === 'professional')?.total_arr || 0)} ARR`,
    },
    {
      name: 'Enterprise Tier',
      href: '/dashboard/enterprise',
      count: data.tierDistribution.find((t: { tier: string }) => t.tier === 'enterprise')?.count || 0,
      gradient: 'from-[#A142F4] via-[#B36BF6] to-[#D7AEFB]',
      stat: `${formatNumber(data.tierDistribution.find((t: { tier: string }) => t.tier === 'enterprise')?.total_arr || 0)} ARR monitored`,
      extra: `Avg Health: ${Math.round(data.tierDistribution.find((t: { tier: string }) => t.tier === 'enterprise')?.avg_health || 0)}%`,
    },
  ] : []

  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <span className="ml-3 text-text-secondary font-medium">Loading from BigQuery...</span>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon={Users} label="Total Customers" value={data?.totalCustomers || 0} sub="across all tiers" color="blue" delay={0} gradient />
          <KPICard icon={AlertTriangle} label="At Risk" value={data?.atRiskCustomers || 0} sub="churn risk > 50%" color="red" delay={0.1} pulse />
          <KPICard icon={Mail} label="Avg Health" value={data?.avgHealth || 0} sub="across all customers" color="blue" delay={0.2} suffix="%" />
          <KPICard icon={Shield} label="Health Buckets" value={data?.healthDistribution?.find((h: { bucket: string }) => h.bucket === 'green')?.count || 0} sub="customers healthy" color="green" delay={0.3} />
        </div>

        {/* Tier Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {tierCards.map((tier, i) => (
            <Link key={tier.name} href={tier.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, ease }}
                whileHover={{ scale: 1.02, y: -3 }}
                className={`bg-gradient-to-br ${tier.gradient} rounded-3xl p-6 cursor-pointer relative overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300`}
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/[0.08] rounded-full -translate-y-10 translate-x-10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/[0.05] rounded-full translate-y-6 -translate-x-6" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[13px] font-semibold text-white/80">{tier.name}</h3>
                    <div className="flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-[9px] text-white/80 font-semibold uppercase">Live</span>
                    </div>
                  </div>
                  <p className="text-[38px] font-extrabold text-white leading-none mb-1 tracking-tight">{tier.count.toLocaleString()}</p>
                  <p className="text-[13px] text-white/70 font-medium mb-4">{tier.stat}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-white/60">{tier.extra}</span>
                    <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                      <ArrowUpRight size={14} className="text-white/80" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3">
            <LiveAgentFeed source="all" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            {/* Donut */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ease }} className="bg-card rounded-3xl p-6 shadow-card">
              <h3 className="text-[13px] font-semibold text-text-secondary mb-4">Customer Distribution</h3>
              <div className="h-44">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={tierDistribution} cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {tierDistribution.map((e: { color: string }, i: number) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-5 mt-1">
                {tierDistribution.map((t: { name: string; value: number; color: string }) => (
                  <div key={t.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                    <span className="text-[12px] text-text-secondary font-medium">{t.name} ({t.value.toLocaleString()})</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bar chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, ease }} className="bg-card rounded-3xl p-6 shadow-card">
              <h3 className="text-[13px] font-semibold text-text-secondary mb-4">Avg Health by Tier</h3>
              <div className="h-36">
                <ResponsiveContainer>
                  <BarChart data={healthByTier}>
                    <XAxis dataKey="name" tick={{ fill: '#6B6B7B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#A0A0AE', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="health" radius={[8, 8, 0, 0]}>
                      {healthByTier.map((_: unknown, i: number) => <Cell key={i} fill={tierColors[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
