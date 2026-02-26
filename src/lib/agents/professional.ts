import { getCustomersByTier, getAtRiskCustomers, getUpsellReady } from '../db/customers'
import { generateEmail } from '../claude'
import { sendEmail } from '../gmail'
import { logAgentAction, logEmailSent } from '../db/logs'

export async function runProfessionalAgent(): Promise<{ processed: number; emailsSent: number; actions: string[] }> {
  const actions: string[] = []
  let emailsSent = 0

  // 1. Handle at-risk customers (churn_risk > 50)
  const atRisk = await getAtRiskCustomers('professional', 50)

  for (const customer of atRisk) {
    try {
      const email = await generateEmail(
        customer.name,
        customer.email,
        `Professional customer at ${customer.company}. Health score: ${customer.health_score}. Churn risk: ${customer.churn_risk}%. Last login: ${customer.days_since_last_login} days ago. Features used: ${customer.features_used}/${customer.total_features}.`,
        'Send a re-engagement email to reduce churn risk'
      )

      await sendEmail(customer.email, email.subject, email.body)
      await logEmailSent('professional', customer.id, customer.email, email.subject, 're_engagement')
      await logAgentAction('professional', 'email_sent', customer.id, `Re-engagement email sent to ${customer.name} (${customer.churn_risk}% risk)`)

      actions.push(`Re-engagement email sent to ${customer.name}`)
      emailsSent++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      actions.push(`Error: ${msg}`)
    }
  }

  // 2. Handle upsell-ready customers
  const upsellReady = await getUpsellReady()

  for (const customer of upsellReady) {
    try {
      const email = await generateEmail(
        customer.name,
        customer.email,
        `Professional customer at ${customer.company}. Using ${customer.features_used}/${customer.total_features} features. Health: ${customer.health_score}. On plan for a while. Upsell value: $${customer.upsell_value}/yr.`,
        'Send an upsell email suggesting Enterprise tier upgrade'
      )

      await sendEmail(customer.email, email.subject, email.body)
      await logEmailSent('professional', customer.id, customer.email, email.subject, 'upsell')
      await logAgentAction('professional', 'email_sent', customer.id, `Upsell email sent to ${customer.name} ($${customer.upsell_value}/yr potential)`)

      actions.push(`Upsell email sent to ${customer.name}`)
      emailsSent++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      actions.push(`Error: ${msg}`)
    }
  }

  await logAgentAction('professional', 'agent_run', null, `Professional agent completed. ${atRisk.length} at-risk, ${upsellReady.length} upsell ready, ${emailsSent} emails sent.`)

  return { processed: atRisk.length + upsellReady.length, emailsSent, actions }
}

export async function runMonthlyEmails(): Promise<{ emailsSent: number; actions: string[] }> {
  const actions: string[] = []
  let emailsSent = 0

  const customers = await getCustomersByTier('professional')

  for (const customer of customers) {
    try {
      const email = await generateEmail(
        customer.name,
        customer.email,
        `Monthly summary for ${customer.company}. Health: ${customer.health_score}%. Logins/week: ${customer.logins_per_week}. Features: ${customer.features_used}/${customer.total_features}.`,
        'Write a monthly engagement summary with tips for next month'
      )

      await sendEmail(customer.email, email.subject, email.body)
      await logEmailSent('professional', customer.id, customer.email, email.subject, 'monthly_summary')

      actions.push(`Monthly summary sent to ${customer.name}`)
      emailsSent++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      actions.push(`Error: ${msg}`)
    }
  }

  await logAgentAction('professional', 'monthly_emails', null, `Monthly emails completed. ${emailsSent}/${customers.length} sent.`)
  return { emailsSent, actions }
}
