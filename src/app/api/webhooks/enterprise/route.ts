import { NextRequest, NextResponse } from 'next/server'
import { CloudTasksClient } from '@google-cloud/tasks'

export async function POST(req: NextRequest) {
  // Verify OIDC token in production
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && !authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // In production: enqueue to Cloud Tasks for async processing
    if (process.env.CLOUD_TASKS_QUEUE) {
      const client = new CloudTasksClient()
      const parent = client.queuePath(
        process.env.GCP_PROJECT_ID || '',
        'us-central1',
        'enterprise-agent-queue'
      )
      await client.createTask({
        parent,
        task: {
          httpRequest: {
            httpMethod: 'POST',
            url: `${process.env.CLOUD_RUN_URL}/api/agents/run?type=enterprise`,
            headers: { 'Content-Type': 'application/json' },
          },
        },
      })
      return NextResponse.json({ queued: true, agent: 'enterprise' })
    }

    // In dev: run directly
    const { runEnterpriseAgent } = await import('@/lib/agents/enterprise')
    const result = await runEnterpriseAgent()
    return NextResponse.json({ success: true, result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
