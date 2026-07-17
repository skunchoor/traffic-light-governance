import pytest
from httpx import AsyncClient
from api.config import settings


@pytest.mark.asyncio
async def test_public_health_endpoint(client: AsyncClient):
    res = await client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "version" in data


@pytest.mark.asyncio
async def test_public_summary_endpoint(client: AsyncClient):
    res = await client.get("/api/v1/metrics/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_pipeline_runs" in data
    assert "dora_metrics" in data


@pytest.mark.asyncio
async def test_write_endpoint_requires_api_key(client: AsyncClient):
    # Without X-API-Key
    res = await client.post("/api/v1/gatekeeper", json={
        "pr_number": 1,
        "repo": "skunchoor/test",
        "traffic_light": "GREEN"
    })
    assert res.status_code == 401
    assert res.json()["detail"] == "Missing X-API-Key header"

    # With invalid X-API-Key
    res = await client.post("/api/v1/gatekeeper", headers={"X-API-Key": "wrong_key"}, json={
        "pr_number": 1,
        "repo": "skunchoor/test",
        "traffic_light": "GREEN"
    })
    assert res.status_code == 403
    assert res.json()["detail"] == "Invalid API key"

    # With valid key
    valid_key = settings.api_keys_list[0]
    res = await client.post("/api/v1/gatekeeper", headers={"X-API-Key": valid_key}, json={
        "pr_number": 1,
        "repo": "skunchoor/test",
        "traffic_light": "GREEN"
    })
    assert res.status_code == 200
    assert res.json()["traffic_light"] == "GREEN"
