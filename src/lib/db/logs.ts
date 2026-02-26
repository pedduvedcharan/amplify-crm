import { insert, query, DATASET } from '../bigquery'

export async function logAgentAction(agentType: string, actionType: string, customerId: string | null, details: string) {
  await insert('agent_logs', {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    agent_type: agentType,
    action_type: actionType,
    customer_id: customerId,
    details,
    created_at: new Date().toISOString(),
  })
}

export async function logEmailSent(agentType: string, customerId: string, to: string, subject: string, purpose: string) {
  await insert('emails_sent', {
    id: `email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    agent_type: agentType,
    customer_id: customerId,
    to_email: to,
    subject,
    purpose,
    sent_at: new Date().toISOString(),
  })
}

export async function logFAQ(customerId: string | null, question: string, answer: string) {
  await insert('faq_queries', {
    id: `faq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    customer_id: customerId,
    question,
    answer,
    created_at: new Date().toISOString(),
  })
}

export async function getRecentLogs(limit = 20, agentType?: string) {
  const where = agentType ? `WHERE agent_type = '${agentType}'` : ''
  return query(`SELECT * FROM \`${DATASET}.agent_logs\` ${where} ORDER BY created_at DESC LIMIT ${limit}`)
}

export async function getEmailStats() {
  const [stats] = await query<{ today: number; this_week: number; this_month: number }>(`
    SELECT
      COUNTIF(DATE(sent_at) = CURRENT_DATE()) as today,
      COUNTIF(sent_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)) as this_week,
      COUNTIF(sent_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)) as this_month
    FROM \`${DATASET}.emails_sent\`
  `)
  return stats
}
