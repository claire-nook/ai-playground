# Day One Reader

## Question

Can a static, local-first HTML reader reconstruct a comfortable reading experience directly from Day One JSON without converting the journal into another canonical format?

## Current contract

- Day One JSON remains the source of truth.
- The reader runs entirely in the browser. Personal journal data is selected locally and is not a runtime dependency of this repository.
- Day One's own export layout is authoritative. When media is exported, the reader expects the original `photos/` content and maps `richText.embeddedObjects[].identifier → entry.photos[].identifier → photos[].md5 + type`.
- Do not invent a replacement media directory structure.
- JSON-only is a first-class mode. A photo embedded in the journal but not supplied to the reader must remain visible as a placeholder at its original article position.
- JSON + photos is an enhancement of the same rendering path, not a different journal format.
- Repository fixtures, if added later, are test/download material only. They are not how a user's real journal is loaded.

## Current development fixture

The first renderer pass is being tested against a real Day One export supplied out-of-band during the experiment. It currently contains two entries covering rich text, metadata, tags, quotes, numbered/bulleted/check lists, inline formatting, single photos, consecutive photo groups, and text/photo interleaving.

The raw fixture is deliberately **not committed yet**. It can be replaced by a later Day One export as the test journal grows (for example, after PDF attachment coverage is added), without turning Git history into a landfill for temporary binary exports.

## Browser modes

```text
JSON only
Day One JSON
  → richText / metadata / photo references
  → no matching local media supplied
  → preserve position and render photo placeholder

JSON + Day One photos
Day One JSON + local photos/ selection
  → richText embedded identifier
  → entry.photos metadata
  → md5/type match against local files
  → render local image with object URL
  → unmatched photo still falls back to placeholder
```

A browser cannot silently roam through arbitrary sibling folders after the user selects one file. The UI therefore asks the user to choose the JSON and, when desired, choose the exported `photos` folder/files explicitly. The expected file names and mapping still follow Day One's export unchanged.

## Boundaries

This experiment is the development source. A mature standalone HTML may later graduate to `dev-maybe`, but `dev-maybe` is intentionally out of the current implementation loop.

No backend, upload API, analytics, remote font, or remote script dependency should be required for reading a private journal.
