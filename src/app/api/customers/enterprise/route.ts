import { NextResponse } from 'next/server'
import { query, DATASET } from '@/lib/bigquery'

export async function GET() {
  try {
    const customers = await query(`
      SELECT * FROM \`${DATASET}.customers\`
      WHERE tier = 'enterprise'
      ORDER BY churn_risk DESC
      LIMIT 50
    `)

    const stats = await query(`
      SELECT
        COUNT(*) as total,
        ROUND(SUM(arr), 0) as total_arr,
        COUNTIF(churn_risk > 70) as critical_risk,
        ROUND(AVG(logins_per_week), 1) as avg_login_freq,
        ROUND(AVG(health_score), 1) as avg_health,
        COUNTIF(churn_risk > 50) as high_risk
      FROM \`${DATASET}.customers\`
      WHERE tier = 'enterprise'
    `)

    return NextResponse.json({ customers, stats: stats[0] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
