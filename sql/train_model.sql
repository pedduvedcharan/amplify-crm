-- Train churn prediction model
-- Run: bq query --use_legacy_sql=false < sql/train_model.sql

CREATE OR REPLACE MODEL crm_data.churn_model
OPTIONS(
  model_type='logistic_reg',
  input_label_cols=['churned'],
  auto_class_weights=TRUE
) AS
SELECT
  login_frequency,
  feature_usage_pct,
  days_since_last_login,
  support_ticket_count,
  churned
FROM crm_data.training_data;
