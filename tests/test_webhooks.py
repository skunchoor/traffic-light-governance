import pytest
from httpx import AsyncClient
from api.config import settings


@pytest.mark.asyncio
async def test_webhook_ingest_pipeline(client: AsyncClient):
    valid_key = settings.api_keys_list[0]
    payload = {
        "event_type": "pipeline",
        "data": {
            "workflow_name": "Traffic Light Gatekeeper",
            "run_id": "test_run_001",
            "run_number": 1,
            "status": "success",
            "trigger": "push",
            "branch": "main",
            "commit_sha": "abc1234",
            "actor": "sunil",
            "duration_seconds": 120.5
        }
    }
    res = await client.post("/api/v1/webhooks/github", headers={"X-API-Key": valid_key}, json=payload)
    assert res.status_code == 202
    data = res.json()
    assert data["status"] == "accepted"
    assert data["event_type"] == "pipeline"
    assert data["saved_id"] is not None

    # Verify via GET
    get_res = await client.get("/api/v1/pipelines")
    assert get_res.status_code == 200
    pipelines = get_res.json()
    assert len(pipelines) >= 1
    assert pipelines[0]["run_id"] == "test_run_001"
