import { NextRequest, NextResponse } from 'next/server'
import { answerFAQ } from '@/lib/claude'
import { logFAQ } from '@/lib/db/logs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, customerId, tier = 'starter' } = body

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    const answer = await answerFAQ(message, tier)

    // Log to BigQuery
    await logFAQ(customerId || null, message, answer)

    return NextResponse.json({ answer })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
