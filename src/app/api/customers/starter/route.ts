import { NextResponse } from 'next/server'
import { query, DATASET } from '@/lib/bigquery'

export async function GET() {
  try {
    const customers = await query(`
      SELECT * FROM \`${DATASET}.customers\`
      WHERE tier = 'starter'
      ORDER BY health_score ASC
      LIMIT 50
    `)

    const stats = await query(`
      SELECT
        COUNT(*) as total,
        COUNTIF(onboarding_status = 'done') as fully_onboarded,
        COUNTIF(onboarding_status = 'stuck') as stuck,
        ROUND(AVG(health_score), 1) as avg_health,
        ROUND(AVG(CASE WHEN onboarding_status = 'done' THEN onboarding_day END), 1) as avg_onboard_time,
        COUNTIF(churn_risk > 50) as at_risk
      FROM \`${DATASET}.customers\`
      WHERE tier = 'starter'
    `)

    return NextResponse.json({ customers, stats: stats[0] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
