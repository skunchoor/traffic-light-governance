from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict


# Common Stage Schema
class StageItem(BaseModel):
    name: str
    status: str
    duration: Optional[float] = None


# PipelineRun Schemas
class PipelineRunCreate(BaseModel):
    workflow_name: str
    run_id: str
    run_number: Optional[int] = None
    project: Optional[str] = "skunchoor/traffic-light-governance"
    status: str
    trigger: Optional[str] = None
    branch: Optional[str] = None
    commit_sha: Optional[str] = None
    actor: Optional[str] = None
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    stages: List[Dict[str, Any]] = Field(default_factory=list)


class PipelineRunResponse(PipelineRunCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# GatekeeperReport Schemas
class GatekeeperReportCreate(BaseModel):
    pr_number: int
    pr_title: Optional[str] = None
    repo: str
    project: Optional[str] = "skunchoor/traffic-light-governance"
    traffic_light: str  # GREEN, YELLOW, RED
    test_passed: bool = False
    test_failures: int = 0
    security_findings: Dict[str, int] = Field(default_factory=dict)
    risk_reason: Optional[str] = None
    files_changed: List[str] = Field(default_factory=list)
    author: Optional[str] = None
    created_at: Optional[datetime] = None


class GatekeeperReportResponse(GatekeeperReportCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Deployment Schemas
class DeploymentCreate(BaseModel):
    environment: str
    version: str
    image_tag: Optional[str] = None
    project: Optional[str] = "skunchoor/traffic-light-governance"
    component: Optional[str] = "Azure Container Registry"
    status: str
    deployed_by: Optional[str] = None
    azure_resource: Optional[str] = None
    deployed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    rollback_of: Optional[str] = None


class DeploymentResponse(DeploymentCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ModelPromotion Schemas
class ModelPromotionCreate(BaseModel):
    model_name: str
    model_version: str
    project: Optional[str] = "skunchoor/traffic-light-governance"
    from_stage: str
    to_stage: str
    metrics: Dict[str, Any] = Field(default_factory=dict)
    decision: str
    decision_reason: Optional[str] = None
    promoted_by: Optional[str] = None
    promoted_at: Optional[datetime] = None


class ModelPromotionResponse(ModelPromotionCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# DatabricksPipelineRun Schemas
class DatabricksPipelineRunCreate(BaseModel):
    job_id: str
    run_id: str
    pipeline_name: str
    status: str
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    output_rows: Optional[int] = None
    notebook_path: Optional[str] = None
    cluster_id: Optional[str] = None


class DatabricksPipelineRunResponse(DatabricksPipelineRunCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# SecurityScan Schemas
class SecurityScanCreate(BaseModel):
    pipeline_run_id: Optional[int] = None
    tool_name: str
    project: Optional[str] = "skunchoor/traffic-light-governance"
    findings_count: int = 0
    high_count: int = 0
    medium_count: int = 0
    low_count: int = 0
    report_url: Optional[str] = None
    scanned_at: Optional[datetime] = None


class SecurityScanResponse(SecurityScanCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# SSE Event Schema
class SSEEvent(BaseModel):
    event_type: str
    payload: Dict[str, Any]
    timestamp: str


# Dashboard Summary & Aggregated Metrics
class DORAMetrics(BaseModel):
    deployment_frequency: float  # deploys per day
    lead_time_hours: float       # avg lead time
    change_failure_rate: float   # percentage
    mttr_minutes: float          # mean time to recovery


class DashboardSummary(BaseModel):
    total_pipeline_runs: int
    pass_rate: float
    avg_duration_seconds: float
    active_deployments: Dict[str, str]  # {staging: version, production: version}
    traffic_light_distribution: Dict[str, int]  # {GREEN: n, YELLOW: n, RED: n}
    recent_events: List[Dict[str, Any]]
    dora_metrics: DORAMetrics
    security_summary: Dict[str, Any]
