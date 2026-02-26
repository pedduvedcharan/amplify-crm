import { NextRequest, NextResponse } from 'next/server'
import { getRecentLogs } from '@/lib/db/logs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agentType = searchParams.get('type') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')

    const logs = await getRecentLogs(limit, agentType)
    return NextResponse.json({ logs })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
