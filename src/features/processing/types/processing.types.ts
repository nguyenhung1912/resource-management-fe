/** Public backend contracts. A job, a business decision and a report are independent. */
export interface ProcessingJob {
  jobId: string;
  fileId: string;
  receptionSequence: number;
  status: string;
  stage: string;
  attempt: number;
  nextRetryAtUtc: string | null;
  errorCode: string | null;
  statusUrl: string;
  requiresManualRepair: boolean;
  waitingForEarlierJob: boolean;
  /** Optional future contract; never guess this from the newest history item. */
  checkId?: string | null;
}

export interface CheckSummary {
  checkId: string;
  completedAtUtc: string;
  matchedChunkCount: number;
  totalChunkCount: number;
  displaySimilarityPercent: number;
  recommendation: string;
  modelProfileId: string;
}

export interface ResourceProcessingState {
  fileId: string;
  businessStatus: string;
  currentCheckId: string | null;
  activeJob: ProcessingJob | null;
  publicationReadiness: string | null;
  supportsDurableProcessing: boolean;
  canOwnerRecheck: boolean;
  canReviewerCheck: boolean;
}

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export interface EvidenceWord {
  box?: number[];
  provenance?: string;
  confidence?: number | null;
}
export interface EvidenceSpan {
  page: number;
  words?: EvidenceWord[];
}
export type EvidenceSide = { spans: EvidenceSpan[]; excerpt?: string | null } | EvidenceSpan[];
export interface ReportEvidence {
  targetChunkId: string;
  sourceChunkId: string;
  cosine: number;
  classification: string;
  target: EvidenceSide | null;
  source: EvidenceSide | null;
  lexicalEvidence: JsonValue;
}
export interface ReportSource {
  publicationId: string;
  fileId: string;
  approvedAtUtc: string;
  evidenceHash: string;
  available: boolean;
  unavailableReason: string | null;
  previewUrl: string | null;
  evidence: ReportEvidence[];
}
export interface ReportDecision {
  decision: string;
  isException: boolean;
  reviewerUid: string | null;
  reason: string | null;
  createdAtUtc: string;
}
export interface CheckReport {
  summary: CheckSummary;
  originalCutoffUtc: string;
  targetRevision: string;
  targetEvidenceHash: string;
  modelRevision: string;
  extractorVersion: string;
  exclusionVersion: string;
  policy: Record<string, JsonValue>;
  targetAvailable: boolean;
  targetPreviewUrl: string | null;
  assessmentDetails: { exclusions: JsonValue[]; annotations: JsonValue[]; page_maps: JsonValue } | null;
  detailsUnavailableReason: string | null;
  sources: ReportSource[];
  scopeExplanation: string;
  decisions: ReportDecision[];
}

export interface ProcessingDiagnostics {
  counts: { status: string; count: number }[];
  fifoHead: {
    id: string;
    fileId: string;
    status: string;
    stage: string;
    attempt: number;
    attemptLimit: number | null;
    nextRetryAtUtc: string | null;
    lastErrorCode: string | null;
    blockingReason: string;
    canCancel: boolean;
    cancellationBlockedReason: string | null;
  } | null;
  publicationIssues: {
    id: string;
    fileId: string;
    indexGeneration: string;
    modelProfileId: string;
    indexReadiness: string;
  }[];
  outbox: {
    id: string;
    kind: string;
    status: string;
    attempt: number;
    nextRetryAtUtc: string | null;
    lastErrorCode: string | null;
  }[];
  workerHealth: JsonValue;
  workerUnavailable: boolean;
}
