'use client'
import PageTransition from '@/components/ui/PageTransition'
import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-card rounded-3xl shadow-card p-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-g-blue/10 rounded-3xl flex items-center justify-center mb-5">
            <BarChart3 size={28} className="text-g-blue" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Analytics</h2>
          <p className="text-sm text-text-secondary max-w-sm mb-4">
            Advanced analytics powered by BigQuery and Google Cloud AI.
            This module will be connected to real-time data pipelines.
          </p>
          <span className="text-[10px] bg-g-blue/10 text-g-blue px-4 py-1.5 rounded-full font-semibold uppercase tracking-wide">Coming with Gemini Integration</span>
        </div>
      </div>
    </PageTransition>
  )
}
