import { useState } from 'react';
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  CloudUpload,
  FileText,
  FolderOpen,
  GraduationCap,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import type { DashboardMenuResponse, DashboardMenuUser } from '@/features/dashboard/types/dashboard-menu.types';
import { cn } from '@/utils/cn';

interface DashboardMenuProps {
  menuData: DashboardMenuResponse;
  user: DashboardMenuUser;
  logoUrl?: string;
  onNavigate?: () => void;
  className?: string;
}

function getFunctionIcon(functionUrl: string): LucideIcon {
  const normalizedUrl = functionUrl.toLowerCase();

  if (normalizedUrl.includes('/upload')) return CloudUpload;
  if (normalizedUrl.includes('/trash')) return Trash2;
  if (normalizedUrl.includes('/notification')) return Bell;
  if (normalizedUrl.includes('/profile')) return UserRound;
  if (normalizedUrl.includes('/search')) return Search;
  if (normalizedUrl.includes('/resources-manager')) return FolderOpen;

  return FileText;
}

export function DashboardMenu({ menuData, user, logoUrl, onNavigate, className }: DashboardMenuProps) {
  const [expandedGroupIds, setExpandedGroupIds] = useState(
    () => new Set(menuData.groups.map((group) => group.groupId)),
  );
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  const toggleGroup = (groupId: string) => {
    setExpandedGroupIds((currentGroupIds) => {
      const nextGroupIds = new Set(currentGroupIds);

      if (nextGroupIds.has(groupId)) {
        nextGroupIds.delete(groupId);
      } else {
        nextGroupIds.add(groupId);
      }

      return nextGroupIds;
    });
  };

  return (
    <nav
      aria-label="Menu dashboard"
      className={cn('flex h-full flex-col overflow-y-auto bg-dashboard-shell text-white', className)}
    >
      <div className="flex min-h-24 items-center justify-center border-b border-white/10 px-5 py-4">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo hệ thống"
            className="size-16 rounded-full border-2 border-white/80 bg-surface object-contain"
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-full bg-surface text-primary shadow-sm">
            <GraduationCap aria-hidden="true" className="size-8" />
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center gap-3 rounded-xl bg-primary/70 px-3 py-3 shadow-sm">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="size-10 shrink-0 rounded-full bg-surface object-cover" />
          ) : (
            <CircleUserRound aria-hidden="true" className="size-10 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.displayName}</p>
            {user.secondaryText ? <p className="mt-0.5 truncate text-xs text-white/70">{user.secondaryText}</p> : null}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 pb-4">
        {menuData.groups.map((group) => {
          const isExpanded = expandedGroupIds.has(group.groupId);
          const panelId = `dashboard-menu-group-${group.groupId}`;

          return (
            <section key={group.groupId} aria-labelledby={`${panelId}-button`}>
              <button
                id={`${panelId}-button`}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => toggleGroup(group.groupId)}
                className="flex w-full items-center justify-between bg-white/10 px-3 py-2 text-left text-xs font-medium uppercase tracking-wide transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
              >
                <span className="truncate">{group.groupName}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn('size-4 shrink-0 transition-transform', !isExpanded && '-rotate-90')}
                />
              </button>

              {isExpanded ? (
                <ul id={panelId} className="space-y-0.5 px-2 py-1">
                  {group.functions.map((menuFunction) => {
                    const FunctionIcon = getFunctionIcon(menuFunction.functionUrl);
                    const tooltipId = `dashboard-function-tooltip-${menuFunction.functionId}`;
                    const isTooltipVisible =
                      activeTooltipId === menuFunction.functionId && Boolean(menuFunction.functionDescription);

                    return (
                      <li key={menuFunction.functionId} className="relative">
                        <NavLink
                          to={menuFunction.functionUrl}
                          end
                          aria-describedby={menuFunction.functionDescription ? tooltipId : undefined}
                          onClick={onNavigate}
                          onMouseEnter={() => setActiveTooltipId(menuFunction.functionId)}
                          onMouseLeave={() => setActiveTooltipId(null)}
                          onFocus={() => setActiveTooltipId(menuFunction.functionId)}
                          onBlur={() => setActiveTooltipId(null)}
                          className={({ isActive }) =>
                            cn(
                              'flex min-h-9 items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                              isActive
                                ? 'bg-primary font-semibold text-white shadow-sm'
                                : 'text-white/85 hover:bg-white/10 hover:text-white',
                            )
                          }
                        >
                          <FunctionIcon aria-hidden="true" className="size-4 shrink-0" />
                          <span className="truncate">{menuFunction.functionName}</span>
                        </NavLink>

                        {isTooltipVisible ? (
                          <div
                            id={tooltipId}
                            role="tooltip"
                            className="absolute left-full top-1/2 z-50 ml-2 w-max max-w-64 -translate-y-1/2 rounded-lg border border-border-subtle bg-surface px-3 py-2 text-xs normal-case text-text-main shadow-lg"
                          >
                            {menuFunction.functionDescription}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>
    </nav>
  );
}
