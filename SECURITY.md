# Security policy

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting: open the **Security** tab of this repository and choose
**Report a vulnerability**. That reaches the maintainer privately; please do not open a public issue for it.

Useful things to include: what is affected (a script, the provenance gate, a dependency), how to reproduce it, and
what an attacker could do with it. You will get an answer within a week. This is a one-person project, so "fixed"
may take longer than "answered", but you will know where it stands.

## What counts

- anything that makes the licence gate (`tools/provenance.py`) pass a file it should block, or change a record
  without changing `ledger_root`;
- secrets or personal data in the repository or its history;
- a crafted input file (JSON, script, media) that makes a script run commands or write outside the project;
- vulnerable dependencies with a real path to exploitation here.

## Supported versions

Only the latest release gets fixes.

The threat model is in [docs/threat-model.md](docs/threat-model.md).
