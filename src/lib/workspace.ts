import { google } from 'googleapis'

function getAuth(scopes: string[]) {
  const credentials = process.env.GCP_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON)
    : undefined
  if (!credentials) throw new Error('GCP_SERVICE_ACCOUNT_JSON not set')
  return new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes,
  })
}

// Google Sheets
export async function createSheet(title: string, data: string[][]): Promise<string> {
  const auth = getAuth(['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'])
  const sheets = google.sheets({ version: 'v4', auth })

  const res = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
      sheets: [{ data: [{ rowData: data.map(row => ({ values: row.map(cell => ({ userEnteredValue: { stringValue: cell } })) })) }] }],
    },
  })

  // Move to folder if configured
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
  if (folderId && res.data.spreadsheetId) {
    const drive = google.drive({ version: 'v3', auth })
    await drive.files.update({
      fileId: res.data.spreadsheetId,
      addParents: folderId,
      fields: 'id, parents',
    })
  }

  return res.data.spreadsheetUrl || res.data.spreadsheetId || ''
}

// Google Calendar
export async function scheduleQBR(summary: string, description: string, dateTime: string, attendees: string[]): Promise<string> {
  const auth = getAuth(['https://www.googleapis.com/auth/calendar'])
  const calendar = google.calendar({ version: 'v3', auth })

  const endTime = new Date(new Date(dateTime).getTime() + 30 * 60000).toISOString()

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary,
      description,
      start: { dateTime, timeZone: 'America/Chicago' },
      end: { dateTime: endTime, timeZone: 'America/Chicago' },
      attendees: attendees.map(email => ({ email })),
    },
  })

  return res.data.htmlLink || ''
}

// Google Drive — upload file
export async function uploadToDrive(name: string, content: string, mimeType = 'text/plain'): Promise<string> {
  const auth = getAuth(['https://www.googleapis.com/auth/drive.file'])
  const drive = google.drive({ version: 'v3', auth })

  const res = await drive.files.create({
    requestBody: {
      name,
      parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : undefined,
    },
    media: { mimeType, body: content },
    fields: 'id, webViewLink',
  })

  return res.data.webViewLink || res.data.id || ''
}
