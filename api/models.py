from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from api.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id = Column(Integer, primary_key=True, index=True)
    workflow_name = Column(String, index=True, nullable=False)
    run_id = Column(String, unique=True, index=True, nullable=False)
    run_number = Column(Integer, nullable=True)
    status = Column(String, index=True, nullable=False)  # running, success, failed
    trigger = Column(String, nullable=True)  # push, pull_request, workflow_dispatch
    branch = Column(String, nullable=True)
    commit_sha = Column(String, nullable=True)
    actor = Column(String, nullable=True)
    started_at = Column(DateTime(timezone=True), default=utcnow)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Float, nullable=True)
    stages = Column(JSON, default=list)  # list of dicts: [{name, status, duration}]

    security_scans = relationship("SecurityScan", back_populates="pipeline_run", cascade="all, delete-orphan")


class GatekeeperReport(Base):
    __tablename__ = "gatekeeper_reports"

    id = Column(Integer, primary_key=True, index=True)
    pr_number = Column(Integer, index=True, nullable=False)
    pr_title = Column(String, nullable=True)
    repo = Column(String, index=True, nullable=False)
    traffic_light = Column(String, index=True, nullable=False)  # GREEN, YELLOW, RED
    test_passed = Column(Boolean, default=False)
    test_failures = Column(Integer, default=0)
    security_findings = Column(JSON, default=dict)  # {tool: count}
    risk_reason = Column(Text, nullable=True)
    files_changed = Column(JSON, default=list)
    author = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(Integer, primary_key=True, index=True)
    environment = Column(String, index=True, nullable=False)  # staging, production
    version = Column(String, nullable=False)
    image_tag = Column(String, nullable=True)
    status = Column(String, index=True, nullable=False)  # pending, deploying, success, failed, rolled-back
    deployed_by = Column(String, nullable=True)
    azure_resource = Column(String, nullable=True)
    deployed_at = Column(DateTime(timezone=True), default=utcnow)
    duration_seconds = Column(Float, nullable=True)
    rollback_of = Column(String, nullable=True)


class ModelPromotion(Base):
    __tablename__ = "model_promotions"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, index=True, nullable=False)
    model_version = Column(String, nullable=False)
    from_stage = Column(String, nullable=False)  # None, Staging
    to_stage = Column(String, nullable=False)  # Staging, Production
    metrics = Column(JSON, default=dict)  # {accuracy, f1, auc, drift}
    decision = Column(String, index=True, nullable=False)  # GREEN, YELLOW, RED
    decision_reason = Column(Text, nullable=True)
    promoted_by = Column(String, nullable=True)
    promoted_at = Column(DateTime(timezone=True), default=utcnow)


class DatabricksPipelineRun(Base):
    __tablename__ = "databricks_pipeline_runs"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String, index=True, nullable=False)
    run_id = Column(String, unique=True, index=True, nullable=False)
    pipeline_name = Column(String, index=True, nullable=False)
    status = Column(String, index=True, nullable=False)  # PENDING, RUNNING, SUCCESS, FAILED
    started_at = Column(DateTime(timezone=True), default=utcnow)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Float, nullable=True)
    output_rows = Column(Integer, nullable=True)
    notebook_path = Column(String, nullable=True)
    cluster_id = Column(String, nullable=True)


class SecurityScan(Base):
    __tablename__ = "security_scans"

    id = Column(Integer, primary_key=True, index=True)
    pipeline_run_id = Column(Integer, ForeignKey("pipeline_runs.id"), nullable=True)
    tool_name = Column(String, index=True, nullable=False)  # semgrep, bandit, snyk, safety, pip-audit, trivy, gitleaks
    findings_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    report_url = Column(String, nullable=True)
    scanned_at = Column(DateTime(timezone=True), default=utcnow)

    pipeline_run = relationship("PipelineRun", back_populates="security_scans")
