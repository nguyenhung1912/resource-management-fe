export interface UpsertRatingRequest {
  fileId: string;
  ratingScore: number;
  review?: string | null;
}

export interface RatingItemResponse {
  ratingId: string;
  fileId: string;
  uid: string;
  userCode?: string;
  fullName: string;
  roleName?: string;
  ratingScore: number;
  review?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface StarDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  [key: string]: number;
}

export interface RatingSummaryResponse {
  fileId: string;
  averageRating: number;
  totalRatings: number;
  starDistribution: StarDistribution;
  currentUserRating: number | null;
}

export interface PagedRatingResponse {
  items: RatingItemResponse[];
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface RatingFilterQuery {
  star?: number | null;
  pageIndex?: number;
  pageSize?: number;
}

export interface RatingMutationResponse {
  message: string;
  data?: RatingItemResponse;
}

export interface MessageResponse {
  message: string;
}

/**
 * Normalizes raw BE star distribution data into standard 1..5 numbers
 */
export function normalizeStarDistribution(raw: unknown): StarDistribution {
  const defaultDist: StarDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (!raw || typeof raw !== 'object') {
    return defaultDist;
  }

  const rawRecord = raw as Record<string, unknown>;

  // Check dictionary keys (1, 2, 3, 4, 5) or swagger keys (star1, star2, etc.)
  for (let star = 1; star <= 5; star++) {
    const val = rawRecord[star] ?? rawRecord[String(star)] ?? rawRecord[`star${star}`];
    defaultDist[star] = typeof val === 'number' && !Number.isNaN(val) ? Math.max(0, Math.floor(val)) : 0;
  }

  return defaultDist;
}

/**
 * Normalizes raw BE RatingSummaryResponse to accommodate both C# DTO (AverageScore) and Swagger (averageRating)
 */
export function normalizeRatingSummary(raw: unknown, fileIdFallback = ''): RatingSummaryResponse {
  if (!raw || typeof raw !== 'object') {
    return {
      fileId: fileIdFallback,
      averageRating: 0,
      totalRatings: 0,
      starDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      currentUserRating: null,
    };
  }

  const data = raw as Record<string, unknown>;

  const fileId = typeof data.fileId === 'string' && data.fileId.trim() ? data.fileId.trim() : fileIdFallback;

  const rawScore = data.averageRating ?? data.averageScore ?? data.AverageScore ?? data.AverageRating;
  const parsedScore = typeof rawScore === 'number' ? rawScore : Number(rawScore);
  const averageRating = Number.isFinite(parsedScore) ? Math.max(0, Math.min(5, Math.round(parsedScore * 10) / 10)) : 0;

  const rawTotal = data.totalRatings ?? data.TotalRatings ?? data.totalCount;
  const parsedTotal = typeof rawTotal === 'number' ? rawTotal : Number(rawTotal);
  const totalRatings = Number.isFinite(parsedTotal) ? Math.max(0, Math.floor(parsedTotal)) : 0;

  const starDistribution = normalizeStarDistribution(data.starDistribution ?? data.StarDistribution);

  // currentUserRating can be a number (C# backend) or an object (Swagger RatingItemResponse)
  let currentUserRating: number | null = null;
  const rawCurrentUser = data.currentUserRating ?? data.CurrentUserRating;
  if (typeof rawCurrentUser === 'number' && Number.isFinite(rawCurrentUser)) {
    currentUserRating = rawCurrentUser;
  } else if (rawCurrentUser && typeof rawCurrentUser === 'object') {
    const objUser = rawCurrentUser as Record<string, unknown>;
    const score = objUser.ratingScore ?? objUser.RatingScore;
    if (typeof score === 'number' && Number.isFinite(score)) {
      currentUserRating = score;
    }
  }

  return {
    fileId,
    averageRating,
    totalRatings,
    starDistribution,
    currentUserRating,
  };
}

/**
 * Normalizes raw BE PagedRatingResponse
 */
export function normalizePagedRating(raw: unknown): PagedRatingResponse {
  if (!raw || typeof raw !== 'object') {
    return {
      items: [],
      totalItems: 0,
      pageIndex: 1,
      pageSize: 10,
      totalPages: 0,
    };
  }

  const data = raw as Record<string, unknown>;

  const rawItems = Array.isArray(data.items) ? data.items : Array.isArray(data.Items) ? data.Items : [];
  const items: RatingItemResponse[] = rawItems
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      ratingId: String(item.ratingId ?? item.RatingId ?? ''),
      fileId: String(item.fileId ?? item.FileId ?? ''),
      uid: String(item.uid ?? item.Uid ?? ''),
      userCode:
        typeof item.userCode === 'string'
          ? item.userCode
          : typeof item.UserCode === 'string'
            ? item.UserCode
            : undefined,
      fullName: String(item.fullName ?? item.FullName ?? item.authorName ?? 'Người dùng'),
      roleName:
        typeof item.roleName === 'string' ? item.roleName : typeof item.RoleName === 'string' ? item.RoleName : 'User',
      ratingScore: Number(item.ratingScore ?? item.RatingScore ?? 0),
      review: typeof item.review === 'string' ? item.review : null,
      createdAt: String(item.createdAt ?? item.CreatedAt ?? new Date().toISOString()),
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : null,
    }));

  const totalItems = Number(data.totalItems ?? data.TotalItems ?? data.totalCount ?? items.length) || 0;
  const pageIndex = Math.max(1, Number(data.pageIndex ?? data.PageIndex ?? 1));
  const pageSize = Math.max(1, Number(data.pageSize ?? data.PageSize ?? 10));
  const totalPages =
    Number(data.totalPages ?? data.TotalPages) || (pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0);

  return {
    items,
    totalItems,
    pageIndex,
    pageSize,
    totalPages,
  };
}
