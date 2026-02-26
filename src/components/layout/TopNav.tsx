'use client'
import { usePathname } from 'next/navigation'
import { Search, Bell } from 'lucide-react'

const titles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/starter': 'Starter Tier',
  '/dashboard/professional': 'Professional Tier',
  '/dashboard/enterprise': 'Enterprise Tier',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/crm': 'CRM',
}

export default function TopNav() {
  const pathname = usePathname()
  const title = titles[pathname] || 'RetainIQ'

  return (
    <header className="flex items-center justify-between px-8 pt-6 pb-2">
      <h1 className="text-[28px] font-bold text-text-primary tracking-tight">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2.5 shadow-card">
          <Search size={14} className="text-text-muted" />
          <span className="text-sm text-text-muted">Search</span>
        </div>
        <button className="bg-sidebar text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-sidebar/90 transition-colors">
          RetainIQ
        </button>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center">
            <Bell size={18} className="text-text-secondary" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent-coral rounded-full flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">3</span>
          </div>
        </div>
      </div>
    </header>
  )
}
