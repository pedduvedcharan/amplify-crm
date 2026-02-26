import { BigQuery } from '@google-cloud/bigquery'

const DATASET = process.env.BQ_DATASET || 'crm_data'

let _bq: BigQuery | null = null

function getBQ(): BigQuery {
  if (!_bq) {
    // Support both JSON string and file-based credentials
    if (process.env.GCP_SERVICE_ACCOUNT_JSON) {
      const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON)
      _bq = new BigQuery({ credentials, projectId: credentials?.project_id })
    } else {
      // Falls back to GOOGLE_APPLICATION_CREDENTIALS env var (file path)
      _bq = new BigQuery({ projectId: process.env.GCP_PROJECT_ID })
    }
  }
  return _bq
}

export async function query<T = Record<string, unknown>>(sql: string, params?: Record<string, unknown>): Promise<T[]> {
  const bq = getBQ()
  const options: { query: string; params?: Record<string, unknown> } = { query: sql }
  if (params) options.params = params
  const [rows] = await bq.query(options)
  return rows as T[]
}

export async function insert(table: string, rows: Record<string, unknown> | Record<string, unknown>[]) {
  const bq = getBQ()
  const dataset = bq.dataset(DATASET)
  const tbl = dataset.table(table)
  await tbl.insert(Array.isArray(rows) ? rows : [rows])
}

export { DATASET }
