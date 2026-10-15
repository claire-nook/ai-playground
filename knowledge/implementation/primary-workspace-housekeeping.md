# Artifact Workspace Lifecycle｜實驗與設計觀察

- Test date: 2026-09-18
- Status: Verified lifecycle probe / research-derived design considerations
- Evidence: [A-ARTIFACT-1](../../experiments/artifact-transport/README.md)
- Scope: temporary artifact staging, rename, verification, cleanup, and durable-state separation

## Research question

能否在不將每份暫存檔案寫入 Git history 的前提下，完成加工產物的 staging、rename、verification 與 cleanup？哪些 artifact 應成為可長期追溯的 Repository evidence？

## Artifact classes

| Artifact type | Research interpretation |
| --- | --- |
| Temporary render / intermediate PDF | Processing intermediate; not automatically durable evidence |
| Staging image / conversion result | Transfer or verification input; preserve only when required for reproducibility |
| Probe output / retry copy | Temporary control artifact unless it documents a relevant result |
| Source code / reusable script | Versioned technical source |
| Experiment record / validation result | Durable research evidence |
| Human-facing finished artifact | Delivery output; storage destination is task-dependent |
| Unique raw source | Must not be destroyed by staging cleanup |

A generated file does not automatically belong in Git. The deciding factors are reproducibility, source ownership, long-term research value, and whether it is the only remaining copy.

## Lifecycle tested

~~~text
create task-scoped folder
→ copy existing test PDF into staging
→ rename staged copy
→ list / verify file identity
→ delete temporary task folder
→ list / verify cleanup
→ confirm original source remained untouched
~~~

The test used a designated Dropbox collaboration area. Private account folder names and exact storage paths are intentionally omitted from this public research guide.

### Observed results

- Task folder creation: Verified
- File copy into staging: Verified
- Rename / move within staging: Verified
- File identity preserved across rename: Verified
- List / inspection: Verified
- Temporary task-folder cleanup: Verified
- Original control PDF remained untouched: Verified
- No residual probe task folder after cleanup: Verified

The final observed workspace still contained an unrelated existing directory. The test therefore supports **targeted cleanup of the probe**, not a claim that the entire storage area was empty.

## Reusable design considerations

- Temporary workspace and versioned repository serve different responsibilities.
- Use task-scoped staging only when needed; avoid creating permanent folder taxonomies for one-off probes.
- Choose names that express artifact purpose; a date suffix may help but is not a required schema.
- Before cleanup, verify that source material and durable evidence exist outside the temporary location.
- Verify deletion by listing the intended target again; a successful delete call alone is weaker evidence.
- Do not infer ownership or permission to delete unrelated files from success on a dedicated test folder.

## Boundaries and future experiments

This probe did **not** establish rollback, revision recovery, archive policy, cross-account access, or generalized permission to reorganize private storage. Those are separate research questions requiring their own authorization and evidence.

The full transport study and historical observations are preserved in [A-ARTIFACT-1](../../experiments/artifact-transport/README.md). This document is a public test description, **not** an agent's private workspace housekeeping instruction.
