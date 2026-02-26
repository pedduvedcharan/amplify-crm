import { NextResponse } from 'next/server'
import { query, DATASET } from '@/lib/bigquery'

export async function GET() {
  try {
    const customers = await query(`
      SELECT * FROM \`${DATASET}.customers\`
      WHERE tier = 'professional'
      ORDER BY churn_risk DESC
      LIMIT 50
    `)

    const stats = await query(`
      SELECT
        COUNT(*) as total,
        ROUND(AVG(health_score), 1) as avg_health,
        COUNTIF(upsell_ready = TRUE) as upsell_ready,
        COUNTIF(churn_risk > 50) as at_risk,
        ROUND(SUM(CASE WHEN upsell_ready = TRUE THEN upsell_value ELSE 0 END), 0) as total_pipeline_value,
        ROUND(AVG(arr), 0) as avg_arr
      FROM \`${DATASET}.customers\`
      WHERE tier = 'professional'
    `)

    return NextResponse.json({ customers, stats: stats[0] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
