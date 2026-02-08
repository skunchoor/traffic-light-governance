import os
import sys
from github import Github
from junitparser import JUnitXml

# --- CONFIGURATION ---
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO_NAME = os.getenv("GITHUB_REPOSITORY")
PR_NUMBER = int(os.getenv("PR_NUMBER"))
TEST_REPORT_PATH = "test-results.xml"

# Define risk levels for file patterns
CRITICAL_FILES = ["requirements.txt", "Dockerfile", "setup.py"] # Major Dependency Changes
CODE_FILES = ["src/", "app/", ".py"]                            # Logic Changes
CONFIG_FILES = ["config/", ".yaml", ".json", ".ini"]            # Minor Config Changes
DOC_FILES = ["README.md", "docs/", ".txt"]                      # Template/Doc Changes

def get_pr_files(pr):
    return [f.filename for f in pr.get_files()]

def analyze_risk(files_changed):
    """
    Determines risk level based on file types.
    Returns: (Risk Level, Reason)
    """
    # 1. Check for Critical Dependency Changes (Highest Risk)
    for f in files_changed:
        if any(crit in f for crit in CRITICAL_FILES):
            return "RED", f"🚨 Major Package/Dependency Upgrade detected in: {f}"

    # 2. Check for Core Logic Changes (Medium Risk - Requirements Review)
    # If you want logic changes to be RED, keep this. If specific logic is safe, move to Green.
    code_changes = [f for f in files_changed if any(c in f for c in CODE_FILES)]
    if code_changes:
        return "RED", f"⚠️ Core Logic Modified in {len(code_changes)} files. Manual Code Review Required."

    # 3. Check for Config Changes (Low Risk - Auto Merge?)
    config_changes = [f for f in files_changed if any(c in f for c in CONFIG_FILES)]
    if config_changes:
        return "GREEN", "✅ Only Configuration parameters changed. Safe for auto-deployment."

    # 4. Check for Docs (No Risk)
    return "GREEN", "✅ Documentation/Template updates only."

def analyze_tests():
    """
    Parses JUnit XML report to ensure tests passed.
    """
    if not os.path.exists(TEST_REPORT_PATH):
        return False, "❌ Test report not found!"
    
    xml = JUnitXml.fromfile(TEST_REPORT_PATH)
    if xml.errors or xml.failures:
        return False, f"❌ Tests Failed: {xml.failures} failures, {xml.errors} errors."
    
    return True, "✅ All automated tests passed."

def main():
    g = Github(GITHUB_TOKEN)
    repo = g.get_repo(REPO_NAME)
    pr = repo.get_pull(PR_NUMBER)

    print(f"🔍 Analyzing PR #{PR_NUMBER} in {REPO_NAME}...")

    # 1. Analyze Test Results
    tests_passed, test_msg = analyze_tests()
    if not tests_passed:
        # If tests fail, it's automatic RED regardless of file changes
        post_comment(pr, "RED", test_msg)
        sys.exit(1) # Fail the pipeline

    # 2. Analyze File Changes
    files_changed = get_pr_files(pr)
    risk_color, risk_msg = analyze_risk(files_changed)

    # 3. Final Decision
    final_msg = f"**Traffic Light Report** 🚦\n\n- **Test Status:** {test_msg}\n- **Code Analysis:** {risk_msg}\n\n**Verdict:** `{risk_color}`"
    
    print(final_msg)
    post_comment(pr, risk_color, final_msg)

    # 4. Set Label (Optional)
    # pr.add_to_labels(f"traffic-light:{risk_color.lower()}")

def post_comment(pr, status, body):
    # Determine emoji
    emoji = "🟢" if status == "GREEN" else "🔴"
    
    # Post comment to PR
    pr.create_issue_comment(f"## {emoji} Traffic Light Bot: {status}\n{body}")
    
    # If RED, fail the action so it can't be merged (if branch protection is on)
    if status == "RED":
        sys.exit(1)

if __name__ == "__main__":
    main()