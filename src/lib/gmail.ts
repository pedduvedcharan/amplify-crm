import { google } from 'googleapis'

function getAuth() {
  const credentials = process.env.GCP_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON)
    : undefined

  if (!credentials) throw new Error('GCP_SERVICE_ACCOUNT_JSON not set')

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    subject: process.env.GMAIL_SENDER_EMAIL,
  })
  return auth
}

export async function sendEmail(to: string, subject: string, body: string): Promise<string> {
  const auth = getAuth()
  const gmail = google.gmail({ version: 'v1', auth })

  const raw = Buffer.from(
    `From: RetainIQ <${process.env.GMAIL_SENDER_EMAIL}>\r\n` +
    `To: ${to}\r\n` +
    `Subject: ${subject}\r\n` +
    `Content-Type: text/plain; charset=utf-8\r\n\r\n` +
    body
  ).toString('base64url')

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  })

  return res.data.id || 'sent'
}
