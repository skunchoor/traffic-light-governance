import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from api.models import (
    PipelineRun, GatekeeperReport, Deployment, ModelPromotion, DatabricksPipelineRun, SecurityScan
)


async def seed_if_empty(session: AsyncSession):
    """
    Check if DB is empty and seed with realistic historical data across last 30 days.
    """
    check = await session.execute(select(PipelineRun).limit(1))
    if check.scalars().first() is not None:
        return  # Already seeded

    now = datetime.now(timezone.utc)
    
    # 1. Pipeline Runs & Security Scans
    workflows = ["Traffic Light Gatekeeper", "Deploy to Azure", "Databricks Pipeline", "Model Promotion"]
    branches = ["main", "feature/auth-revamp", "fix/security-audit", "feature/data-pipeline"]
    actors = ["sunil", "mlops-bot", "ci-runner", "devops-lead"]
    
    pipeline_runs = []
    for i in range(1, 45):
        t_delta = timedelta(days=random.randint(0, 28), hours=random.randint(0, 23), minutes=random.randint(0, 59))
        start = now - t_delta
        duration = round(random.uniform(120, 480), 1)
        finish = start + timedelta(seconds=duration)
        status = random.choices(["success", "failed"], weights=[85, 15])[0]
        
        prun = PipelineRun(
            workflow_name=random.choice(workflows),
            run_id=f"run_100{i}",
            run_number=100 + i,
            status=status,
            trigger=random.choice(["push", "pull_request", "workflow_dispatch"]),
            branch=random.choice(branches),
            commit_sha=f"sha_{random.randint(100000, 999999)}",
            actor=random.choice(actors),
            started_at=start,
            finished_at=finish,
            duration_seconds=duration,
            stages=[
                {"name": "Checkout & Setup", "status": "success", "duration": round(duration * 0.1, 1)},
                {"name": "Unit Tests & PyTest", "status": status if random.random() < 0.3 else "success", "duration": round(duration * 0.4, 1)},
                {"name": "Parallel Security Matrix", "status": status if random.random() < 0.5 else "success", "duration": round(duration * 0.3, 1)},
                {"name": "Gatekeeper Decision / Deploy", "status": status, "duration": round(duration * 0.2, 1)},
            ]
        )
        session.add(prun)
        await session.flush()  # get prun.id
        pipeline_runs.append(prun)

        # Add parallel security scans for this run
        tools = ["semgrep", "bandit", "snyk", "safety", "pip-audit", "trivy", "gitleaks"]
        for tool in tools:
            high = 0 if status == "success" else random.randint(0, 2)
            med = random.randint(0, 4)
            low = random.randint(0, 8)
            scan = SecurityScan(
                pipeline_run_id=prun.id,
                tool_name=tool,
                findings_count=high + med + low,
                high_count=high,
                medium_count=med,
                low_count=low,
                report_url=f"https://github.com/skunchoor/traffic-light-governance/actions/runs/100{i}",
                scanned_at=finish
            )
            session.add(scan)

    # 2. Gatekeeper Reports
    for i in range(1, 25):
        t_delta = timedelta(days=random.randint(0, 28), hours=random.randint(0, 23))
        created = now - t_delta
        light = random.choices(["GREEN", "YELLOW", "RED"], weights=[65, 25, 10])[0]
        
        reasons = {
            "GREEN": "✅ Config/docs changes only (`config.yaml`) + 100% tests pass + 0 high vulnerabilities.",
            "YELLOW": "⚠️ Core logic (`src/utils.py`) modified + tests pass. Manual peer review required.",
            "RED": "🚨 High security vulnerability detected in `requirements.txt` (Snyk: CVE-2024-345) OR test failures."
        }
        
        g_report = GatekeeperReport(
            pr_number=80 + i,
            pr_title=f"Feature update #{80+i}: {random.choice(['model config tuning', 'api performance boost', 'docker optimization', 'etl pipeline fix'])}",
            repo="skunchoor/traffic-light-governance",
            traffic_light=light,
            test_passed=(light != "RED" or random.random() > 0.5),
            test_failures=0 if light != "RED" else random.randint(1, 3),
            security_findings={"semgrep": random.randint(0, 2), "snyk": 1 if light == "RED" else 0, "bandit": random.randint(0, 1)},
            risk_reason=reasons[light],
            files_changed=random.sample(["src/app.py", "requirements.txt", "Dockerfile", "config/settings.yaml", "README.md", "pipelines/notebooks/etl.py"], k=random.randint(1, 3)),
            author=random.choice(actors),
            created_at=created
        )
        session.add(g_report)

    # 3. Deployments (Staging & Production)
    versions = ["v1.0.1", "v1.1.0", "v1.1.2", "v1.2.0", "v1.2.3", "v2.0.0", "v2.0.1"]
    for i, ver in enumerate(versions):
        t_delta = timedelta(days=int((len(versions)-i) * 4))
        deployed_at = now - t_delta
        
        # Staging deploy
        staging = Deployment(
            environment="staging",
            version=f"{ver}-rc.1",
            image_tag=f"trafficlightacr.azurecr.io/app:{ver}-rc.1",
            status="success",
            deployed_by="github-actions[bot]",
            azure_resource="aca-traffic-light-staging",
            deployed_at=deployed_at - timedelta(hours=3),
            duration_seconds=145.0
        )
        session.add(staging)
        
        # Prod deploy
        prod_status = "success" if i != 2 else "rolled-back"
        prod = Deployment(
            environment="production",
            version=ver,
            image_tag=f"trafficlightacr.azurecr.io/app:{ver}",
            status=prod_status,
            deployed_by="sunil",
            azure_resource="aca-traffic-light-prod",
            deployed_at=deployed_at,
            duration_seconds=210.5,
            rollback_of="v1.1.1" if prod_status == "rolled-back" else None
        )
        session.add(prod)

    # 4. Model Promotions
    models = [("ad-genie-ctr", "v1", "None", "Staging", "GREEN"),
              ("ad-genie-ctr", "v1", "Staging", "Production", "GREEN"),
              ("ad-genie-ctr", "v2", "None", "Staging", "YELLOW"),
              ("ad-genie-ctr", "v2", "Staging", "Production", "GREEN"),
              ("traffic-classifier", "v3", "None", "Staging", "GREEN"),
              ("traffic-classifier", "v3", "Staging", "Production", "GREEN"),
              ("fraud-detector", "v4", "None", "Staging", "RED")]
    
    for idx, (m_name, m_ver, f_stg, t_stg, dec) in enumerate(models):
        t_delta = timedelta(days=int((len(models)-idx) * 3))
        session.add(ModelPromotion(
            model_name=m_name,
            model_version=m_ver,
            from_stage=f_stg,
            to_stage=t_stg,
            metrics={
                "accuracy": round(random.uniform(0.82, 0.94), 3) if dec != "RED" else 0.68,
                "f1_score": round(random.uniform(0.80, 0.92), 3) if dec != "RED" else 0.64,
                "data_drift_score": round(random.uniform(0.01, 0.05), 3)
            },
            decision=dec,
            decision_reason=f"Model evaluation: Accuracy threshold {'passed (>0.85)' if dec=='GREEN' else ('warning (0.70-0.85)' if dec=='YELLOW' else 'failed (<0.70)')}",
            promoted_by="mlflow-automation",
            promoted_at=now - t_delta
        ))

    # 5. Databricks Pipeline Runs
    for i in range(1, 15):
        t_delta = timedelta(days=random.randint(0, 25), hours=random.randint(0, 23))
        start = now - t_delta
        dur = round(random.uniform(300, 900), 1)
        session.add(DatabricksPipelineRun(
            job_id="job_882910",
            run_id=f"db_run_{500+i}",
            pipeline_name="bronze_to_gold_traffic_governance_dlt",
            status="SUCCESS" if random.random() > 0.1 else "FAILED",
            started_at=start,
            finished_at=start + timedelta(seconds=dur),
            duration_seconds=dur,
            output_rows=random.randint(120000, 850000),
            notebook_path="/pipelines/notebooks/example_etl.py",
            cluster_id="0716-cluster-ds-mlops"
        ))

    await session.commit()
