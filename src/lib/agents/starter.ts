import { getCustomersByTier, getStuckCustomers } from '../db/customers'
import { generateEmail } from '../claude'
import { sendEmail } from '../gmail'
import { logAgentAction, logEmailSent } from '../db/logs'

export async function runStarterAgent(): Promise<{ processed: number; emailsSent: number; actions: string[] }> {
  const actions: string[] = []
  let emailsSent = 0

  // 1. Find stuck customers
  const stuckCustomers = await getStuckCustomers()

  for (const customer of stuckCustomers) {
    try {
      // Generate follow-up email via Claude
      const email = await generateEmail(
        customer.name,
        customer.email,
        `Starter tier customer stuck in onboarding at day ${customer.onboarding_day}. Health score: ${customer.health_score}. Features used: ${customer.features_used}/${customer.total_features}.`,
        'Send a helpful follow-up email to get them unstuck in onboarding'
      )

      // Send via Gmail
      await sendEmail(customer.email, email.subject, email.body)

      // Log everything
      await logEmailSent('starter', customer.id, customer.email, email.subject, 'onboarding_followup')
      await logAgentAction('starter', 'email_sent', customer.id, `Follow-up email sent to ${customer.name} (stuck at day ${customer.onboarding_day})`)

      actions.push(`Follow-up email sent to ${customer.name}`)
      emailsSent++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      await logAgentAction('starter', 'error', customer.id, `Failed to process ${customer.name}: ${msg}`)
      actions.push(`Error processing ${customer.name}: ${msg}`)
    }
  }

  // 2. Check for customers needing welcome emails (new signups)
  const allStarter = await getCustomersByTier('starter')
  const newCustomers = allStarter.filter(c => c.onboarding_day !== undefined && c.onboarding_day <= 1 && c.onboarding_status !== 'done')

  for (const customer of newCustomers) {
    try {
      const email = await generateEmail(
        customer.name,
        customer.email,
        `New starter customer at ${customer.company}. Just signed up.`,
        'Send a warm welcome email with getting-started steps'
      )

      await sendEmail(customer.email, email.subject, email.body)
      await logEmailSent('starter', customer.id, customer.email, email.subject, 'welcome')
      await logAgentAction('starter', 'email_sent', customer.id, `Welcome email sent to ${customer.name}`)

      actions.push(`Welcome email sent to ${customer.name}`)
      emailsSent++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      actions.push(`Error: ${msg}`)
    }
  }

  await logAgentAction('starter', 'agent_run', null, `Starter agent completed. Processed ${stuckCustomers.length + newCustomers.length} customers, sent ${emailsSent} emails.`)

  return { processed: stuckCustomers.length + newCustomers.length, emailsSent, actions }
}
