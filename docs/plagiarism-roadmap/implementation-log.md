# Frontend plagiarism implementation log

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
