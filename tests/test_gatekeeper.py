import pytest
from httpx import AsyncClient
from api.config import settings


@pytest.mark.asyncio
async def test_gatekeeper_crud(client: AsyncClient):
    valid_key = settings.api_keys_list[0]
    payload = {
        "pr_number": 99,
        "pr_title": "Fix security vulnerability in auth module",
        "repo": "skunchoor/traffic-light-governance",
        "traffic_light": "YELLOW",
        "test_passed": True,
        "test_failures": 0,
        "security_findings": {"semgrep": 1, "bandit": 0},
        "risk_reason": "Core python logic modified in src/auth.py",
        "files_changed": ["src/auth.py", "tests/test_auth.py"]
    }
    
    # Create
    res = await client.post("/api/v1/gatekeeper", headers={"X-API-Key": valid_key}, json=payload)
    assert res.status_code == 200
    created = res.json()
    assert created["pr_number"] == 99
    assert created["traffic_light"] == "YELLOW"
    
    # List
    list_res = await client.get("/api/v1/gatekeeper?traffic_light=YELLOW")
    assert list_res.status_code == 200
    reports = list_res.json()
    assert any(r["id"] == created["id"] for r in reports)
    
    # Get by ID
    get_res = await client.get(f"/api/v1/gatekeeper/{created['id']}")
    assert get_res.status_code == 200
    assert get_res.json()["risk_reason"] == payload["risk_reason"]
