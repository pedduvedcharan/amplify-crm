'use client'

import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, ChevronDown, ChevronRight, Code, Table, Sparkles, Loader2 } from 'lucide-react'
import PageTransition from '@/components/ui/PageTransition'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sql?: string | null
  data?: Record<string, unknown>[] | null
  rowCount?: number
}

interface ApiResponse {
  answer: string
  sql: string | null
  data: Record<string, unknown>[] | null
  rowCount: number
  error: string | null
}

interface HistoryEntry {
  role: 'user' | 'assistant'
  content: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const suggestedQuestions: string[] = [
  'How many customers are at risk of churning?',
  "What's the average health score by tier?",
  'Show me the top 10 enterprise customers by ARR',
  'How many starter customers are stuck in onboarding?',
  'Which professional customers are ready for upsell?',
  "What's our total ARR across all tiers?",
]

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-2 h-2 rounded-full bg-text-muted"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

function SqlBlock({ sql }: { sql: string }) {
  return (
    <div className="mt-2 rounded-2xl overflow-hidden border border-border-subtle">
      <pre className="bg-[#1C1C2E] text-[#C5C5D2] text-xs leading-relaxed p-4 overflow-x-auto font-mono whitespace-pre-wrap break-words">
        {sql}
      </pre>
    </div>
  )
}

function DataTable({ data }: { data: Record<string, unknown>[] }) {
  if (data.length === 0) return null
  const columns = Object.keys(data[0])

  return (
    <div className="mt-2 rounded-2xl overflow-hidden border border-border-subtle">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-page">
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-left px-3 py-2 font-semibold text-text-secondary whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={cn(
                  'border-t border-border-subtle',
                  rowIdx % 2 === 0 ? 'bg-card' : 'bg-page/50'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-3 py-2 text-text-primary whitespace-nowrap"
                  >
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface ToggleRowProps {
  label: string
  icon: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function ToggleRow({ label, icon, isOpen, onToggle, children }: ToggleRowProps) {
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {icon}
        {label}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expandedSql, setExpandedSql] = useState<Set<number>>(new Set())
  const [expandedData, setExpandedData] = useState<Set<number>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom on new messages or loading state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    }
  }, [input])

  const toggleSql = useCallback((index: number) => {
    setExpandedSql((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [])

  const toggleData = useCallback((index: number) => {
    setExpandedData((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading) return

      const userMessage: ChatMessage = { role: 'user', content: trimmed }
      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsLoading(true)

      // Build history from existing messages
      const history: HistoryEntry[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      try {
        const res = await fetch('/api/analytics/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, history }),
        })

        const body: ApiResponse = await res.json()

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: body.error ? `Error: ${body.error}` : body.answer,
          sql: body.sql,
          data: body.data,
          rowCount: body.rowCount,
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, messages]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage(input)
      }
    },
    [input, sendMessage]
  )

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      sendMessage(input)
    },
    [input, sendMessage]
  )

  const isEmpty = messages.length === 0

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
        {/* ---- Header ---- */}
        <div className="flex items-center gap-4 mb-4 flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-coral to-accent-salmon rounded-2xl flex items-center justify-center shadow-card">
            <Bot size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text-primary leading-tight">
              Analytics Assistant
            </h1>
            <p className="text-sm text-text-secondary">
              Ask anything about your 10,000 customers
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] bg-accent-coral/10 text-accent-coral px-4 py-1.5 rounded-full font-semibold uppercase tracking-wide">
            <Sparkles size={12} />
            Powered by Claude AI + BigQuery
          </span>
        </div>

        {/* ---- Chat area ---- */}
        <div className="flex-1 bg-card rounded-3xl shadow-card overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {/* Empty state: suggested questions */}
            {isEmpty && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="flex flex-col items-center justify-center h-full py-12"
              >
                <div className="w-16 h-16 bg-accent-coral/10 rounded-3xl flex items-center justify-center mb-5">
                  <Sparkles size={28} className="text-accent-coral" />
                </div>
                <h2 className="text-lg font-bold text-text-primary mb-1">
                  What would you like to know?
                </h2>
                <p className="text-sm text-text-muted mb-8 text-center max-w-md">
                  Ask questions in plain English and get instant answers backed by your BigQuery data.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="text-left text-sm px-4 py-3 rounded-2xl border border-border-subtle bg-page/60 text-text-secondary hover:border-accent-coral/40 hover:text-text-primary hover:shadow-card transition-all duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user'
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease }}
                    className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
                  >
                    {/* Assistant avatar */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-coral to-accent-salmon flex items-center justify-center flex-shrink-0 mt-1 mr-2.5">
                        <Bot size={16} className="text-white" />
                      </div>
                    )}

                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-3',
                        isUser
                          ? 'bg-gradient-to-br from-accent-coral to-accent-salmon text-white'
                          : 'bg-page/70 text-text-primary'
                      )}
                    >
                      {/* Message content */}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>

                      {/* SQL toggle */}
                      {!isUser && msg.sql && (
                        <ToggleRow
                          label="View SQL"
                          icon={<Code size={13} />}
                          isOpen={expandedSql.has(idx)}
                          onToggle={() => toggleSql(idx)}
                        >
                          <SqlBlock sql={msg.sql} />
                        </ToggleRow>
                      )}

                      {/* Data toggle */}
                      {!isUser && msg.data && msg.data.length > 0 && (
                        <ToggleRow
                          label={`View Data (${msg.rowCount ?? msg.data.length} rows)`}
                          icon={<Table size={13} />}
                          isOpen={expandedData.has(idx)}
                          onToggle={() => toggleData(idx)}
                        >
                          <DataTable data={msg.data} />
                        </ToggleRow>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-coral to-accent-salmon flex items-center justify-center flex-shrink-0 mt-1 mr-2.5">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-page/70 rounded-2xl">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ---- Input area ---- */}
          <div className="flex-shrink-0 border-t border-border-subtle px-4 py-3">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your customers..."
                rows={1}
                className="flex-1 resize-none bg-page/60 rounded-2xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted border border-border-subtle focus:outline-none focus:border-accent-coral/50 focus:ring-2 focus:ring-accent-coral/10 transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  isLoading || !input.trim()
                    ? 'bg-border-subtle text-text-muted cursor-not-allowed'
                    : 'bg-gradient-to-br from-accent-coral to-accent-salmon text-white shadow-card hover:shadow-card-hover active:scale-95'
                )}
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
