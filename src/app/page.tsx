'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const loadingSteps = [
  'Connecting to Google BigQuery...',
  'Fetching 10,000 customer records...',
  'Loading AI agent status...',
  'Preparing dashboard...',
]

export default function Home() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 2))
    }, 35)

    const stepInterval = setInterval(() => {
      setCurrentStep((s) => (s >= loadingSteps.length - 1 ? s : s + 1))
    }, 450)

    const timeout = setTimeout(() => {
      setFading(true)
      setTimeout(() => router.push('/dashboard'), 400)
    }, 2000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-scale-in { animation: scaleIn 0.5s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out 0.3s forwards; opacity: 0; }
        .animate-fade-in-delayed { animation: fadeIn 0.4s ease-out 0.6s forwards; opacity: 0; }
      `}</style>
      <div
        className="fixed inset-0 bg-[#1C1C2E] flex items-center justify-center z-50"
        style={{
          transition: 'opacity 0.4s ease-out',
          opacity: fading ? 0 : 1,
        }}
      >
        <div className="flex flex-col items-center gap-8 max-w-md w-full px-8">
          {/* Logo */}
          <div className="animate-scale-in flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#F97794] to-[#F2766B] rounded-2xl flex items-center justify-center shadow-lg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h4l3-9 4 18 3-9h4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">RetainIQ</h1>
              <p className="text-sm text-white/40 mt-1">AI-Powered Customer Success Platform</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="animate-fade-in-up w-full space-y-4">
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#F97794] via-[#4285F4] to-[#34A853]"
                style={{
                  width: `${progress}%`,
                  transition: 'width 0.1s linear',
                }}
              />
            </div>

            {/* Loading step text */}
            <div className="flex items-center justify-center gap-2 h-5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#34A853] animate-pulse" />
              <span
                key={currentStep}
                className="text-xs text-white/50 font-medium transition-opacity duration-200"
              >
                {loadingSteps[currentStep]}
              </span>
            </div>
          </div>

          {/* Powered by badges */}
          <div className="animate-fade-in-delayed flex items-center gap-4 text-[10px] text-white/25 font-medium uppercase tracking-widest">
            <span>Google Cloud</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>BigQuery</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>Claude AI</span>
          </div>
        </div>
      </div>
    </>
  )
}
