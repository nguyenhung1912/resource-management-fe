import { useState } from 'react';
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  CloudUpload,
  FileText,
  FolderOpen,
  Gavel,
  GraduationCap,
  Home,
  Scale,
  Search,
  ShieldAlert,
  Sparkles,
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

  if (normalizedUrl === '/' || normalizedUrl.includes('/home')) return Home;
  if (normalizedUrl.includes('/upload')) return CloudUpload;
  if (normalizedUrl.includes('/trash')) return Trash2;
  if (normalizedUrl.includes('/notification')) return Bell;
  if (normalizedUrl.includes('/profile')) return UserRound;
  if (normalizedUrl.includes('/search')) return Search;
  if (normalizedUrl.includes('/resources-manager')) return FolderOpen;
  if (normalizedUrl.includes('/assigned-appeals')) return Gavel;
  if (normalizedUrl.includes('/appeals')) return Scale;
  if (normalizedUrl.includes('/reports-manager')) return ShieldAlert;
  if (normalizedUrl.includes('/plagiarism')) return Sparkles;

  return FileText;
}

export function DashboardMenu({ menuData, user, logoUrl, onNavigate, className }: DashboardMenuProps) {
  const [expandedGroupIds, setExpandedGroupIds] = useState(
    () => new Set(menuData.groups.map((group) => group.groupId)),
  );

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
      className={cn(
        'dashboard-menu-scrollbar flex h-full flex-col overflow-y-auto bg-surface text-text border-r border-border-subtle select-none',
        className,
      )}
    >
      {/* Brand / Logo Top Section */}
      <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3.5">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo hệ thống"
            className="size-9 rounded-xl border border-border-subtle bg-surface object-contain shrink-0"
          />
        ) : (
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 shadow-2xs">
            <GraduationCap aria-hidden="true" className="size-5" />
          </div>
        )}
        <div className="min-w-0">
          <span className="block text-[16px] text-shadow-text-main truncate">Bảng điều khiển</span>
        </div>
      </div>

      {/* User info snippet */}
      <div className="p-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-border-subtle/80 bg-background/60 px-3 py-2.5 shadow-2xs">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="size-8 shrink-0 rounded-full bg-surface object-cover" />
          ) : (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {user.displayName ? (
                user.displayName.charAt(0).toUpperCase()
              ) : (
                <CircleUserRound aria-hidden="true" className="size-4 text-primary" />
              )}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-text-main">{user.displayName}</p>
            {user.secondaryText ? <p className="truncate text-[11px] text-text-muted">{user.secondaryText}</p> : null}
          </div>
        </div>
      </div>

      {/* Accordion Menu Groups */}
      <div className="flex flex-1 flex-col gap-1 px-2 pb-4">
        {menuData.groups.map((group) => {
          const isExpanded = expandedGroupIds.has(group.groupId);
          const panelId = `dashboard-menu-group-${group.groupId}`;

          return (
            <section key={group.groupId} aria-labelledby={`${panelId}-button`} className="space-y-0.5">
              <button
                id={`${panelId}-button`}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => toggleGroup(group.groupId)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted transition-colors hover:bg-background hover:text-text-main cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span className="truncate">{group.groupName}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'size-3.5 shrink-0 text-text-muted transition-transform duration-200',
                    !isExpanded && '-rotate-90',
                  )}
                />
              </button>

              {isExpanded ? (
                <ul id={panelId} className="space-y-0.5 py-0.5">
                  {group.functions.map((menuFunction) => {
                    const FunctionIcon = getFunctionIcon(menuFunction.functionUrl);
                    const tooltipId = `dashboard-function-tooltip-${menuFunction.functionId}`;

                    return (
                      <li key={menuFunction.functionId}>
                        <NavLink
                          to={menuFunction.functionUrl}
                          end
                          aria-describedby={menuFunction.functionDescription ? tooltipId : undefined}
                          onClick={onNavigate}
                          className={({ isActive }) =>
                            cn(
                              'group flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 select-none',
                              isActive
                                ? 'bg-primary/10 font-semibold text-primary shadow-2xs border-r-2 border-primary'
                                : 'text-text-muted hover:bg-background hover:text-text-main',
                            )
                          }
                        >
                          <FunctionIcon aria-hidden="true" className="size-4 shrink-0 transition-colors" />
                          <span className="truncate">{menuFunction.functionName}</span>
                        </NavLink>

                        {menuFunction.functionDescription ? (
                          <span id={tooltipId} className="sr-only">
                            {menuFunction.functionDescription}
                          </span>
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

export default DashboardMenu;
