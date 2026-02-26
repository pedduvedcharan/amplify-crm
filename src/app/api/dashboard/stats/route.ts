import { NextResponse } from 'next/server'
import { query, DATASET } from '@/lib/bigquery'

export async function GET() {
  try {
    const [overview] = await query<{ total: number; at_risk: number; avg_health: number }>(`
      SELECT
        COUNT(*) as total,
        COUNTIF(churn_risk > 50) as at_risk,
        ROUND(AVG(health_score), 1) as avg_health
      FROM \`${DATASET}.customers\`
    `)

    const tierDist = await query<{ tier: string; count: number; avg_health: number; avg_churn: number; total_arr: number }>(`
      SELECT
        tier,
        COUNT(*) as count,
        ROUND(AVG(health_score), 1) as avg_health,
        ROUND(AVG(churn_risk), 1) as avg_churn,
        ROUND(SUM(arr), 0) as total_arr
      FROM \`${DATASET}.customers\`
      GROUP BY tier
      ORDER BY tier
    `)

    const healthDist = await query<{ bucket: string; count: number }>(`
      SELECT
        CASE
          WHEN health_score < 40 THEN 'red'
          WHEN health_score < 70 THEN 'yellow'
          ELSE 'green'
        END as bucket,
        COUNT(*) as count
      FROM \`${DATASET}.customers\`
      GROUP BY bucket
    `)

    return NextResponse.json({
      totalCustomers: overview.total,
      atRiskCustomers: overview.at_risk,
      avgHealth: overview.avg_health,
      tierDistribution: tierDist,
      healthDistribution: healthDist,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
