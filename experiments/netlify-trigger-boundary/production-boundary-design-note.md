# Production Trigger Boundary Design Note

- Date: 2026-09-13
- Status: Design candidate / provider validation pending

Deploy Preview and Production must not share the same comparison model.

For Deploy Preview, verified behavior uses a fresh fetch of current `main`, computes the merge-base to the PR head, then classifies the PR cumulative diff.

For Production, the candidate model uses Netlify `CACHED_COMMIT_REF` to `COMMIT_REF`, because Netlify documents `CACHED_COMMIT_REF` as the last commit built before the current build and production uses its own production cache. This asks whether any deployable-surface change has accumulated since the last production build.

Safety rule: if the cached ref is missing, unresolved, equal to `COMMIT_REF`, or the diff cannot be computed, fail safe toward DEPLOY. This specifically avoids incorrectly skipping a retry that runs without cache, where Netlify documents that `CACHED_COMMIT_REF` equals `COMMIT_REF`.

Provider validation is still required before this production model is considered Verified.
