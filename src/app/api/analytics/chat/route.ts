import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { query } from '@/lib/bigquery'

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

const SCHEMA_CONTEXT = `You have access to a BigQuery dataset called "${process.env.BQ_DATASET || 'crm_data'}". Here are the tables:

**customers** - Main customer table (10,000 rows)
Columns: id (STRING), name (STRING), email (STRING), company (STRING), tier (STRING: 'starter'|'professional'|'enterprise'), health_score (FLOAT64, 0-100), churn_risk (FLOAT64, 0-100), logins_per_week (FLOAT64), features_used (INT64), total_features (INT64), days_since_last_login (INT64), support_tickets (INT64), onboarding_status (STRING: 'on_track'|'stuck'|'done'), onboarding_day (INT64), upsell_ready (BOOL), upsell_value (FLOAT64), arr (FLOAT64 - annual recurring revenue), last_login (STRING), created_at (TIMESTAMP)

**agent_logs** - AI agent action audit trail
Columns: id (STRING), agent_type (STRING), action_type (STRING), customer_id (STRING), details (STRING), created_at (TIMESTAMP)

**emails_sent** - Emails sent by AI agents
Columns: id (STRING), agent_type (STRING), customer_id (STRING), to_email (STRING), subject (STRING), purpose (STRING), sent_at (TIMESTAMP)

**churn_signals** - Churn risk signals detected
Columns: id (STRING), customer_id (STRING), churn_score (FLOAT64), severity (STRING), analysis (STRING), recommended_actions (STRING), detected_at (TIMESTAMP)

Tier breakdown: starter (~4439 customers, avg $123/mo), professional (~4011 customers, avg $2002/mo), enterprise (~1550 customers, avg $7659/mo)`

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const client = getClient()
    const dataset = process.env.BQ_DATASET || 'crm_data'

    // Step 1: Ask Claude to generate a SQL query
    const sqlMessages: Anthropic.MessageParam[] = [
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const sqlResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `${SCHEMA_CONTEXT}

You are a BigQuery SQL expert for RetainIQ CRM. When the user asks a question about customer data, generate a BigQuery Standard SQL query to answer it.

IMPORTANT RULES:
- Always use backtick-quoted table names: \`${dataset}.customers\`, \`${dataset}.agent_logs\`, etc.
- Use BigQuery Standard SQL syntax (not legacy SQL)
- LIMIT results to 20 rows max unless the user asks for more
- For aggregations, always include meaningful aliases
- Return ONLY the SQL query, no explanation, no markdown code fences, no backticks around the whole thing
- If the question is conversational (greeting, thank you, etc.) or cannot be answered with SQL, return exactly: NO_SQL_NEEDED
- If the question is about something not in the schema, return exactly: NO_SQL_NEEDED`,
      messages: sqlMessages,
    })

    const sqlText = sqlResponse.content.find(b => b.type === 'text')?.text?.trim() || ''

    // If no SQL needed (conversational question)
    if (sqlText === 'NO_SQL_NEEDED' || !sqlText) {
      const chatResponse = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: `You are RetainIQ Analytics Assistant, a friendly AI chatbot for Customer Success Managers. You help them understand their customer data. If they greet you, greet them back and suggest what kinds of questions they can ask about their 10,000 CRM customers across starter, professional, and enterprise tiers. Be concise and helpful.`,
        messages: sqlMessages,
      })
      const answer = chatResponse.content.find(b => b.type === 'text')?.text || ''
      return NextResponse.json({ answer, sql: null, data: null })
    }

    // Step 2: Execute the SQL query
    let queryResults: Record<string, unknown>[] = []
    let queryError: string | null = null

    try {
      queryResults = await query(sqlText)
    } catch (err) {
      queryError = err instanceof Error ? err.message : 'Query execution failed'
    }

    // Step 3: Ask Claude to summarize the results
    const summaryPrompt = queryError
      ? `The user asked: "${message}"\n\nI tried to run this SQL query:\n${sqlText}\n\nBut got an error: ${queryError}\n\nPlease explain what went wrong in simple terms and suggest how they could rephrase their question.`
      : `The user asked: "${message}"\n\nI ran this SQL query:\n${sqlText}\n\nResults (${queryResults.length} rows):\n${JSON.stringify(queryResults.slice(0, 20), null, 2)}\n\nPlease provide a clear, concise answer to the user's question based on these results. Use specific numbers from the data. Format nicely with bullet points if there are multiple data points. Keep it under 200 words.`

    const summaryResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'You are RetainIQ Analytics Assistant. Summarize BigQuery results in a clear, actionable way for Customer Success Managers. Use bullet points for lists. Include specific numbers. Be concise.',
      messages: [{ role: 'user', content: summaryPrompt }],
    })

    const answer = summaryResponse.content.find(b => b.type === 'text')?.text || ''

    return NextResponse.json({
      answer,
      sql: sqlText,
      data: queryResults.slice(0, 20),
      rowCount: queryResults.length,
      error: queryError,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
