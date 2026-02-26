import { query, DATASET } from '../bigquery'

export interface ChurnPrediction {
  customer_id: string
  churn_score: number
}

export async function runChurnPrediction(): Promise<ChurnPrediction[]> {
  return query<ChurnPrediction>(`
    SELECT
      customer_id,
      ROUND(predicted_churned_probs[OFFSET(1)].prob * 100, 1) AS churn_score
    FROM ML.PREDICT(
      MODEL \`${DATASET}.churn_model\`,
      (SELECT
        customer_id,
        logins_per_week AS login_frequency,
        ROUND(features_used / total_features * 100, 1) AS feature_usage_pct,
        days_since_last_login,
        support_tickets AS support_ticket_count
      FROM \`${DATASET}.customers\`
      WHERE tier = 'enterprise')
    )
    ORDER BY churn_score DESC
  `)
}

export async function writeChurnSignal(customerId: string, score: number, severity: string, analysis: string, actions: string[]) {
  const { insert } = await import('../bigquery')
  await insert('churn_signals', {
    id: `churn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    customer_id: customerId,
    churn_score: score,
    severity,
    analysis,
    recommended_actions: JSON.stringify(actions),
    detected_at: new Date().toISOString(),
  })
}
