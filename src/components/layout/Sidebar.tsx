'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Rocket, Briefcase, Building2, BarChart3, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Overview' },
  { path: '/dashboard/starter', icon: Rocket, label: 'Starter' },
  { path: '/dashboard/professional', icon: Briefcase, label: 'Professional' },
  { path: '/dashboard/enterprise', icon: Building2, label: 'Enterprise' },
  { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/dashboard/crm', icon: Users, label: 'CRM' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[72px] h-screen sticky top-0 flex flex-col items-center bg-sidebar py-6 rounded-r-[28px] z-30">
      {/* Logo */}
      <Link href="/dashboard" className="mb-10">
        <div className="w-10 h-10 bg-gradient-to-br from-accent-coral to-accent-peach rounded-xl flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h4l3-9 4 18 3-9h4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 flex flex-col items-center gap-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = pathname === path
          return (
            <Link
              key={path}
              href={path}
              className={cn(
                'relative w-11 h-11 rounded-[14px] flex items-center justify-center transition-all duration-200',
                isActive
                  ? 'bg-[#3A3A4E] text-white'
                  : 'text-[#6B6B80] hover:text-[#9B9BB0] hover:bg-[#2A2A3E]'
              )}
              title={label}
            >
              <Icon size={19} strokeWidth={isActive ? 2 : 1.5} />
              {isActive && (
                <div className="absolute -right-1 w-[6px] h-[6px] rounded-full bg-white" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Agent Status */}
      <div className="flex flex-col items-center gap-2.5 mb-2">
        <div className="w-2 h-2 rounded-full bg-g-green animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-g-blue animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-g-purple animate-pulse" />
      </div>
    </aside>
  )
}
