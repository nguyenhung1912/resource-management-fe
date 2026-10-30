# Frontend plagiarism implementation log

## FE05 — Asynchronous upload and reviewer check migration (2026-10-30)

Completed the existing uncommitted FE05 changes on top of `fe2e191` in the selected
frontend repository. Resource uploads retain the accepted processing job and navigate
to its protected tracking route. PDF/DOCX uploads from the source-code dialog also
follow jobs; non-job/archive uploads retain their existing acceptance flow. Existing
file, author and academic validation remains in place. Upload progress describes
transfer/conversion and acceptance separately from analysis/publication.

Reviewer checks now consume a queued job, send an opaque Idempotency-Key and navigate
to the exact server job. They never update legacy score panels with a transient score
or fabricate 0%. Concurrent clicks are suppressed, uncertain check retries reuse their
intent key, and a response from a previous login cannot invoke success/error navigation.

Accepted status references must match the configured API origin and exact job path.
Polling uses the existing authenticated canonical endpoint rather than following an
arbitrary URL. A 202 upload without a usable job, unsafe reference, timeout/network
failure or server error asks the user to inspect My uploads before explicit resubmission;
the client does not automatically replay uploads and retains form data on failure.

Added the deployment-provided configuration option permitted by BFE03: both public
Vite flags default off. Paused mode explains queued work and prevents reviewer check
submission. Legacy manual actions require explicit compatibility configuration and a
fresh authorized resource-state lookup before opening a decision dialog. Durable work,
reports and failed/unknown metadata block that dialog. Backend authorization/phase
guards remain authoritative; report-linked exception UI is FE14. See deployment.md
and .env.example. No live environment file or backend/Worker rollout flag was changed.

| Acceptance | Verification |
| --- | --- |
| 202 acceptance is not a completed analysis/publication | Upload route test follows the exact job without the legacy success-navigation state; both reviewer pages test queued navigation instead of immediate score/revalidation |
| Preserve validation and understandable failures | Existing multipart/academic/file tests retained; new foreign-reference, missing-job and timeout cases retain form/file and require reconciliation; server-error expectation updated accordingly |
| Prevent duplicate requests and reconcile checks | Hook regressions cover overlapping clicks, preserved retry key and independent clients receiving the same server job; source-code upload regression verifies one request and an accepted-job callback without publication success |
| No ordinary durable-document approval | Render tests hide legacy controls by default and block durable/failed metadata before any decision endpoint; explicit verified legacy fixtures still exercise approval/rejection |
| Deployment capability dependency | Defaults/invalid-value test plus paused-request test; build configuration is documented, not inferred from a long-running QUEUED job |

Final validation: `npm test -- --run --maxWorkers=4`: **187 files, 1,039 tests passed**,
zero failed. `npm run lint`: zero errors/warnings. `npm run build`: TypeScript and Vite
production build passed. `git diff --check` passed. An initial focused run exposed
a stale 503 expectation, then a missing error-helper export in the new test mock;
both were corrected. TypeScript also caught an incorrect new upload-fixture property;
the fixture now uses the actual id/metadata contract and the final build passes.

Limits: independent-client tests use a server-response fixture; real two-tab JWT/HTTP
convergence remains FE18, supported by the separately implemented backend admission
constraints. Browser performance, native/OCR preview rendering, full report navigation,
publication refresh, appeals/exceptions and release rehearsal remain FE06–FE18 as
assigned. Backend T16–T18 gates remain open. This task does not certify automatic
pipeline release or claim the BE/Worker suites were rerun. The owner's staged backend
direction document and the other frontend copy were preserved.

## FE04 — Historical model/policy metadata

Added ReportMetadata for immutable report policy threshold, model profile/revision,
extractor/exclusion versions and original reception cutoff, with explicit missing-data
labels. Component regression switches snapshots without substituting current settings.
Report workspace wiring belongs to FE13; no model selector or performance guarantee.
Focused render regression and lint/build verify this component task.

## FE03 — Job tracking and resource rediscovery

Added protected lazy job/resource-state routes and a My uploads processing entry point.
Initial reads use loaders; a shared external-store tracker schedules bounded backoff,
deduplicates consumers, aborts on last unsubscribe/session change, ignores late responses,
pauses offline/hidden and stops terminal/manual-repair timers. Unknown stages remain
neutral; no progress/ETA or technical-failure approval is invented. Session metadata
cache is bounded and holds no report/PDF text. Resource discovery uses backend BFE02,
implemented separately with SQL authorization tests; no mutation on resume.

Verification: 41 focused route/adapter/polling tests pass, including deduplication,
terminal stop, offline/manual repair and logout races; full lint and production build
pass. Three new polling regressions are included. Cross-device discovery requires the
new backend contract; live JWT/browser behavior remains FE18.

## FE02 — Public API contracts

Added separate durable job/report/evidence/diagnostics types and processingService.
Adapters preserve endpoint-specific envelopes, opaque idempotency keys and nested
artifact naming. Preview requests stay on authenticated, report-scoped routes. The
old synchronous score payload is rejected as a job rather than presented as 0%.
Four focused adapter tests passed; scoped ESLint and TypeScript build passed. Full
baseline (1016 tests, lint/build) was established in FE01. No UI or deployment is
claimed by this task. Job-to-report/cross-device discovery remain backend dependencies.

Repository: `D:/RecourceManagermentFE/resource-management-fe`. Owner selected this copy
on 2026-10-25. Starting revision: `55c5ce6`; working tree was clean. The other frontend
copy under `D:/resmanagerment-fe` contains unrelated changes and is not modified.

Source roadmap: `D:/filemanegerbe/docs/plagiarism-roadmap/frontend-tasks.md`, FE01–FE18.
Backend baseline: `9bf0c77`. One implementation commit per task; completion requires
the task's acceptance evidence. Existing APIs have no verified job-to-report association
or cross-device active-job discovery yet. Do not infer these from newest history.

## FE01 — Inventory and integration scope

Read AGENTS.md, DESIGN.md and local essential-ui/react-best-practices skills. Preserve
Vite/React/TypeScript, React Router loaders, Axios services and Essential semantic tokens.
Use event handlers/actions for mutations; no initial API fetch inside React effects.

| Consumer | Existing files | Change destination |
| --- | --- | --- |
| Upload | services/resourceService.ts; resources/hooks/useUploadResource.ts; resources/pages/UploadResourcePage.tsx; source-code/hooks/useUploadSourceCode.ts | FE05: retain returned processingJob, show acceptance rather than completed score |
| My uploads | resources/pages/ResourcesManagerPage.tsx; resources/components/ResourcesManager.tsx | Job/history entry points and independent business status |
| Reviewer check | services/moderationService.ts; moderation/hooks/usePlagiarismCheck.ts; moderation/pages/DocumentModerationDetailPage.tsx | Replace synchronous-score assumption; prevent ordinary durable approval bypass |
| Existing score dashboard | moderation/pages/plagiarismReportLoader.ts; moderation/utils/plagiarism.utils.ts | Legacy weighted score is not the durable report; avoid policy claims from old 20/30 cutoffs |
| New durable reports | new features/processing/{types,components,pages}; services/processingService.ts | Typed job, immutable history, counts, evidence and previews; keep unrelated user-violation reports intact |
| Appeals | services/appealService.ts; appeals/types/appeal.types.ts; appeals/hooks/useResolveAppeal.ts; appeals/pages/AssignedAppealsPage.tsx | Nullable assignment, Accepted state, explicit decision/checkId, claims and job tracking |
| Notifications | services/{notificationService,signalRService}.ts; store/useNotificationStore.ts | Keep durable REST reconciliation; deduplicate realtime hints |
| Auth/caching | store/authStore.ts; services/interceptors.ts | No protected report/PDF data retained after session changes |
| Navigation | constants/path.ts; routes/dashboardRoutes.tsx; routes/domains/*.tsx | Centralize processing paths, lazy pages, loader errors and role guards |

Browser baseline must match the existing Vite/React runtime; actual supported-browser
policy and live JWT/backend deployment are not supplied. Browser integration, performance
acceptance and rollout remain FE16–FE18, not inferred from tests.

Baseline verification is recorded before this task commit. Frontend uses npm.cmd on
Windows; run npm run lint, npm run build and npm test -- --run. Test navigation warnings
from jsdom are not proof of browser behavior.

Actual baseline: lint passed with zero errors/warnings; TypeScript/Vite production
build passed; Vitest **183 files, 1016 tests passed**, 122.49 seconds. Existing jsdom
navigation, React act and zero-size chart warnings remain visible. No runtime code was
changed for FE01. Baseline and real consumer paths satisfy this inventory task.
