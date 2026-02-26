import Sidebar from '@/components/layout/Sidebar'
import TopNav from '@/components/layout/TopNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopNav />
        <main className="flex-1 px-8 pb-8 pt-2 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
