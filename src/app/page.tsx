'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100
        return p + 2
      })
    }, 35)

    // Cycle through loading steps
    const stepInterval = setInterval(() => {
      setCurrentStep((s) => {
        if (s >= loadingSteps.length - 1) return s
        return s + 1
      })
    }, 450)

    // Redirect after 2 seconds
    const timeout = setTimeout(() => {
      setShow(false)
      setTimeout(() => router.push('/dashboard'), 300)
    }, 2000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-[#1C1C2E] flex items-center justify-center z-50"
        >
          <div className="flex flex-col items-center gap-8 max-w-md w-full px-8">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#F97794] to-[#F2766B] rounded-2xl flex items-center justify-center shadow-lg">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12h4l3-9 4 18 3-9h4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">RetainIQ</h1>
                <p className="text-sm text-white/40 mt-1">AI-Powered Customer Success Platform</p>
              </div>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="w-full space-y-4"
            >
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#F97794] via-[#4285F4] to-[#34A853]"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Loading step text */}
              <div className="flex items-center justify-center gap-2 h-5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#34A853] animate-pulse" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-white/50 font-medium"
                  >
                    {loadingSteps[currentStep]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Powered by badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 text-[10px] text-white/25 font-medium uppercase tracking-widest"
            >
              <span>Google Cloud</span>
              <span className="w-1 h-1 rounded-full bg-white/15" />
              <span>BigQuery</span>
              <span className="w-1 h-1 rounded-full bg-white/15" />
              <span>Claude AI</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
