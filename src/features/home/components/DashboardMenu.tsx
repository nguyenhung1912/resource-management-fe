import { useState } from 'react';
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  CircleUserRound,
  CloudUpload,
  Code2,
  Compass,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  FolderOpen,
  Gavel,
  GraduationCap,
  History,
  Home,
  Layers,
  Library,
  Scale,
  School,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import logoQnu from '@/assets/logo-qnu.webp';
import { APP_PATHS } from '@/constants/path';
import type {
  DashboardMenuGroup,
  DashboardMenuResponse,
  DashboardMenuUser,
} from '@/features/home/types/dashboard-menu.types';
import { cn } from '@/utils/cn';

interface DashboardMenuProps {
  menuData: DashboardMenuResponse;
  user: DashboardMenuUser;
  logoUrl?: string;
  onNavigate?: () => void;
  className?: string;
}

function getGroupIcon(groupId: string): LucideIcon {
  switch (groupId) {
    case 'personal':
      return CircleUserRound;
    case 'digital-resources':
      return Library;
    case 'user-management':
      return Users;
    case 'resource-management':
      return FolderKanban;
    case 'system-management':
      return SlidersHorizontal;
    case 'resource-discovery':
      return Compass;
    default:
      return FolderKanban;
  }
}

function getFunctionIcon(functionUrl: string): LucideIcon {
  const normalizedUrl = functionUrl.toLowerCase();

  if (normalizedUrl === '/' || normalizedUrl.includes('/home')) return Home;
  if (normalizedUrl.includes('/profile')) return UserRound;
  if (normalizedUrl.includes('/notification')) return Bell;

  // Digital resources
  if (normalizedUrl.includes('/lectures')) return BookOpen;
  if (normalizedUrl.includes('/theses')) return GraduationCap;
  if (normalizedUrl.includes('/course-reports')) return FileSpreadsheet;
  if (normalizedUrl.includes('/source-code')) return Code2;
  if (normalizedUrl.includes('/other-resources')) return Layers;
  if (normalizedUrl.endsWith('/resources') || normalizedUrl.includes('/resources/all')) return Library;

  // Resource Management
  if (normalizedUrl.includes('/upload')) return CloudUpload;
  if (normalizedUrl.includes('/trash')) return Trash2;
  if (normalizedUrl.includes('/moderation')) return FolderKanban;
  if (normalizedUrl.includes('/assigned')) return Gavel;
  if (normalizedUrl.includes('/appeals')) return Scale;
  if (normalizedUrl.includes('/reports')) return ShieldAlert;
  if (normalizedUrl.includes('/resources-manager')) return FolderOpen;
  if (normalizedUrl.includes('/assigned-appeals')) return Gavel;
  if (normalizedUrl.includes('/appeals')) return Scale;
  if (normalizedUrl.includes('/reports-manager')) return ShieldAlert;
  if (normalizedUrl.includes('/plagiarism')) return Sparkles;

  // Admin & System Management
  if (normalizedUrl.includes('/admin/users')) return Users;
  if (normalizedUrl.includes('/admin/functions')) return ShieldCheck;
  if (normalizedUrl.includes('/system-functions')) return SlidersHorizontal;
  if (normalizedUrl.includes('/academic')) return School;
  if (normalizedUrl.includes('/audit-logs')) return History;
  if (normalizedUrl.includes('/statistics')) return BarChart3;

  // Search Hub
  if (normalizedUrl.includes('/search')) return Search;

  return FileText;
}

export function DashboardMenu({ menuData, user, logoUrl = logoQnu, onNavigate, className }: DashboardMenuProps) {
  const location = useLocation();
  const currentPath = location.pathname;

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

  const isChildActive = (itemUrl: string) => {
    if (itemUrl === APP_PATHS.HOME) {
      return currentPath === APP_PATHS.HOME;
    }
    return currentPath === itemUrl || currentPath.startsWith(`${itemUrl}/`);
  };

  const isGroupActive = (group: DashboardMenuGroup) => {
    return group.functions.some((fn) => isChildActive(fn.functionUrl));
  };

  return (
    <nav
      aria-label="Menu dashboard"
      className={cn(
        'dashboard-menu-scrollbar flex h-full flex-col overflow-y-auto bg-surface text-text border-r border-border shadow-xs select-none',
        className,
      )}
    >
      {/* Brand / Logo Top Section */}
      <div className="flex items-center justify-center border-b border-border px-4 py-5 bg-surface">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo Trường Đại học Quy Nhơn"
            className="size-24 rounded-full border-2 border-border/80 bg-surface object-contain p-1.5 shadow-xs transition-transform duration-200 hover:scale-105"
          />
        ) : (
          <div className="flex size-24 items-center justify-center rounded-full bg-primary/10 text-primary shadow-2xs">
            <GraduationCap aria-hidden="true" className="size-12" />
          </div>
        )}
      </div>

      {/* User info snippet */}
      <div className="p-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 shadow-2xs">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="size-8 shrink-0 rounded-full border border-border bg-surface object-cover"
            />
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
            {user.secondaryText ? (
              <p className="truncate text-[11px] font-medium text-text-muted">{user.secondaryText}</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Accordion Menu Groups */}
      <div className="flex flex-1 flex-col gap-1.5 px-2.5 pb-4">
        {menuData.groups.map((group) => {
          const isExpanded = expandedGroupIds.has(group.groupId);
          const groupActive = isGroupActive(group);
          const GroupIcon = getGroupIcon(group.groupId);
          const panelId = `dashboard-menu-group-${group.groupId}`;

          return (
            <section key={group.groupId} aria-labelledby={`${panelId}-button`} className="space-y-1">
              <button
                id={`${panelId}-button`}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => toggleGroup(group.groupId)}
                className={cn(
                  'group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  groupActive
                    ? 'bg-primary/10 text-primary border border-primary/25 shadow-2xs font-bold'
                    : 'bg-neutral-100/70 text-text-main hover:bg-neutral-200/60 hover:text-text-main border border-transparent font-semibold',
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      'flex size-6.5 items-center justify-center rounded-lg transition-colors shrink-0',
                      groupActive
                        ? 'bg-primary text-white shadow-2xs'
                        : 'bg-neutral-200/80 text-text-muted group-hover:text-text-main group-hover:bg-neutral-300/80',
                    )}
                  >
                    <GroupIcon aria-hidden="true" className="size-3.5" />
                  </div>
                  <span className="truncate text-xs font-bold uppercase tracking-wide">{group.groupName}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  {groupActive && (
                    <span
                      className="size-2 rounded-full bg-primary ring-2 ring-primary/20 animate-pulse"
                      aria-hidden="true"
                    />
                  )}
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      'size-3.5 shrink-0 transition-transform duration-200',
                      groupActive ? 'text-primary font-bold' : 'text-text-muted',
                      !isExpanded && '-rotate-90',
                    )}
                  />
                </div>
              </button>

              {isExpanded ? (
                <ul
                  id={panelId}
                  className={cn(
                    'ml-3.5 space-y-0.5 border-l-2 pl-2.5 py-0.5 transition-colors',
                    groupActive ? 'border-primary/40' : 'border-border-subtle/80',
                  )}
                >
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
                                ? 'bg-primary text-white font-semibold shadow-xs'
                                : 'text-text-main hover:bg-neutral-100 hover:text-primary',
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <FunctionIcon
                                aria-hidden="true"
                                className={cn(
                                  'size-4 shrink-0 transition-colors',
                                  isActive ? 'text-white' : 'text-secondary group-hover:text-primary',
                                )}
                              />
                              <span className="truncate">{menuFunction.functionName}</span>
                            </>
                          )}
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
