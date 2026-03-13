-- Audit Logging & Compliance Tables
-- Created for comprehensive security auditing and compliance reporting

-- Audit Logs Table: Core audit event tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  space_id INTEGER,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- e.g., FEATURE_CREATED, PERMISSION_GRANTED, etc.
  resource_type TEXT NOT NULL, -- e.g., Space, Feature, User, Permission
  resource_id INTEGER NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('info', 'warning', 'critical')),
  status TEXT NOT NULL CHECK(status IN ('success', 'failure')),
  error_message TEXT,
  changes_before TEXT, -- JSON: what changed from
  changes_after TEXT, -- JSON: what changed to
  metadata TEXT, -- JSON: additional context (IP, user agent, etc.)
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (space_id) REFERENCES spaces(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_space_id ON audit_logs(space_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_space_created ON audit_logs(space_id, created_at);

-- Permission Denial Logs Table: Track failed permission checks
CREATE TABLE IF NOT EXISTS permission_denial_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  space_id INTEGER,
  resource_type TEXT NOT NULL,
  resource_id INTEGER NOT NULL,
  required_permission TEXT NOT NULL,
  user_role TEXT,
  ip_address TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (space_id) REFERENCES spaces(id)
);

-- Create indexes for permission denial logs
CREATE INDEX IF NOT EXISTS idx_permission_denial_user_id ON permission_denial_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_denial_space_id ON permission_denial_logs(space_id);
CREATE INDEX IF NOT EXISTS idx_permission_denial_created_at ON permission_denial_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_permission_denial_user_created ON permission_denial_logs(user_id, created_at);

-- Compliance Reports Table: Periodic compliance snapshots
CREATE TABLE IF NOT EXISTS compliance_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  space_id INTEGER NOT NULL,
  report_type TEXT NOT NULL, -- access_log, permission_audit, data_access, compliance_snapshot
  period_start DATETIME NOT NULL,
  period_end DATETIME NOT NULL,
  total_actions INTEGER NOT NULL,
  critical_actions INTEGER NOT NULL,
  failed_actions INTEGER NOT NULL,
  unique_users INTEGER NOT NULL,
  data TEXT NOT NULL, -- JSON: detailed report data
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (space_id) REFERENCES spaces(id)
);

-- Create indexes for compliance reports
CREATE INDEX IF NOT EXISTS idx_compliance_space_id ON compliance_reports(space_id);
CREATE INDEX IF NOT EXISTS idx_compliance_report_type ON compliance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_compliance_created_at ON compliance_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_compliance_space_type ON compliance_reports(space_id, report_type);

-- Audit Log Actions Reference (documentation)
-- The following are the supported audit actions:
-- Space Management: SPACE_CREATED, SPACE_UPDATED, SPACE_DELETED
-- Environment Management: ENVIRONMENT_CREATED, ENVIRONMENT_UPDATED, ENVIRONMENT_DELETED
-- Feature Management: FEATURE_CREATED, FEATURE_UPDATED, FEATURE_DELETED
-- Flag Toggling: FLAG_ENABLED, FLAG_DISABLED
-- Team Management: MEMBER_INVITED, MEMBER_REMOVED
-- Permission Management: PERMISSION_GRANTED, PERMISSION_REVOKED
-- API Management: API_KEY_CREATED, API_KEY_ROTATED, API_KEY_REVOKED
-- Authentication: FAILED_LOGIN, SUCCESSFUL_LOGIN, PERMISSION_DENIED
-- Configuration: SETTINGS_CHANGED, ADVANCED_CONFIG_UPDATED
