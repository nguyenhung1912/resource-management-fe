import { cn } from '@/utils/cn';
import { AUDIT_ACTION_MAP } from '../types/audit-log.types';

export interface AuditActionBadgeProps {
  action: string;
  className?: string;
}

export function AuditActionBadge({ action, className }: AuditActionBadgeProps) {
  const meta = AUDIT_ACTION_MAP[action];
  const label = meta ? meta.label : action;

  return (
    <div className={cn('flex flex-col gap-0.5 text-left', className)} title={action}>
      <span className="text-xs font-medium text-text leading-tight">{label}</span>
      {meta ? <span className="font-mono text-[10px] text-text-muted leading-tight">{action}</span> : null}
    </div>
  );
}

export default AuditActionBadge;
