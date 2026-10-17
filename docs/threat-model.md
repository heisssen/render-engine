# Threat model

Version 0.2 · October 2026 · scope: the render-engine pipeline from research text and archival downloads to a
published video file. Threats are grouped by STRIDE; the ones specific to language models map to the OWASP Top 10 for
LLM Applications (2025, "LLMxx"). Provenance follows the ideas of C2PA 2.x.

A documentary pipeline does not hold bank details, but it does publish things under someone's name, and it eats
files and text from strangers all day. That is enough to need a threat model.

## 1. Assets

| id | asset | why it matters |
|---|---|---|
| A1 | factual integrity of the film | a history film with a fabricated quote or a miscaptioned photo is misinformation with a nice score |
| A2 | rights and provenance of every frame and sound | one wrongly licensed clip means takedowns and claims; lost attribution breaks CC licences |
| A3 | API keys (text-to-speech, LLM providers) | spend, abuse, and speech generated in your narrator's voice |
| A4 | the narrator's voice (a clone of a real person, or a licensed voice) | impersonation |
| A5 | publishing accounts and their tokens | takeover means uploads under your name |
| A6 | the build itself: code, dependencies, agent instructions | agents and scripts run shell commands in this repo |
| A7 | personal data of the people who make the film | nothing personal belongs in prompts, ledgers, commits or public docs |

## 2. Data flow and trust boundaries

```
open web: archive pages, encyclopedias, catalogue records          TB1  untrusted text
      |                                   |
      v                                   v
research / writing (people, LLM tools) -> script.md, notes            TB2  model output is untrusted
      |
archive downloads -> footage folder (untrusted binaries)             TB3  untrusted media
      |
cutting -> public/clips, photos, page scans (+ lineage sidecars)      lineage must survive this step
      |
voice (TTS API, key + voice ID) ----------------------------------->  TB4  third-party APIs
      |
timings.mjs -> Remotion (headless Chrome) + mix.py -> parts, mix.wav
      |
tools/provenance.py: ledger + licence gate -> mux -> film.mp4        no licence, no render
      |
upload / publication                                                  TB5  publication
agents with a shell in the repo; skills, prompts and configs as files TB6  instructions arriving as data
```

## 3. Threats and mitigations

Risk = likelihood x impact, each 1 to 3.

| id | threat | where | risk | mitigations in this repo | next |
|---|---|---|---|---|---|
| T1 | **Prompt injection in research text**: a page tells a writing agent to insert a claim, or tells a shell-capable agent to run a command (Tampering, Elevation / LLM01) | TB1, TB6 | 6 | research text is treated as data; translation runs the CLI with no tools, no MCP, no project files (`translate_subs.py`, empty sandbox cwd) | a planted-page test suite for every LLM step |
| T2 | **Fabricated facts or quotes** reach the script (LLM09) | TB2 | 6 | quoted pages are shown from real scans, each quote checked word for word and boxed in pixels (`quotes.json`); the build refuses unknown page ids | every claim in the script carries a source id the ledger can resolve |
| T3 | **Poisoned archive files**: a crafted video or image exploits ffmpeg or Chrome decoders (Tampering, Elevation) | TB3 | 4 | downloads live in their own folder and are re-encoded before use (`reencode_clips.py`); the render reads only the re-encoded copies | probe and transcode as a low-privilege user; keep ffmpeg updated |
| T4 | **Licence laundering**: a CC BY-SA photo passed off as public domain, a stock-agency copy relabelled as "archival", NC or ND material slipped in (Spoofing of rights) | TB3 | 6 | `tools/provenance.py` allow/deny gate: PD, PDM, CC0 pass; CC BY and BY-SA pass with an attribution line; NC, ND, rights-managed archives and unknown licences are blocked; a licence that exists only as an on-screen credit is flagged (blocked with `--strict`) | lineage sidecars written by the cutter, so the licence travels with the file |
| T5 | **Lost lineage**: a cut clip can no longer be traced to its source file and timecode (Repudiation) | cutting | 6 | the ledger reads `<file>.source.json` sidecars and reports every asset without a source page | sidecars required for every cut (roadmap) |
| T6 | **Secret leaks**: keys in commits, logs, prompts, error messages or screenshots (Information disclosure / LLM02) | all | 6 | `.env` and `secrets/` gitignored, `.env.example` only; voice IDs from the environment; gitleaks in CI over the full history | pre-commit gitleaks; scrub logs |
| T7 | **Voice misuse**: the key and voice ID generate speech in a real person's voice (Spoofing) | TB4 | 4 | the narrator voice ID never appears in code or data; the ledger marks narration `synthetic: true` | periodic usage audit against the ledger's voice records |
| T8 | **Supply chain**: npm or pip dependencies, third-party agent skills (a skill is a prompt) (Tampering / LLM03) | TB6 | 4 | `package-lock.json` committed; CodeQL on Python and JavaScript in CI | SBOM per release; Dependabot |
| T9 | **Undisclosed synthetic content**: AI narration not declared at upload (policy) | TB5 | 4 | the ledger and `credits.txt` state the narration is synthetic | read it in the upload checklist |
| T10 | **Output tampering**: nobody can check that a published file matches its ledger | publication | 4 | `ledger_root`: one SHA-256 over all records, which changes when any asset or record changes | C2PA Content Credentials with `ledger_root` embedded (roadmap) |
| T11 | **Preference models used as evidence**: an audience-panel ranking treated as a fact or a rights decision | research | 2 | rule: panels rank options for viewers, they never decide facts or rights | |
| T12 | **Personal data in public files**: names, paths, hosts or account details in docs, commits or prompts | all | 6 | privacy scan before every release (patterns in `CONTRIBUTING.md`); machine paths replaced by env vars | add the scan to CI |

## 4. Measures

- provenance coverage = assets with a source record / all assets (target: 100% before publication)
- licence violations at publication = 0 (the gate makes this a build failure)
- secrets found in history = 0 (gitleaks)
- time from a rights claim to the source record of the shot: minutes, by searching `ledger.jsonl`
