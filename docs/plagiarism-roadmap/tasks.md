# Frontend integration checklist

Task scope and acceptance: `D:/filemanegerbe/docs/plagiarism-roadmap/frontend-tasks.md`.
This frontend checklist records delivery in the selected repository only.

- [x] FE01 Inventory and baseline (see implementation-log.md)
- [x] FE02 Typed public API adapters and fixtures
- [x] FE03 Polling/FIFO/resume (backend BFE01/BFE02 required)
- [x] FE04 Model/policy snapshots (report workspace integration in FE13)
- [x] FE05 Async upload/reviewer migration (acceptance and limits in implementation-log.md)
- [ ] FE06 Authenticated PDF/OCR preview
- [ ] FE07 Exclusions and assessment explanations
- [ ] FE08 Historical source scope
- [ ] FE09 Exact counts/classifications
- [ ] FE10 Decision/publication lifecycle
- [ ] FE11 Revocation/redaction
- [ ] FE12 Owner rechecks
- [ ] FE13 History/two-sided evidence
- [ ] FE14 Appeals/claims/exceptions
- [ ] FE15 Notifications/admin operations
- [ ] FE16 Browser/quality/performance acceptance
- [ ] FE17 Legacy/rollout/rollback
- [ ] FE18 Live end-to-end acceptance

Backend BFE01/BFE02 contracts are implemented. FE05 supplies the deployment-configuration
option for BFE03 (see deployment.md); matching deployed backend/Worker readiness still
requires release verification. Backend T16–T18 gates remain separate work. No automatic
feature flags are enabled by completing frontend tasks.
