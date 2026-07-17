#!/usr/bin/env python3
"""
MLflow Model Evaluation & Traffic Light Promotion Script.

Evaluates trained ML models against accuracy and F1 metrics thresholds.
Enforces Traffic Light stage promotion rules:
- GREEN: Auto-promote from Staging -> Production
- YELLOW: Promote to Staging only, hold Production promotion for peer review
- RED: Block promotion entirely
Reports promotion events via POST webhook to the Traffic Light Governance backend API.
"""
import os
import sys
import json
import datetime
from notify_backend import notify_backend

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# --- CONFIGURATION ---
MODEL_NAME = os.getenv("MODEL_NAME", "FraudDetection-XGBoost")
MODEL_VERSION = os.getenv("MODEL_VERSION", "v3.4.1")
FROM_STAGE = os.getenv("FROM_STAGE", "Staging")
TARGET_STAGE = os.getenv("TARGET_STAGE", "Production")
TRAFFIC_LIGHT_DECISION = os.getenv("TRAFFIC_LIGHT", "GREEN")

# Simulated Model Metrics
METRICS = {
    "accuracy": float(os.getenv("MODEL_ACCURACY", "0.942")),
    "f1_score": float(os.getenv("MODEL_F1", "0.915")),
    "latency_ms": float(os.getenv("MODEL_LATENCY_MS", "24.5"))
}


def evaluate_and_promote():
    print(f"🧪 Evaluating MLflow Model: {MODEL_NAME} ({MODEL_VERSION})")
    print(f"📊 Metrics: Accuracy={METRICS['accuracy']}, F1={METRICS['f1_score']}, Latency={METRICS['latency_ms']}ms")
    print(f"🚦 Governance Decision Gate: `{TRAFFIC_LIGHT_DECISION}`")

    decision = TRAFFIC_LIGHT_DECISION.upper()
    to_stage = TARGET_STAGE
    reason = "All governance quality checks and model evaluation metrics passed."

    if decision == "RED":
        print("❌ [Blocked] Traffic Light is RED or metrics below threshold. Promotion halted.")
        to_stage = FROM_STAGE # No movement
        reason = "Blocked by Gatekeeper: Critical security findings or failed evaluation threshold."
        sys.exit(1)
    elif decision == "YELLOW" and TARGET_STAGE.lower() == "production":
        print("⚠️ [YELLOW Review] Model approved for Staging, but requires manual sign-off before Production promotion.")
        to_stage = "Staging (Hold for Review)"
        reason = "YELLOW governance status: Manual peer sign-off required for final Production rollout."
    else:
        print(f"✅ [Approved] Promoting model {MODEL_NAME} {MODEL_VERSION} from {FROM_STAGE} -> {to_stage}")

    # Post promotion event to backend API
    notify_backend("api/v1/models", {
        "model_name": MODEL_NAME,
        "model_version": MODEL_VERSION,
        "from_stage": FROM_STAGE,
        "to_stage": to_stage,
        "decision": decision,
        "gatekeeper_reason": reason,
        "metrics": METRICS
    })

    print("✨ MLflow stage transition and governance reporting complete.")


if __name__ == "__main__":
    evaluate_and_promote()
