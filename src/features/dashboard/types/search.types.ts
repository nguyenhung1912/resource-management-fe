import type { LucideIcon } from 'lucide-react';

export type SearchTab = 'all' | 'ai' | 'advanced' | 'authors';

export interface SearchTabConfig {
  id: SearchTab;
  label: string;
  icon: LucideIcon;
  badge?: string;
  showCount?: boolean;
}

export interface SearchResourceItem {
  id: string;
  title: string;
  category: string;
  author: string;
  faculty: string;
  year: string;
  format: string;
  downloads: number;
}

export interface AuthorItem {
  name: string;
  role: string;
  dept: string;
  count: number;
}

export interface AdvancedSearchFilters {
  faculty: string;
  year: string;
  format: string;
  plagiarismRate: string;
}
