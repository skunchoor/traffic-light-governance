from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from api.database import get_db
from api.auth import verify_api_key
from api.models import (
    PipelineRun, GatekeeperReport, Deployment, ModelPromotion, DatabricksPipelineRun, SecurityScan
)
from api.sse_manager import sse_manager

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/github", status_code=status.HTTP_202_ACCEPTED, dependencies=[Depends(verify_api_key)])
async def ingest_github_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Unified ingestion endpoint for GitHub Actions workflows.
    Accepts structured JSON payload from notify_backend.py with `event_type` and `data`.
    Saves to SQLite/Turso and broadcasts real-time SSE event to the React dashboard.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = body.get("event_type")
    data = body.get("data", {})

    if not event_type or not data:
        raise HTTPException(status_code=400, detail="Missing event_type or data field")

    saved_id = None
    broadcast_type = event_type

    if event_type == "pipeline":
        prun = PipelineRun(
            workflow_name=data.get("workflow_name", "Unknown Workflow"),
            run_id=str(data.get("run_id", f"run_{datetime.now(timezone.utc).timestamp()}")),
            run_number=data.get("run_number"),
            status=data.get("status", "running"),
            trigger=data.get("trigger", "push"),
            branch=data.get("branch", "main"),
            commit_sha=data.get("commit_sha"),
            actor=data.get("actor", "github-actions"),
            duration_seconds=data.get("duration_seconds"),
            stages=data.get("stages", [])
        )
        db.add(prun)
        await db.flush()
        saved_id = prun.id

        # Check if security scans are bundled
        scans = data.get("security_scans", [])
        for scan_data in scans:
            s = SecurityScan(
                pipeline_run_id=prun.id,
                tool_name=scan_data.get("tool_name", "unknown"),
                findings_count=scan_data.get("findings_count", 0),
                high_count=scan_data.get("high_count", 0),
                medium_count=scan_data.get("medium_count", 0),
                low_count=scan_data.get("low_count", 0),
                report_url=scan_data.get("report_url")
            )
            db.add(s)

    elif event_type == "gatekeeper":
        grep = GatekeeperReport(
            pr_number=data.get("pr_number", 0),
            pr_title=data.get("pr_title", ""),
            repo=data.get("repo", "skunchoor/traffic-light-governance"),
            traffic_light=data.get("traffic_light", "GREEN"),
            test_passed=data.get("test_passed", True),
            test_failures=data.get("test_failures", 0),
            security_findings=data.get("security_findings", {}),
            risk_reason=data.get("risk_reason", ""),
            files_changed=data.get("files_changed", []),
            author=data.get("author", "github-actions")
        )
        db.add(grep)
        await db.flush()
        saved_id = grep.id

    elif event_type == "deployment":
        dep = Deployment(
            environment=data.get("environment", "staging"),
            version=data.get("version", "v1.0.0"),
            image_tag=data.get("image_tag"),
            status=data.get("status", "deploying"),
            deployed_by=data.get("deployed_by", "github-actions"),
            azure_resource=data.get("azure_resource"),
            duration_seconds=data.get("duration_seconds"),
            rollback_of=data.get("rollback_of")
        )
        db.add(dep)
        await db.flush()
        saved_id = dep.id

    elif event_type == "model_promotion":
        mp = ModelPromotion(
            model_name=data.get("model_name", "model"),
            model_version=data.get("model_version", "v1"),
            from_stage=data.get("from_stage", "None"),
            to_stage=data.get("to_stage", "Staging"),
            metrics=data.get("metrics", {}),
            decision=data.get("decision", "GREEN"),
            decision_reason=data.get("decision_reason", ""),
            promoted_by=data.get("promoted_by", "github-actions")
        )
        db.add(mp)
        await db.flush()
        saved_id = mp.id

    elif event_type == "databricks_pipeline":
        db_run = DatabricksPipelineRun(
            job_id=str(data.get("job_id", "")),
            run_id=str(data.get("run_id", "")),
            pipeline_name=data.get("pipeline_name", "databricks_dlt"),
            status=data.get("status", "RUNNING"),
            duration_seconds=data.get("duration_seconds"),
            output_rows=data.get("output_rows"),
            notebook_path=data.get("notebook_path"),
            cluster_id=data.get("cluster_id")
        )
        db.add(db_run)
        await db.flush()
        saved_id = db_run.id

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported event_type: {event_type}")

    await db.commit()

    # Broadcast via SSE
    await sse_manager.broadcast(
        event_type=f"{broadcast_type}_update",
        payload={"id": saved_id, "event_type": event_type, "data": data}
    )

    return {"status": "accepted", "event_type": event_type, "saved_id": saved_id}
