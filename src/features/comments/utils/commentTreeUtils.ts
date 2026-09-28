export const MAX_VISUAL_DEPTH = 2;

export function getTreeIndentationClass(depth: number): string {
  if (depth <= 0) {
    return '';
  }

  if (depth === 1) {
    return 'ml-4 sm:ml-5 pl-3.5 border-l-2 border-border-subtle/80 hover:border-primary/50 transition-colors';
  }

  return 'ml-2 sm:ml-3 pl-3 border-l-2 border-border-subtle/60 hover:border-primary/50 transition-colors';
}

export function isDepthCapped(depth: number, maxDepth = MAX_VISUAL_DEPTH): boolean {
  return depth >= maxDepth;
}

export function getEffectiveDepth(depth: number, maxDepth = MAX_VISUAL_DEPTH): number {
  if (Number.isNaN(depth) || depth < 0) return 0;
  return Math.min(depth, maxDepth);
}

export function formatMention(authorName?: string | null): string {
  if (!authorName || !authorName.trim()) {
    return '';
  }
  return `@${authorName.trim()}`;
}

export function formatReplyingToLabel(parentAuthorName?: string | null): string | null {
  if (!parentAuthorName || !parentAuthorName.trim()) {
    return null;
  }
  return `Đang trả lời @${parentAuthorName.trim()}`;
}

export function extractMention(content: string): { mention: string | null; cleanContent: string } {
  if (!content || !content.trim()) {
    return { mention: null, cleanContent: '' };
  }

  const trimmed = content.trim();

  const colonMatch = /^@([^\n\r:]{2,50}):\s*([\s\S]*)$/.exec(trimmed);
  if (colonMatch) {
    const rawMention = colonMatch[1]?.trim() ?? '';
    const clean = colonMatch[2]?.trim() ?? '';
    return {
      mention: rawMention.length > 0 ? rawMention : null,
      cleanContent: clean,
    };
  }

  const singleTokenMatch = /^@([A-Za-z0-9_.\u00C0-\u1EF9]+)\s+([\s\S]*)$/.exec(trimmed);
  if (singleTokenMatch) {
    const rawMention = singleTokenMatch[1]?.trim() ?? '';
    const clean = singleTokenMatch[2]?.trim() ?? '';
    return {
      mention: rawMention.length > 0 ? rawMention : null,
      cleanContent: clean,
    };
  }

  return { mention: null, cleanContent: trimmed };
}
