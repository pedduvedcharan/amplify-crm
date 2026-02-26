'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Mail } from 'lucide-react'
import { feedItems, type FeedItem } from '@/data/mockData'
import { cn, timeAgo } from '@/lib/utils'

const tierDot = { starter: 'bg-g-green', professional: 'bg-g-blue', enterprise: 'bg-g-purple' }
const tierLabel = { starter: 'Starter Agent', professional: 'Professional Agent', enterprise: 'Enterprise Agent' }
const tierText = { starter: 'text-g-green', professional: 'text-g-blue', enterprise: 'text-g-purple' }

export default function LiveAgentFeed({ source }: { source: 'all' | 'starter' | 'professional' | 'enterprise' }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [items, setItems] = useState<FeedItem[]>([])

  useEffect(() => {
    const filtered = source === 'all'
      ? feedItems
      : feedItems.filter(f => f.agentType === source)
    setItems(filtered.sort((a, b) => a.timestamp - b.timestamp))
  }, [source])

  const title = source === 'all'
    ? 'Live Agent Feed'
    : `${source.charAt(0).toUpperCase() + source.slice(1)} Agent Feed`

  return (
    <div className="bg-card rounded-3xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        <div className="flex items-center gap-1.5 bg-g-green/10 px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-g-green animate-pulse" />
          <span className="text-[10px] font-semibold text-g-green uppercase">Live</span>
        </div>
      </div>

      <div className="space-y-0.5 max-h-72 overflow-y-auto">
        <AnimatePresence initial={false}>
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                'px-3 py-2.5 rounded-2xl transition-colors',
                item.severity === 'critical' ? 'bg-g-red/5' : 'hover:bg-page'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', tierDot[item.agentType])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-text-muted">{timeAgo(item.timestamp)}</span>
                    <span className={cn('text-[11px] font-semibold', tierText[item.agentType])}>{tierLabel[item.agentType]}</span>
                  </div>
                  <p className="text-sm text-text-primary mt-0.5">{item.action}</p>
                  {item.hasEmail && (
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="flex items-center gap-1 text-[11px] text-g-blue mt-1 hover:underline font-medium"
                    >
                      <Mail size={10} /> Preview Email
                      {expandedId === item.id ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    </button>
                  )}
                  <AnimatePresence>
                    {expandedId === item.id && item.emailPreview && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 bg-page rounded-2xl p-4">
                          <p className="text-[10px] text-text-muted uppercase mb-0.5">Subject:</p>
                          <p className="text-xs font-semibold text-text-primary mb-1.5">{item.emailPreview.subject}</p>
                          <p className="text-xs text-text-secondary leading-relaxed max-h-24 overflow-y-auto">{item.emailPreview.body}</p>
                          <p className="text-[10px] text-text-muted mt-2">Written by Claude AI</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
