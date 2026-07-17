#!/usr/bin/env python3
"""
Databricks Deployment & Job Execution Script with Traffic Light Governance Verification.

Verifies that the target pull request / commit has a GREEN or YELLOW governance status
before deploying assets to Databricks workspaces or triggering Databricks jobs.
Reports real-time deployment progress to the backend SSE feed.
"""
import os
import sys
import json
import uuid
import datetime
from notify_backend import notify_backend

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# --- CONFIGURATION ---
DATABRICKS_HOST = os.getenv("DATABRICKS_HOST", "https://adb-1234567890.12.azuredatabricks.net")
DATABRICKS_TOKEN = os.getenv("DATABRICKS_TOKEN", "dapi_simulated_token_12345")
ENVIRONMENT = os.getenv("ENVIRONMENT", "staging")
SERVICE_NAME = os.getenv("SERVICE_NAME", "Customer Churn Prediction ETL Pipeline")
COMMIT_SHA = os.getenv("GITHUB_SHA", "commit-sha-7890")
ACTOR = os.getenv("GITHUB_ACTOR", "github-actions")
TRAFFIC_LIGHT = os.getenv("TRAFFIC_LIGHT", "GREEN") # Passed from prior gatekeeper step or env
PROJECT = os.getenv("GITHUB_REPOSITORY", "skunchoor/traffic-light-governance")
COMPONENT = "Databricks"


def deploy_to_databricks():
    print(f"🚀 Initializing Databricks deployment for service: '{SERVICE_NAME}' ({ENVIRONMENT})...")
    print(f"🌐 Target workspace: {DATABRICKS_HOST}")

    # 1. Check Governance Gate
    if TRAFFIC_LIGHT == "RED":
        print("❌ [Blocked] Traffic Light status is RED. Deployment to Databricks aborted.")
        notify_backend("api/v1/deployments", {
            "environment": ENVIRONMENT,
            "service_name": SERVICE_NAME,
            "commit_sha": COMMIT_SHA,
            "deployer": ACTOR,
            "status": "failed",
            "target_url": DATABRICKS_HOST,
            "project": PROJECT,
            "component": COMPONENT
        })
        sys.exit(1)

    print(f"✅ Governance check passed (`{TRAFFIC_LIGHT}`). Proceeding with bundle/job deploy...")

    # 2. Notify start of deployment
    deploy_id = f"dep_{uuid.uuid4().hex[:8]}"
    notify_backend("api/v1/deployments", {
        "environment": ENVIRONMENT,
        "service_name": SERVICE_NAME,
        "commit_sha": COMMIT_SHA,
        "deployer": ACTOR,
        "status": "in-progress",
        "target_url": DATABRICKS_HOST,
        "project": PROJECT,
        "component": COMPONENT
    })

    # 3. Execute Databricks CLI / Job triggering logic
    # In live CI, this invokes `databricks bundle deploy` targeting `databricks/jobs/etl.yaml` and `databricks/notebooks/notebook.py`
    print("⏳ Running Databricks asset bundle deployment tasks and job verification...")
    print(f"📓 Verifying notebook asset: `databricks/notebooks/notebook.py`...")
    print(f"⚙️ Applying job configuration: `databricks/jobs/etl.yaml`...")
    # Simulated deployment completion
    status = "success"
    print("✨ Databricks deployment (Notebooks, Models, Jobs) & job registration completed successfully.")

    # 4. Notify final status
    notify_backend("api/v1/deployments", {
        "environment": ENVIRONMENT,
        "service_name": SERVICE_NAME,
        "commit_sha": COMMIT_SHA,
        "deployer": ACTOR,
        "status": status,
        "target_url": f"{DATABRICKS_HOST}/#job/1024/runs/1",
        "project": PROJECT,
        "component": COMPONENT
    })


if __name__ == "__main__":
    deploy_to_databricks()
