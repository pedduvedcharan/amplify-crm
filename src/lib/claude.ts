import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  const client = getClient()
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: prompt }]

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt || 'You are RetainIQ, an AI customer success assistant. Be concise, professional, and actionable.',
    messages,
  })

  const textBlock = response.content.find(b => b.type === 'text')
  return textBlock ? textBlock.text : ''
}

export async function generateEmail(customerName: string, customerEmail: string, context: string, purpose: string): Promise<{ subject: string; body: string }> {
  const prompt = `Write a professional email for the following scenario:
Customer: ${customerName} (${customerEmail})
Context: ${context}
Purpose: ${purpose}

Return ONLY a JSON object with "subject" and "body" fields. No markdown, no code fences.`

  const raw = await generateText(prompt, 'You are RetainIQ email agent. Return only valid JSON with subject and body fields. Write warm, professional emails that drive action.')

  try {
    return JSON.parse(raw.trim())
  } catch {
    // Fallback: try to extract JSON from response
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    return { subject: `Follow-up from RetainIQ`, body: raw }
  }
}

export async function analyzeChurnRisk(company: string, data: Record<string, unknown>): Promise<{ analysis: string; actions: string[] }> {
  const prompt = `Analyze churn risk for enterprise customer:
Company: ${company}
Data: ${JSON.stringify(data)}

Return ONLY a JSON object with:
- "analysis": 2-3 sentence analysis of the risk
- "actions": array of 3 recommended actions

No markdown, no code fences.`

  const raw = await generateText(prompt, 'You are RetainIQ enterprise churn analyst. Return only valid JSON.')

  try {
    return JSON.parse(raw.trim())
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    return { analysis: raw, actions: ['Schedule QBR', 'Alert account manager', 'Review usage data'] }
  }
}

export async function answerFAQ(question: string, tier: string): Promise<string> {
  const systemPrompt = `You are the RetainIQ FAQ chatbot for ${tier} tier customers. Answer questions about the CRM platform concisely and helpfully. Keep answers under 150 words.`
  return generateText(question, systemPrompt)
}
