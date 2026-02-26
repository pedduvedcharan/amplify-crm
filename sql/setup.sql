-- RetainIQ BigQuery Schema Setup
-- Run: bq query --use_legacy_sql=false < sql/setup.sql

-- Customers table
CREATE TABLE IF NOT EXISTS crm_data.customers (
  id STRING NOT NULL,
  name STRING,
  email STRING,
  company STRING,
  tier STRING,  -- starter | professional | enterprise
  health_score FLOAT64,
  churn_risk FLOAT64,
  logins_per_week FLOAT64,
  features_used INT64,
  total_features INT64,
  days_since_last_login INT64,
  support_tickets INT64,
  onboarding_status STRING,  -- on_track | stuck | done
  onboarding_day INT64,
  upsell_ready BOOL,
  upsell_value FLOAT64,
  arr FLOAT64,
  last_login STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Onboarding steps for starter customers
CREATE TABLE IF NOT EXISTS crm_data.onboarding_steps (
  customer_id STRING NOT NULL,
  step_name STRING,  -- profile | first_login | feature_use | integration | first_export
  completed BOOL DEFAULT FALSE,
  completed_at TIMESTAMP
);

-- Activity events (logins, feature usage, API calls)
CREATE TABLE IF NOT EXISTS crm_data.activity_events (
  id STRING NOT NULL,
  customer_id STRING NOT NULL,
  event_type STRING,  -- login | feature_use | api_call
  event_data STRING,  -- JSON string with details
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Agent action logs (audit trail)
CREATE TABLE IF NOT EXISTS crm_data.agent_logs (
  id STRING NOT NULL,
  agent_type STRING,  -- starter | professional | enterprise
  action_type STRING,  -- email_sent | churn_scan | agent_run | error | etc.
  customer_id STRING,
  details STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Emails sent by agents
CREATE TABLE IF NOT EXISTS crm_data.emails_sent (
  id STRING NOT NULL,
  agent_type STRING,
  customer_id STRING,
  to_email STRING,
  subject STRING,
  purpose STRING,  -- welcome | onboarding_followup | re_engagement | upsell | monthly_summary | churn_alert | weekly_report
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- FAQ queries logged
CREATE TABLE IF NOT EXISTS crm_data.faq_queries (
  id STRING NOT NULL,
  customer_id STRING,
  question STRING,
  answer STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Churn signals detected by enterprise agent
CREATE TABLE IF NOT EXISTS crm_data.churn_signals (
  id STRING NOT NULL,
  customer_id STRING NOT NULL,
  churn_score FLOAT64,
  severity STRING,  -- critical | high | medium | low
  analysis STRING,
  recommended_actions STRING,  -- JSON array
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Deals / pipeline
CREATE TABLE IF NOT EXISTS crm_data.deals (
  id STRING NOT NULL,
  customer_id STRING NOT NULL,
  deal_type STRING,  -- upsell | renewal
  value FLOAT64,
  status STRING,  -- ready | sent | awaiting | closed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Training data for BigQuery ML model
CREATE TABLE IF NOT EXISTS crm_data.training_data (
  customer_id STRING,
  login_frequency FLOAT64,
  feature_usage_pct FLOAT64,
  days_since_last_login INT64,
  support_ticket_count INT64,
  churned BOOL
);
