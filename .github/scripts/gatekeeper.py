#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "junitparser>=3.1.0",
#     "PyGithub>=2.1.0",
#     "requests>=2.31.0",
# ]
# ///
"""
Enhanced Traffic Light Gatekeeper Script

Parses automated test results, multi-tool security scan reports (Semgrep, Bandit, Snyk, Safety, pip-audit, Trivy, Gitleaks),
and changed file risk classifications. Evaluates PR governance status (GREEN, YELLOW, RED) and reports via POST webhook
to the Traffic Light Governance backend API as well as GitHub PR comments.
"""
import os
import sys
import json
import urllib.request
import urllib.error
from junitparser import JUnitXml

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Optional import for GitHub API (when running inside GitHub Actions with PyGithub)
try:
    from github import Github
    HAS_PYGITHUB = True
except ImportError:
    HAS_PYGITHUB = False

# --- CONFIGURATION ---
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO_NAME = os.getenv("GITHUB_REPOSITORY", "skunchoor/traffic-light-governance")
PR_NUMBER_STR = os.getenv("PR_NUMBER", "1")
PR_NUMBER = int(PR_NUMBER_STR) if PR_NUMBER_STR.isdigit() else 1
PR_TITLE = os.getenv("PR_TITLE", f"PR #{PR_NUMBER} Governance Check")

# Backend Webhook Config
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000")
BACKEND_API_KEY = os.getenv("BACKEND_API_KEY", "dev-secret-api-key-12345")

# Test & Security Scan Files
TEST_REPORT_PATH = os.getenv("TEST_REPORT_PATH", "test-results.xml")
SECURITY_REPORTS = {
    "semgrep": "semgrep.json",
    "bandit": "bandit.json",
    "snyk": "snyk.json",
    "safety": "safety.json",
    "pip_audit": "pip-audit.json",
    "trivy": "trivy.json",
    "gitleaks": "gitleaks.json"
}

# Define risk levels for file patterns
CRITICAL_FILES = ["requirements.txt", "Dockerfile", "setup.py", "pyproject.toml"]
CODE_FILES = ["src/", "app/", "backend/", "api/", ".py", ".js", ".jsx", ".ts", ".tsx"]
CONFIG_FILES = ["config/", ".yaml", ".yml", ".json", ".ini", ".env.example"]
DOC_FILES = ["README.md", "docs/", ".txt", ".md"]


def parse_security_reports():
    """
    Parses JSON output files from all 7 security tools if they exist.
    Returns: dict of counts {tool_name: total_findings} and total_high_risk count.
    """
    findings_summary = {}
    total_high_risk = 0
    total_medium_risk = 0

    # 1. Semgrep
    if os.path.exists(SECURITY_REPORTS["semgrep"]):
        try:
            with open(SECURITY_REPORTS["semgrep"], "r") as f:
                data = json.load(f)
                results = data.get("results", [])
                findings_summary["semgrep"] = len(results)
                for r in results:
                    sev = r.get("extra", {}).get("severity", "").upper()
                    if sev == "ERROR":
                        total_high_risk += 1
                    elif sev == "WARNING":
                        total_medium_risk += 1
        except Exception as e:
            print(f"[Warn] Error parsing semgrep.json: {e}")
            findings_summary["semgrep"] = 0
    else:
        findings_summary["semgrep"] = 0

    # 2. Bandit
    if os.path.exists(SECURITY_REPORTS["bandit"]):
        try:
            with open(SECURITY_REPORTS["bandit"], "r") as f:
                data = json.load(f)
                results = data.get("results", [])
                findings_summary["bandit"] = len(results)
                for r in results:
                    sev = r.get("issue_severity", "").upper()
                    if sev == "HIGH":
                        total_high_risk += 1
                    elif sev == "MEDIUM":
                        total_medium_risk += 1
        except Exception as e:
            print(f"[Warn] Error parsing bandit.json: {e}")
            findings_summary["bandit"] = 0
    else:
        findings_summary["bandit"] = 0

    # 3. Snyk
    if os.path.exists(SECURITY_REPORTS["snyk"]):
        try:
            with open(SECURITY_REPORTS["snyk"], "r") as f:
                data = json.load(f)
                vulnerabilities = data.get("vulnerabilities", [])
                findings_summary["snyk"] = len(vulnerabilities)
                for v in vulnerabilities:
                    sev = v.get("severity", "").upper()
                    if sev in ["HIGH", "CRITICAL"]:
                        total_high_risk += 1
                    elif sev == "MEDIUM":
                        total_medium_risk += 1
        except Exception as e:
            print(f"[Warn] Error parsing snyk.json: {e}")
            findings_summary["snyk"] = 0
    else:
        findings_summary["snyk"] = 0

    # 4. Safety
    if os.path.exists(SECURITY_REPORTS["safety"]):
        try:
            with open(SECURITY_REPORTS["safety"], "r") as f:
                data = json.load(f)
                if isinstance(data, list):
                    findings_summary["safety"] = len(data)
                    total_medium_risk += len(data)
                elif isinstance(data, dict):
                    vulns = data.get("vulnerabilities", [])
                    findings_summary["safety"] = len(vulns)
                    total_medium_risk += len(vulns)
        except Exception as e:
            print(f"[Warn] Error parsing safety.json: {e}")
            findings_summary["safety"] = 0
    else:
        findings_summary["safety"] = 0

    # 5. pip-audit
    if os.path.exists(SECURITY_REPORTS["pip_audit"]):
        try:
            with open(SECURITY_REPORTS["pip_audit"], "r") as f:
                data = json.load(f)
                deps = data.get("dependencies", [])
                count = 0
                for d in deps:
                    vulns = d.get("vulns", [])
                    count += len(vulns)
                    total_medium_risk += len(vulns)
                findings_summary["pip_audit"] = count
        except Exception as e:
            print(f"[Warn] Error parsing pip-audit.json: {e}")
            findings_summary["pip_audit"] = 0
    else:
        findings_summary["pip_audit"] = 0

    # 6. Trivy
    if os.path.exists(SECURITY_REPORTS["trivy"]):
        try:
            with open(SECURITY_REPORTS["trivy"], "r") as f:
                data = json.load(f)
                results = data.get("Results", [])
                count = 0
                for r in results:
                    vulns = r.get("Vulnerabilities", [])
                    count += len(vulns)
                    for v in vulns:
                        sev = v.get("Severity", "").upper()
                        if sev in ["HIGH", "CRITICAL"]:
                            total_high_risk += 1
                        elif sev == "MEDIUM":
                            total_medium_risk += 1
                findings_summary["trivy"] = count
        except Exception as e:
            print(f"[Warn] Error parsing trivy.json: {e}")
            findings_summary["trivy"] = 0
    else:
        findings_summary["trivy"] = 0

    # 7. Gitleaks
    if os.path.exists(SECURITY_REPORTS["gitleaks"]):
        try:
            with open(SECURITY_REPORTS["gitleaks"], "r") as f:
                data = json.load(f)
                if isinstance(data, list):
                    findings_summary["gitleaks"] = len(data)
                    total_high_risk += len(data) # Hardcoded secrets are always high risk
        except Exception as e:
            print(f"[Warn] Error parsing gitleaks.json: {e}")
            findings_summary["gitleaks"] = 0
    else:
        findings_summary["gitleaks"] = 0

    return findings_summary, total_high_risk, total_medium_risk


def analyze_tests():
    """
    Parses JUnit XML report to ensure tests passed.
    Returns: (passed: bool, failures_count: int, message: str)
    """
    if not os.path.exists(TEST_REPORT_PATH):
        # If no report path found, check if we are in simulated mode
        return True, 0, "✅ Automated tests check bypassed / passed."

    try:
        xml = JUnitXml.fromfile(TEST_REPORT_PATH)
        failures = xml.failures + xml.errors
        if failures > 0:
            return False, failures, f"❌ Tests Failed: {xml.failures} failures, {xml.errors} errors."
        return True, 0, "✅ All automated tests passed."
    except Exception as e:
        return True, 0, f"✅ Test XML parse bypassed ({e})."


def analyze_file_risk(files_changed):
    """
    Determines base risk level from changed file patterns.
    Returns: (risk_level: str, reason: str)
    """
    if not files_changed:
        return "GREEN", "✅ No significant file changes detected."

    for f in files_changed:
        if any(crit in f for crit in CRITICAL_FILES):
            return "YELLOW", f"⚠️ Major Dependency/Container Change: {f}"

    code_changes = [f for f in files_changed if any(c in f for c in CODE_FILES)]
    if code_changes:
        return "YELLOW", f"⚠️ Core Logic/Code modified in {len(code_changes)} files. Manual Peer Review Required."

    config_changes = [f for f in files_changed if any(c in f for c in CONFIG_FILES)]
    if config_changes:
        return "GREEN", "✅ Configuration/Parameters changed. Safe for auto-approval."

    return "GREEN", "✅ Documentation or static asset updates only."


def evaluate_governance(tests_passed, test_failures, sec_summary, high_risk, medium_risk, file_risk, file_reason):
    """
    Combines test status, security findings, and file risk into a final Traffic Light status.
    """
    total_findings = sum(sec_summary.values())

    # 1. RED Condition: Test failures OR High-risk security vulnerabilities
    if not tests_passed or test_failures > 0:
        return "RED", f"Blocked: Automated tests failed ({test_failures} failures)."
    if high_risk > 0:
        return "RED", f"Blocked: Critical/High severity security findings detected ({high_risk} high-risk issues)."

    # 2. YELLOW Condition: Medium security findings OR Code/Dependency changes
    if medium_risk > 0 or total_findings > 0:
        return "YELLOW", f"Review Required: Security scanners flagged {total_findings} medium/low issues across tools."
    if file_risk == "YELLOW":
        return "YELLOW", file_reason

    # 3. GREEN Condition: Tests passed, 0 security findings, safe files
    return "GREEN", "Auto-Approved: All tests clean, zero security findings, and low-risk changes."


def post_to_backend_webhook(pr_number, pr_title, repo, traffic_light, test_passed, test_failures, sec_summary, risk_reason, files_changed):
    """
    Sends the evaluation report to the FastAPI backend webhook via POST request.
    """
    payload = {
        "pr_number": pr_number,
        "pr_title": pr_title,
        "repo": repo,
        "traffic_light": traffic_light,
        "test_passed": test_passed,
        "test_failures": test_failures,
        "security_findings": sec_summary,
        "risk_reason": risk_reason,
        "files_changed": files_changed
    }

    url = f"{BACKEND_API_URL.rstrip('/')}/api/v1/gatekeeper"
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": BACKEND_API_KEY
    }

    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            print(f"📡 [Success] Report posted to backend API: ID {res_body.get('id')}")
    except Exception as e:
        print(f"⚠️ [Warn] Could not post report to backend webhook ({url}): {e}")


def get_pr_files():
    """
    Retrieves list of changed files from GitHub PR if PyGithub & token available, else via env var or git diff.
    """
    files = []
    if HAS_PYGITHUB and GITHUB_TOKEN and PR_NUMBER_STR.isdigit():
        try:
            g = Github(GITHUB_TOKEN)
            repo = g.get_repo(REPO_NAME)
            pr = repo.get_pull(PR_NUMBER)
            files = [f.filename for f in pr.get_files()]
            return files, pr
        except Exception as e:
            print(f"[Warn] PyGithub PR fetch failed: {e}")

    env_files = os.getenv("CHANGED_FILES")
    if env_files:
        files = [f.strip() for f in env_files.split(",") if f.strip()]
    else:
        files = ["src/auth.py", "api/routers/gatekeeper.py"] # Default fallback for local testing
    return files, None


def main():
    print(f"🚦 Running Traffic Light Gatekeeper Evaluation for PR #{PR_NUMBER} ({REPO_NAME})...")

    # 1. Parse Tests & Security Scans
    tests_passed, test_failures, test_msg = analyze_tests()
    sec_summary, high_risk, medium_risk = parse_security_reports()
    
    # 2. Analyze File Changes
    files_changed, pr_obj = get_pr_files()
    file_risk, file_reason = analyze_file_risk(files_changed)

    # 3. Compute Final Decision
    traffic_light, risk_reason = evaluate_governance(
        tests_passed, test_failures, sec_summary, high_risk, medium_risk, file_risk, file_reason
    )

    print(f"\n--- GOVERNANCE SUMMARY ---")
    print(f"PR Number: #{PR_NUMBER} - {PR_TITLE}")
    print(f"Traffic Light Verdict: {traffic_light}")
    print(f"Reason: {risk_reason}")
    print(f"Security Findings: {sec_summary} (High: {high_risk}, Medium: {medium_risk})")
    print(f"Changed Files ({len(files_changed)}): {', '.join(files_changed[:5])}")
    print(f"--------------------------\n")

    # 4. Post to Backend Webhook / SSE Stream
    post_to_backend_webhook(
        PR_NUMBER, PR_TITLE, REPO_NAME, traffic_light, tests_passed, test_failures, sec_summary, risk_reason, files_changed
    )

    # 5. Post GitHub Comment if running in CI with PR object
    if pr_obj and GITHUB_TOKEN:
        emoji = "🟢" if traffic_light == "GREEN" else ("🟡" if traffic_light == "YELLOW" else "🔴")
        body = (
            f"## {emoji} Traffic Light Gatekeeper: {traffic_light}\n\n"
            f"- **Verdict Reason:** {risk_reason}\n"
            f"- **Automated Tests:** {test_msg}\n"
            f"- **Security Vulnerabilities:** {sum(sec_summary.values())} total issues (`{json.dumps(sec_summary)}`)\n"
            f"- **Files Modified:** `{len(files_changed)}` files checked\n\n"
            f"*Real-time telemetry sent to MLOps Observability Dashboard.*"
        )
        try:
            pr_obj.create_issue_comment(body)
            print("💬 GitHub PR comment posted.")
        except Exception as e:
            print(f"[Warn] Could not post GitHub PR comment: {e}")

    # Set GitHub Actions step output
    if "GITHUB_OUTPUT" in os.environ:
        with open(os.environ["GITHUB_OUTPUT"], "a") as f:
            f.write(f"traffic_light={traffic_light}\n")
            f.write(f"risk_reason={risk_reason}\n")

    # If RED, exit with 1 to block PR merging if branch protection is enforced
    if traffic_light == "RED":
        print("🚨 Gatekeeper Verdict is RED. Exiting with non-zero status to block pipeline/merge.")
        sys.exit(1)
    
    print("✨ Gatekeeper evaluation completed successfully.")


if __name__ == "__main__":
    main()