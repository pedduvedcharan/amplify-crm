import { getCustomersByTier, updateChurnScore } from '../db/customers'
import { analyzeChurnRisk, generateText } from '../claude'
import { sendEmail } from '../gmail'
import { createSheet, scheduleQBR } from '../workspace'
import { logAgentAction, logEmailSent } from '../db/logs'
import { runChurnPrediction, writeChurnSignal } from '../db/churn'

export async function runEnterpriseAgent(): Promise<{ processed: number; alerts: number; actions: string[] }> {
  const actions: string[] = []
  let alerts = 0

  // 1. Run BigQuery ML churn prediction
  let predictions: { customer_id: string; churn_score: number }[] = []
  try {
    predictions = await runChurnPrediction()
    await logAgentAction('enterprise', 'churn_scan', null, `Churn prediction ran for ${predictions.length} enterprise customers`)
    actions.push(`Churn scores updated for ${predictions.length} customers`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    await logAgentAction('enterprise', 'error', null, `Churn prediction failed: ${msg}`)
    actions.push(`Churn prediction error: ${msg}`)
  }

  // 2. Update churn scores and handle critical/high risk
  const customers = await getCustomersByTier('enterprise')

  for (const pred of predictions) {
    try {
      await updateChurnScore(pred.customer_id, pred.churn_score)

      const customer = customers.find(c => c.id === pred.customer_id)
      if (!customer) continue

      if (pred.churn_score > 80) {
        // CRITICAL — full analysis + alert + QBR
        const analysis = await analyzeChurnRisk(customer.company, {
          churn_score: pred.churn_score,
          logins_per_week: customer.logins_per_week,
          features_used: customer.features_used,
          total_features: customer.total_features,
          days_since_last_login: customer.days_since_last_login,
          support_tickets: customer.support_tickets,
        })

        await writeChurnSignal(customer.id, pred.churn_score, 'critical', analysis.analysis, analysis.actions)

        // Alert email to account manager
        const alertBody = `CRITICAL CHURN ALERT: ${customer.company}\n\nChurn Score: ${pred.churn_score}%\n\nAnalysis:\n${analysis.analysis}\n\nRecommended Actions:\n${analysis.actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n— RetainIQ Enterprise Agent`

        await sendEmail(
          process.env.GMAIL_SENDER_EMAIL || 'team@retainiq.com',
          `🔴 CRITICAL: ${customer.company} churn risk at ${pred.churn_score}%`,
          alertBody
        )
        await logEmailSent('enterprise', customer.id, 'account_manager', `Critical alert: ${customer.company}`, 'churn_alert')

        // Schedule emergency QBR
        const qbrDate = new Date()
        qbrDate.setDate(qbrDate.getDate() + 7)
        try {
          await scheduleQBR(
            `Emergency QBR: ${customer.company}`,
            `Churn risk at ${pred.churn_score}%. ${analysis.analysis}`,
            qbrDate.toISOString(),
            [customer.email]
          )
          await logAgentAction('enterprise', 'qbr_scheduled', customer.id, `Emergency QBR scheduled for ${customer.company}`)
          actions.push(`QBR scheduled for ${customer.company}`)
        } catch {
          actions.push(`QBR scheduling skipped for ${customer.company}`)
        }

        await logAgentAction('enterprise', 'critical_alert', customer.id, `CRITICAL: ${customer.company} at ${pred.churn_score}% churn risk`)
        actions.push(`CRITICAL alert: ${customer.company} (${pred.churn_score}%)`)
        alerts++

      } else if (pred.churn_score > 60) {
        // HIGH — analysis + warning email
        const analysis = await analyzeChurnRisk(customer.company, {
          churn_score: pred.churn_score,
          logins_per_week: customer.logins_per_week,
          features_used: customer.features_used,
          days_since_last_login: customer.days_since_last_login,
        })

        await writeChurnSignal(customer.id, pred.churn_score, 'high', analysis.analysis, analysis.actions)
        await logAgentAction('enterprise', 'high_risk', customer.id, `HIGH risk: ${customer.company} at ${pred.churn_score}%`)
        actions.push(`HIGH risk flagged: ${customer.company} (${pred.churn_score}%)`)
        alerts++
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      actions.push(`Error processing ${pred.customer_id}: ${msg}`)
    }
  }

  await logAgentAction('enterprise', 'agent_run', null, `Enterprise agent completed. ${predictions.length} scored, ${alerts} alerts.`)
  return { processed: predictions.length, alerts, actions }
}

export async function runWeeklyReport(): Promise<{ reportUrl: string; actions: string[] }> {
  const actions: string[] = []

  const customers = await getCustomersByTier('enterprise')

  // Generate Claude executive summary
  const summaryPrompt = `Write a 200-word executive summary for this week's enterprise customer health report. Here are the 10 enterprise accounts:\n\n${customers.map(c => `${c.company}: Health ${c.health_score}%, Churn Risk ${c.churn_risk}%, Logins ${c.logins_per_week}/wk, Features ${c.features_used}/${c.total_features}`).join('\n')}\n\nHighlight risks, wins, and recommended focus areas.`

  const summary = await generateText(summaryPrompt, 'You are RetainIQ executive report writer. Be concise and data-driven.')

  // Create Google Sheet
  const headers = ['Company', 'Health Score', 'Churn Risk', 'Logins/Week', 'Features Used', 'Support Tickets', 'Status']
  const rows = customers.map(c => [
    c.company,
    `${c.health_score}%`,
    `${c.churn_risk}%`,
    String(c.logins_per_week),
    `${c.features_used}/${c.total_features}`,
    String(c.support_tickets),
    c.churn_risk > 80 ? 'CRITICAL' : c.churn_risk > 60 ? 'HIGH RISK' : c.churn_risk > 30 ? 'MONITOR' : 'HEALTHY',
  ])

  let reportUrl = ''
  try {
    reportUrl = await createSheet(`RetainIQ Weekly Report - ${new Date().toLocaleDateString()}`, [headers, ...rows])
    actions.push(`Report created: ${reportUrl}`)
  } catch {
    actions.push('Google Sheets report creation skipped')
  }

  // Email the report
  const emailBody = `Weekly Enterprise Report\n\n${summary}\n\nView full report: ${reportUrl || 'See BigQuery dashboard'}\n\n— RetainIQ Enterprise Agent`

  try {
    await sendEmail(
      process.env.GMAIL_SENDER_EMAIL || 'team@retainiq.com',
      `📊 RetainIQ Weekly Report - ${new Date().toLocaleDateString()}`,
      emailBody
    )
    await logEmailSent('enterprise', '', 'account_manager', 'Weekly report', 'weekly_report')
    actions.push('Report emailed to account manager')
  } catch {
    actions.push('Report email skipped')
  }

  await logAgentAction('enterprise', 'weekly_report', null, `Weekly report generated. ${customers.length} customers analyzed.`)
  return { reportUrl, actions }
}
