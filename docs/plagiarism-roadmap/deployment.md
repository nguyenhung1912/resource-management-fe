# Processing deployment configuration

FE05 uses deployment-provided Vite configuration for BFE03. Both values default to
false when absent or invalid. Changing them requires rebuilding the frontend.

- `VITE_AUTOMATIC_PROCESSING_ENABLED=true` permits reviewer check requests. Otherwise
  the UI explains that processing is paused. Existing jobs remain viewable, and uploads
  may still be accepted/queued by the backend. Acceptance never promises publication.
- `VITE_LEGACY_MANUAL_MODERATION_ENABLED=true` exposes legacy decision entry points.
  Before opening a dialog, a current authorized processing-state lookup must confirm
  no durable support, active job or report. Failed/unknown lookups block the action.
  Backend authorization and durable-document guards remain authoritative.

These public build settings contain no secrets. They do not enable backend
`Processing:Enabled` or Worker `AUTOMATIC_PROCESSING_ENABLED`, certify service health,
or replace T16-T18/FE16-FE18 release evidence. Keep automatic processing false until
the deployment owner verifies the corresponding backend/Worker deployment and release
gates. Legacy rollout and rollback rehearsal remain FE17.

Accepted jobs are validated against the configured API origin and exact job status
path. The client uses its existing authenticated canonical polling route, never an
arbitrary returned URL. Upload timeout, network failure, server error or malformed
acceptance is an uncertain outcome: inspect My uploads and its processing entry before
explicitly resubmitting. The client does not replay uploads automatically.

Report navigation and publication refresh remain FE10/FE13. Authorized exception
decisions belong to the report-linked appeal flow in FE14; ordinary moderation dialogs
cannot provide an exception for durable documents.
