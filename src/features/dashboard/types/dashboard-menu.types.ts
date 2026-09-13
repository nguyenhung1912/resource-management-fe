export interface DashboardFunction {
  functionId: string;
  functionName: string;
  functionUrl: string;
  functionDescription: string | null;
}

export interface DashboardMenuGroup {
  groupId: string;
  groupName: string;
  functions: DashboardFunction[];
}

export interface DashboardMenuResponse {
  groups: DashboardMenuGroup[];
}

export interface DashboardMenuUser {
  displayName: string;
  secondaryText?: string;
  avatarUrl?: string;
}
