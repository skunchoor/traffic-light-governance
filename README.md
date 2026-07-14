# 🚦 Traffic Light Governance: Automated MLOps Gatekeeper

![Python](https://img.shields.io/badge/Python-3.9-blue) ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-green) ![Security](https://img.shields.io/badge/Security-Snyk-purple)

## 📌 The Problem
In enterprise MLOps, reviewing every Pull Request manually is a bottleneck. However, auto-merging is risky. 
We need a system that differentiates between a **safe configuration tweak** and a **risky infrastructure change**.

## 💡 The Solution
A **"Traffic Light" Bot** that analyzes every PR and assigns a risk level based on three pillars:
1.  **Code Analysis:** Which files were touched? (Config vs. Core Logic vs. Infrastructure)
2.  **Test Integrity:** Did unit tests and integration tests pass?
3.  **Security Posture:** Are there any new high-severity vulnerabilities?

## 🚦 The Traffic Light Matrix

| Status | Color | Condition | Action |
| :--- | :--- | :--- | :--- |
| **Auto-Approve** | 🟢 **GREEN** | Config changes only + Tests Pass + Secure | Ready for Auto-Merge |
| **Warning** | 🟡 **YELLOW** | Logic (`.py`) changes + Tests Pass | Manual Peer Review Required |
| **Blocked** | 🔴 **RED** | Infra (`Dockerfile`) changes OR Tests Fail OR Security Issues | **Merge Blocked** |

## 🏗️ The Matrix

| Criteria | Green Light 🟢 (Auto-Merge) | Yellow Light 🟡 (Manual Review) | Red Light 🔴 (Blocked) |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | 100% Pass | N/A | Any Failure |
| **Security (SAST/SCA)**| 0 High Vulnerabilities | N/A | >0 High Vulnerabilities |
| **File Risk** | Config/Docs only (`.yaml`, `.md`) | Core Logic (`.py`) | Infrastructure (`Dockerfile`, `requirements.txt`) |


## 💡 Architecture
`PR Event` ➡️ `GitHub Actions` ➡️ `Run Tests (PyTest)` ➡️ `Security Scan (Snyk)` ➡️ `Gatekeeper Script (Python)` ➡️ **Comment on PR**

## ⚙️ How it Works
1. **Trigger:** A PR is opened.
2. **CI Pipeline:** Runs `pytest` (Code Quality), `semgrep` (Static Code Analysis), and `snyk` (Dependency Scanning).
3. **The Brain (`scripts/gatekeeper.py`):** Parses the XML/JSON reports and inspects the `git diff`.
4. **Action:** The bot comments on the PR with a detailed report and passes/fails the GitHub Check.
