import { query, DATASET } from '../bigquery'

export interface Customer {
  id: string
  name: string
  email: string
  company: string
  tier: 'starter' | 'professional' | 'enterprise'
  health_score: number
  churn_risk: number
  logins_per_week: number
  features_used: number
  total_features: number
  days_since_last_login: number
  support_tickets: number
  onboarding_status?: string
  onboarding_day?: number
  upsell_ready?: boolean
  upsell_value?: number
  arr?: number
  last_login?: string
  created_at: string
}

export async function getCustomersByTier(tier: string): Promise<Customer[]> {
  return query<Customer>(`SELECT * FROM \`${DATASET}.customers\` WHERE tier = @tier ORDER BY health_score ASC`, { tier })
}

export async function getStuckCustomers(): Promise<Customer[]> {
  return query<Customer>(`SELECT * FROM \`${DATASET}.customers\` WHERE tier = 'starter' AND onboarding_status = 'stuck'`)
}

export async function getAtRiskCustomers(tier: string, threshold = 50): Promise<Customer[]> {
  return query<Customer>(`SELECT * FROM \`${DATASET}.customers\` WHERE tier = @tier AND churn_risk > @threshold ORDER BY churn_risk DESC`, { tier, threshold })
}

export async function getUpsellReady(): Promise<Customer[]> {
  return query<Customer>(`SELECT * FROM \`${DATASET}.customers\` WHERE tier = 'professional' AND upsell_ready = TRUE ORDER BY upsell_value DESC`)
}

export async function updateChurnScore(customerId: string, churnScore: number) {
  await query(`UPDATE \`${DATASET}.customers\` SET churn_risk = @score WHERE id = @id`, { score: churnScore, id: customerId })
}

export async function getOverviewStats() {
  const [stats] = await query<{ total: number; at_risk: number; emails_today: number; churn_prevented: number }>(`
    SELECT
      COUNT(*) as total,
      COUNTIF(churn_risk > 50) as at_risk,
      (SELECT COUNT(*) FROM \`${DATASET}.emails_sent\` WHERE DATE(sent_at) = CURRENT_DATE()) as emails_today,
      (SELECT COUNT(*) FROM \`${DATASET}.agent_logs\` WHERE action_type = 'churn_prevented' AND DATE(created_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) as churn_prevented
    FROM \`${DATASET}.customers\`
  `)
  return stats
}
