import { NextRequest, NextResponse } from 'next/server'
import { runStarterAgent } from '@/lib/agents/starter'
import { runProfessionalAgent } from '@/lib/agents/professional'
import { runEnterpriseAgent } from '@/lib/agents/enterprise'

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    let result
    switch (type) {
      case 'starter':
        result = await runStarterAgent()
        break
      case 'professional':
        result = await runProfessionalAgent()
        break
      case 'enterprise':
        result = await runEnterpriseAgent()
        break
      default:
        return NextResponse.json({ error: `Unknown agent type: ${type}` }, { status: 400 })
    }

    return NextResponse.json({ success: true, type, result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
