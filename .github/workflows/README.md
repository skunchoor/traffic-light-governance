# 🚦 Reusable Workflows & Governance Integration Guide

This directory contains our enterprise-grade **Reusable Workflows** and caller templates. Any repository—whether **inside the `skunchoor` organization** or **outside the organization (personal/third-party repos)**—can integrate automated **Traffic Light Governance, Security Radar Scans, and MLOps/DevOps CI/CD Pipelines** with just a few lines of YAML.

---

## 📑 Table of Contents
1. [Overview of Reusable Workflows](#1-overview-of-reusable-workflows)
2. [Usage Inside the Organization (`skunchoor`)](#2-usage-inside-the-organization-skunchoor)
3. [Usage Outside the Organization / Personal Repositories](#3-usage-outside-the-organization--personal-repositories)
4. [Inputs & Secrets Reference](#4-inputs--secrets-reference)
5. [Composite Actions Integration](#5-composite-actions-integration)

---

## 1. Overview of Reusable Workflows

We provide two primary reusable workflows:

| Workflow File | Purpose | Trigger Events |
| :--- | :--- | :--- |
| **`reusable-gatekeeper.yml`** | Evaluates Pull Requests using 7 SAST/SCA/Secret scanners (`Semgrep`, `Bandit`, `Snyk`, `Safety`, `pip-audit`, `Trivy`, `Gitleaks`) + `pytest` coverage. Generates automated `GREEN`, `YELLOW`, or `RED` decision and comments on the PR. | `pull_request` |
| **`reusable-ci-cd-pipeline.yml`** | Orchestrates post-merge builds, triggers composite deployment actions (`azure-container-deploy`, `databricks-deploy`), records deployment records, and posts real-time telemetry to the dashboard. | `push` (to `main`/`staging`), `workflow_dispatch` |

---

## 2. Usage Inside the Organization (`skunchoor`)

For repositories inside the `skunchoor` organization (e.g., `skunchoor/flowbuilder`, `skunchoor/vitalflow`, `skunchoor/ad-genie`, `skunchoor/retail-lens`), **Organization Secrets** (`BACKEND_API_URL`, `BACKEND_API_KEY`, `AZURE_CREDENTIALS`, `DATABRICKS_HOST`, `DATABRICKS_TOKEN`) are automatically shared across repositories.

You only need to pass `secrets: inherit` and reference `@main` (or a specific release tag/branch):

### `.github/workflows/governance-pipeline.yml` (In Org Repositories)
```yaml
name: Organization MLOps & Governance Pipeline

on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches: [main, staging]
  workflow_dispatch:

jobs:
  # 1. Pull Request Gatekeeper Quality Gate
  gatekeeper:
    if: github.event_name == 'pull_request'
    uses: skunchoor/traffic-light-governance/.github/workflows/reusable-gatekeeper.yml@main
    with:
      python_version: '3.11'
      test_command: 'PYTHONPATH=. uv run pytest tests/ --junitxml=test-results.xml || true'
      run_security_scans: true
    secrets: inherit

  # 2. Unified CI/CD Deployment & MLflow Promotion Pipeline
  deploy:
    if: github.event_name == 'push' || github.event_name == 'workflow_dispatch'
    uses: skunchoor/traffic-light-governance/.github/workflows/reusable-ci-cd-pipeline.yml@main
    with:
      workflow_name: 'Org Target Repo Pipeline'
      service_name: 'Target Microservice API'
      model_name: 'FraudDetection-XGBoost'
      environment: ${{ github.ref_name == 'main' && 'production' || 'staging' }}
      run_databricks_deploy: true
      run_azure_deploy: true
    secrets: inherit
```

---

## 3. Usage Outside the Organization / Personal Repositories

For external or personal repositories outside of `skunchoor` (or when strict secret segregation is enforced), you must:
1. Configure repository or environment secrets (`BACKEND_API_URL`, `BACKEND_API_KEY`, and optional cloud credentials) in your repository settings under **Settings → Secrets and variables → Actions**.
2. Reference the reusable workflows using `@main` or a pinned release tag/commit SHA for strict supply chain security (`@v1.0.0` or `@a1b2c3d4...`).
3. Either use `secrets: inherit` (if secrets exist in the external repository) or explicitly pass each secret map.

### `.github/workflows/external-caller.yml` (External / Personal Repos)
```yaml
name: External Repository Governance Caller

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  # 1. PR Governance Check
  gatekeeper-external:
    if: github.event_name == 'pull_request'
    uses: skunchoor/traffic-light-governance/.github/workflows/reusable-gatekeeper.yml@main
    with:
      python_version: '3.11'
      test_command: 'pytest --junitxml=test-results.xml || true'
      run_security_scans: true
    secrets:
      BACKEND_API_URL: ${{ secrets.BACKEND_API_URL }}
      BACKEND_API_KEY: ${{ secrets.BACKEND_API_KEY }}

  # 2. CI/CD Deployment Pipeline
  deploy-external:
    if: github.event_name == 'push'
    uses: skunchoor/traffic-light-governance/.github/workflows/reusable-ci-cd-pipeline.yml@main
    with:
      workflow_name: 'Personal Repo Pipeline'
      service_name: 'External App Container'
      environment: 'production'
      run_azure_deploy: true
      run_databricks_deploy: false
    secrets:
      BACKEND_API_URL: ${{ secrets.BACKEND_API_URL }}
      BACKEND_API_KEY: ${{ secrets.BACKEND_API_KEY }}
      AZURE_CREDENTIALS: ${{ secrets.AZURE_CREDENTIALS }}
```

---

## 4. Inputs & Secrets Reference

### `reusable-gatekeeper.yml` Inputs
| Input Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `python_version` | `string` | `'3.11'` | Target Python environment version. |
| `test_command` | `string` | `'PYTHONPATH=. uv run pytest tests/ --junitxml=test-results.xml \|\| true'` | Shell command to execute automated tests. |
| `extra_dependencies` | `string` | `''` | Extra apt/pip dependencies needed before running tests. |
| `run_security_scans` | `boolean` | `true` | Whether to run the 7-tool SAST/SCA security matrix. |
| `project_override` | `string` | `''` | Optional override for repository name in dashboard telemetry. |

### `reusable-ci-cd-pipeline.yml` Inputs
| Input Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `workflow_name` | `string` | `'Organization MLOps & DevOps Pipeline'` | Friendly name displayed in the telemetry dashboard. |
| `service_name` | `string` | `'Traffic Light Governance Service'` | Name of API/microservice being built or deployed. |
| `model_name` | `string` | `'FraudDetection-XGBoost'` | MLflow registered model name for stage promotion. |
| `model_version` | `string` | `'v3.5.0'` | Model version string to promote. |
| `environment` | `string` | `'staging'` | Target deployment environment (`staging` or `production`). |
| `run_databricks_deploy` | `boolean` | `true` | Executes composite action deploying notebooks, jobs, and promoting models. |
| `run_azure_deploy` | `boolean` | `true` | Executes composite action building multi-stage Docker image and deploying to Azure Container Apps. |

### Required & Optional Secrets
- **`BACKEND_API_URL`**: (Optional / Recommended) Dashboard telemetry ingress API endpoint.
- **`BACKEND_API_KEY`**: (Optional / Recommended) Authentication key (`X-API-Key`) for reporting telemetry.
- **`AZURE_CREDENTIALS`**: Required only if `run_azure_deploy: true` and deploying to Azure Container Apps.
- **`AZURE_CONTAINER_APP_NAME`**, **`AZURE_RESOURCE_GROUP`**, **`AZURE_REGISTRY_SERVER`**: Azure target parameters.
- **`DATABRICKS_HOST`**, **`DATABRICKS_TOKEN`**: Required only if `run_databricks_deploy: true`.

---

## 5. Composite Actions Integration

In addition to full reusable workflows, repositories can also invoke our modular **Composite Custom Actions** directly within any custom workflow step:

```yaml
- name: Execute Databricks Deployment
  uses: skunchoor/traffic-light-governance/actions/databricks-deploy@main
  with:
    databricks_host: ${{ secrets.DATABRICKS_HOST }}
    databricks_token: ${{ secrets.DATABRICKS_TOKEN }}
    model_name: 'FraudDetection-XGBoost'
    model_version: 'v3.5.0'
    target_stage: 'Staging'
    deploy_notebook: 'true'
    deploy_jobs: 'true'
```
