# Netlify Boundary Documentation Audit Report

- Audit date: 2026-09-13
- Work Order: `agent-work/work-orders/2026-09-13-netlify-boundary-doc-audit.md`
- Scope: Repository-wide documentation audit after the Netlify Publish Boundary restructure
- Audit type: Investigation only; no fixes applied

## Executive Summary

The repository's current architecture is described consistently in its root documentation, Netlify boundary experiment, knowledge catalog, provider-boundary evidence, and short-term notes: `experiments/` owns Experiment Records / Research Context, while `public/` owns static Browser Artifacts published by Netlify.

The audit found **two documentation findings covering four stale artifact references**. One stale reference is in the Experiment B record, and three are in the Evidence Index. All four still point to the Browser Artifacts' former locations under `experiments/`; the referenced files no longer exist there and now live under `public/`. No broken Markdown relative links were found, no current statement was found that incorrectly describes the repository root as the current Netlify Publish output, and no stale Browser Artifact path was found in the Auth or Data API View Experiment Records.

The old root-publish layout is still described in historical sections of the Netlify boundary evidence. Those statements are correctly time-qualified and should be preserved rather than “corrected” into the current state. The Trigger Boundary remains explicitly open and requires a future decision; this is not a documentation defect.

## Findings

### Finding NBDA-001

- **Severity:** Medium
- **Category:** Stale Browser Artifact path
- **Location:** `experiments/data-api/README.md:6`
- **Current statement or reference:** `- Artifact: experiments/data-api/index.html`
- **Why it may be inconsistent:** The statement is presented as current record metadata, but `experiments/data-api/index.html` no longer exists. The deployment-boundary restructure moved this Browser Artifact to `public/data-api/index.html`, while `experiments/data-api/README.md` remains the Experiment Record.
- **Recommended disposition:** Update the metadata value to `public/data-api/index.html` in a separate fix pass after Primary Agent review.
- **Confidence:** High
- **Decision Needed:** No

### Finding NBDA-002

- **Severity:** Medium
- **Category:** Stale Browser Artifact paths in Evidence Index
- **Location:** `evidence/index.md:145`, `evidence/index.md:203`, `evidence/index.md:251`
- **Current statement or reference:** The Auth, Data API CRUD, and Data API View entries respectively identify `experiments/auth/index.html`, `experiments/data-api/index.html`, and `experiments/data-api-view/index.html` as their artifacts.
- **Why it may be inconsistent:** These entries appear in active Evidence Index metadata rather than in time-qualified historical narration. None of the three referenced files exists at the stated location. Their current locations are `public/auth/index.html`, `public/data-api/index.html`, and `public/data-api-view/index.html`.
- **Recommended disposition:** Update all three Artifact metadata entries to their corresponding `public/` paths in one separate consistency fix after Primary Agent review.
- **Confidence:** High
- **Decision Needed:** No

## Confirmed Clean Areas

- **Root architecture documentation:** `README.md` clearly distinguishes the Git repository Laboratory from Netlify, identifies `public/` as the static Public Artifact boundary, retains Repository root only as the Netlify Base directory, and keeps Trigger Boundary separate from Publish Boundary.
- **Netlify boundary record:** `experiments/netlify-deployment-boundary/README.md` accurately documents the current `experiments/` / `public/` responsibility split and maps all three Experiment Records to their current Browser Artifact paths.
- **Auth Experiment Record:** `experiments/auth/README.md` identifies `public/auth/index.html` as the Public Browser Artifact.
- **Data API View Experiment Record:** `experiments/data-api-view/README.md` identifies `public/data-api-view/index.html` as the Public Browser Artifact.
- **Knowledge architecture:** `knowledge/experiments.md`, `knowledge/maps/nook-technical-platform.md`, and `knowledge/open-exploration.md` link to Experiment Records rather than conflating those records with deployed Browser Artifacts.
- **Boundary summaries:** `evidence/provider-boundary-pitfalls.md` and `notes/short-term-work.md` describe `public/` as the current Publish Boundary and do not present the old repository-root output as current architecture.
- **Public catalog:** `public/index.html` links to `./auth/`, `./data-api/`, and `./data-api-view/`, which correspond to the current directories under `public/`.
- **Markdown relative links:** A repository-wide filesystem check of local Markdown link targets found no missing relative-link target.
- **Current artifact inventory:** The four Browser Artifacts named by the Work Order exist at `public/index.html`, `public/auth/index.html`, `public/data-api/index.html`, and `public/data-api-view/index.html`.

## Historical Statements Preserved

The following statements describe evidence from before or during the restructure and should not be treated as stale-current-state defects:

- `experiments/netlify-deployment-boundary/README.md:14` says the Playground **originally** lacked an explicit Publish directory and that the deploy contents **at that time** approximated the repository root. The temporal framing is clear and is necessary to explain the observed failure mode.
- `experiments/netlify-deployment-boundary/README.md:46-54` says Browser HTML **formerly** shared `experiments/<experiment>/` with Experiment Records, then shows the new Record-to-Artifact mapping. This is the migration narrative, not a current path instruction.
- `experiments/netlify-deployment-boundary/README.md:98` discusses the hypothetical consequence of setting `experiments/` as the Publish directory. It is a design warning, not a claim about current settings.
- `evidence/provider-boundary-pitfalls.md:35-43` contrasts the original broad deployed surface with the verified `public/` boundary. That contrast is historical evidence supporting the present architecture.
- `knowledge/experiments.md:26-30` records why the boundary experiment existed and what it changed. Its past-state language is appropriately separated from the current result.

## Unknown / Decision Needed

### Netlify Trigger Boundary

- **Status:** Open, explicitly documented; not a defect found by this audit.
- **Known:** `public/` controls which static artifacts can enter the Site Deploy.
- **Unknown:** Which Git changes should cause Netlify to start build/deploy evaluation, including future semantics for `netlify/functions/` or other Netlify runtime sources.
- **Decision needed:** Yes. Address as a separate research / configuration decision; do not fold it into the artifact-path documentation fixes.

### Scope of a future fix pass

- **Status:** The stale paths have unambiguous current counterparts.
- **Decision needed:** No architecture decision is required. Primary Agent review is still required by the Work Order before any edits are made.

## Audit Method

- Read every tracked Markdown document, with focused review of root documentation, `agent-work/`, all Experiment Records, `evidence/`, `knowledge/`, and `notes/`.
- Searched tracked repository text for `experiments/`, `public/`, `.html`, Browser Artifact, Publish / Base directory, repository root, Site Deploy, and Netlify references.
- Compared every referenced Browser Artifact path with the tracked filesystem and the Work Order's current artifact inventory.
- Parsed local Markdown links, resolved each target relative to its containing document, and checked target existence.
- Reviewed temporal wording before classifying old-layout statements, so historical evidence was not misreported as current-state inconsistency.
