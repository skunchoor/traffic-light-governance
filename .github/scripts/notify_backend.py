#!/usr/bin/env python3
"""
Shared utility script to post webhook events (pipelines, deployments, models, webhooks)
to the Traffic Light Governance backend API with exponential backoff and retries.
"""
import os
import sys
import json
import time
import urllib.request
import urllib.error

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000")
BACKEND_API_KEY = os.getenv("BACKEND_API_KEY", "dev-secret-api-key-12345")


def notify_backend(endpoint_path, payload, max_retries=3):
    url = f"{BACKEND_API_URL.rstrip('/')}/{endpoint_path.lstrip('/')}"
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": BACKEND_API_KEY
    }
    data = json.dumps(payload).encode("utf-8")

    for attempt in range(1, max_retries + 1):
        try:
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=12) as response:
                res_json = json.loads(response.read().decode("utf-8"))
                print(f"📡 [Success] Webhook sent to {endpoint_path} (Attempt {attempt}): {res_json}")
                return res_json
        except urllib.error.HTTPError as e:
            print(f"⚠️ [HTTP Error {e.code}] on {url}: {e.read().decode('utf-8', errors='ignore')}")
            if e.code in [401, 403, 422]:
                # Non-retryable auth or validation error
                break
        except Exception as e:
            print(f"⚠️ [Attempt {attempt}/{max_retries}] Webhook error ({url}): {e}")
        
        if attempt < max_retries:
            time.sleep(2 ** attempt)

    print(f"❌ Failed to notify backend at {endpoint_path} after {max_retries} attempts.")
    return None


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: notify_backend.py <endpoint_path> <json_payload_string>")
        sys.exit(1)
    
    endpoint = sys.argv[1]
    raw_json = sys.argv[2]
    try:
        payload_data = json.loads(raw_json)
        notify_backend(endpoint, payload_data)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON payload: {e}")
        sys.exit(1)
