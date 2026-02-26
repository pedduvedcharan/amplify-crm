'use client'
import PageTransition from '@/components/ui/PageTransition'
import { Users } from 'lucide-react'

export default function CRMPage() {
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-card rounded-3xl shadow-card p-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-g-purple/10 rounded-3xl flex items-center justify-center mb-5">
            <Users size={28} className="text-g-purple" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">CRM</h2>
          <p className="text-sm text-text-secondary max-w-sm mb-4">
            Full customer relationship management with AI-powered insights.
            Integrated with Amplify CRM data pipeline.
          </p>
          <span className="text-[10px] bg-g-purple/10 text-g-purple px-4 py-1.5 rounded-full font-semibold uppercase tracking-wide">Coming with Gemini Integration</span>
        </div>
      </div>
    </PageTransition>
  )
}
