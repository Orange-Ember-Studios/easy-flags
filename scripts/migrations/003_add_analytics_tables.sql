-- Migration: Add Analytics & Observability Tables
-- Description: Creates tables for flag evaluations, usage metrics, and performance tracking
-- Date: 2026-03-12

CREATE TABLE IF NOT EXISTS flag_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  space_id INTEGER NOT NULL,
  environment_id INTEGER NOT NULL,
  feature_id INTEGER NOT NULL,
  api_key_hash TEXT NOT NULL,
  was_enabled BOOLEAN DEFAULT 0,
  evaluation_result TEXT NOT NULL,
  evaluation_time_ms INTEGER NOT NULL,
  error_message TEXT,
  context_data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (space_id) REFERENCES spaces(id),
  FOREIGN KEY (environment_id) REFERENCES environments(id),
  FOREIGN KEY (feature_id) REFERENCES features(id),
  INDEX idx_flag_evaluations_space_env (space_id, environment_id),
  INDEX idx_flag_evaluations_feature (feature_id),
  INDEX idx_flag_evaluations_created (created_at)
);

CREATE TABLE IF NOT EXISTS flag_usage_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  space_id INTEGER NOT NULL,
  environment_id INTEGER NOT NULL,
  feature_id INTEGER NOT NULL,
  metric_date TEXT NOT NULL,
  total_evaluations INTEGER DEFAULT 0,
  enabled_count INTEGER DEFAULT 0,
  disabled_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  avg_evaluation_time_ms REAL DEFAULT 0,
  min_evaluation_time_ms INTEGER DEFAULT 0,
  max_evaluation_time_ms INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (space_id) REFERENCES spaces(id),
  FOREIGN KEY (environment_id) REFERENCES environments(id),
  FOREIGN KEY (feature_id) REFERENCES features(id),
  UNIQUE(space_id, environment_id, feature_id, metric_date),
  INDEX idx_flag_usage_metrics_space (space_id),
  INDEX idx_flag_usage_metrics_feature (feature_id),
  INDEX idx_flag_usage_metrics_date (metric_date)
);

CREATE TABLE IF NOT EXISTS performance_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  space_id INTEGER NOT NULL,
  metric_type TEXT NOT NULL,
  value_ms INTEGER NOT NULL,
  endpoint TEXT,
  environment_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (space_id) REFERENCES spaces(id),
  FOREIGN KEY (environment_id) REFERENCES environments(id),
  INDEX idx_performance_metrics_space (space_id),
  INDEX idx_performance_metrics_type (metric_type),
  INDEX idx_performance_metrics_endpoint (endpoint),
  INDEX idx_performance_metrics_created (created_at)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_flag_evaluations_time_range 
ON flag_evaluations(space_id, created_at);

CREATE INDEX IF NOT EXISTS idx_flag_usage_metrics_space_date 
ON flag_usage_metrics(space_id, metric_date);
