# Dropbox PDF Reading Boundary

- Status: Verified boundary / operational reference
- Established: 2026-09-18
- Scope: What Primary can read from Dropbox PDFs with the current Dropbox Connector
- Evidence origin: A-ARTIFACT-1
- Non-goal: solving large-PDF reading with custom Actions, splitters, chunkers, or new plugins

## 1. Why This Exists

Claire may simply say:

> Dropbox 有個檔案，你去看看。

Primary should not rediscover the same PDF limits from scratch, nor should Claire be expected to remember connector limits.

This guide answers only:

> **With the current Dropbox Connector, how far can Primary read a PDF before hitting a platform boundary?**

If the real use case later requires more than this boundary, choose another reading surface / specialized connector / explicit upload workflow at that time. Do not build an eight-program contraption merely to conquer the sixth megabyte.

## 2. Verified Control Files

Real files under /英文學習 were used.

### Small control

~~~text
/英文學習/旋元佑文法.pdf
size: 2,784,964 bytes
display: 2.66 MB
~~~

Observed:

- metadata: Verified
- preview: Verified
- full extracted text fetch: Verified
- extracted text length: 360,763 characters

The fetched text included document structure and body text, including the table of contents and first chapter content.

### Large control

~~~text
/英文學習/旋元祐字源大挪移.pdf
size: 99,768,096 bytes
display: 95.15 MB
~~~

Observed:

- metadata: Verified
- preview: Verified
- direct temporary download link: Verified
- full extracted text fetch: Failed with explicit 5 MiB limit
- page-range fetch: No current Dropbox Connector primitive exposed
- partial text fetch by page / byte range: No current Dropbox Connector primitive exposed

Fetch failure returned:

~~~text
FILE_TOO_LARGE
Maximum supported size is 5MB (5242880 bytes)
~~~

## 3. Current Reading Capability Matrix

| Capability | <= 5 MiB PDF | > 5 MiB PDF | Current Judgment |
| --- | --- | --- | --- |
| Metadata | Verified | Verified | filename / size / MIME / revision / modified time available |
| Visual preview | Verified | Verified | preview surface exists, but it is not a page-range reading API |
| Full extracted text fetch | Verified | Blocked | hard 5 MiB connector limit observed |
| Search by PDF content | Not established | Not established | test queries against known small-file terms and likely large-file terms returned no result |
| Page-range text fetch | Not exposed | Not exposed | no current primitive such as pages 31–50 |
| Partial / chunk fetch | Not exposed | Not exposed | no offset / range parameter in current fetch tool |
| Temporary direct download URL | Available | Available | useful for external runtimes, but does not itself give Primary extracted text |
| Direct Dropbox binary → Primary local processing | Not established | Not established | separate transport boundary |

## 4. Practical Reading Decision

### Case A — PDF <= 5 MiB

Preferred first path:

~~~text
Dropbox file
→ metadata
→ fetch extracted text
→ read / summarize / teach / organize
~~~

This is the cleanest current Dropbox-native reading workflow.

### Case B — PDF > 5 MiB

Current Dropbox-native path can still do:

~~~text
metadata
preview
temporary download link
~~~

But Primary cannot currently rely on Dropbox Connector alone for:

~~~text
full text
page 1–30
page 31–50
semantic chunk 7
byte-range fetch
~~~

So when Claire says “讀第 31–50 頁” on a >5 MiB Dropbox PDF, do not pretend Dropbox fetch can do it.

## 5. Search Boundary

Dropbox search was tested with terms known to exist in the small PDF, including:

~~~text
基本句型
動名詞
~~~

and likely large-book terms such as:

~~~text
字根
字首
prefix
root
~~~

No results were returned.

Therefore current guidance is conservative:

> **Do not depend on Dropbox search as a page/section-level PDF reading substitute.**

Search may still be useful for filename discovery, but content retrieval behavior for these PDFs is not established strongly enough to build a reading workflow on it.

## 6. Temporary Download Link Boundary

Large PDF direct download link generation succeeded.

However:

~~~text
Dropbox
→ temporary single-use URL
✅

temporary URL
→ Primary extracted text / page-range reader
❌ not established in current runtime
~~~

The link proves the file is retrievable by another capable runtime. It does not erase the current Primary / Connector reading boundary.

Do not convert this into a new engineering project unless a real use case justifies it.

## 7. Conversation Upload Is a Different Surface

A user uploading a PDF directly into Conversation may have different platform limits and behavior.

That boundary is **not part of this Dropbox experiment**.

Do not assume:

~~~text
Dropbox 5 MiB fetch limit
=
Conversation upload limit
~~~

and do not assume a 90 MB Conversation upload would be a good reading workflow merely because upload UI accepts it. File acceptance, extraction limits, context pressure, and stable page-range access are separate concerns.

If a future real reading need appears, evaluate the then-current best surface.

## 8. Future Study / Tutoring Use Case

A realistic tutoring workflow may look like:

~~~text
Day 1: read pages 1–30
Day 2: read pages 31–50
Day 3: Claire disappears into the void
Day 4: continue pages 51–90
~~~

Reading progress / notes may live in Dropbox, a learning repository, or a dedicated Study project. That continuity layer is separate from the PDF reader itself.

This experiment does not require Dropbox to solve the entire study workflow.

## 9. Reopen Conditions

Reopen this boundary only if one of these changes:

- Dropbox Connector adds page-range / partial fetch
- fetch size limit changes
- Dropbox exposes a reliable document-reading primitive beyond whole-file extraction
- a real Claire workflow requires >5 MiB PDF reading
- a specialized PDF / academic plugin becomes worth evaluating

Until then:

> **Record the boundary, use it, and stop.**

The laboratory studies walls. It does not automatically build tunnels through every wall it finds.
