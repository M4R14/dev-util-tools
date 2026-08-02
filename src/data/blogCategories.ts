import { Bug, Rocket, Wrench, type LucideIcon } from 'lucide-react';
import type { BlogCategory } from './blogPosts';

/**
 * Shared by the post card badge and the filter chips, so a category can never be labelled one way
 * in the filter bar and another way on the card below it.
 */
export interface BlogCategoryMeta {
  label: string;
  icon: LucideIcon;
  /** Badge styling — used at rest on the card and when a filter chip is active. */
  className: string;
}

export const BLOG_CATEGORY_META: Record<BlogCategory, BlogCategoryMeta> = {
  release: {
    label: 'Release',
    icon: Rocket,
    className: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20',
  },
  improvement: {
    label: 'Improvement',
    icon: Wrench,
    className: 'text-sky-700 bg-sky-500/10 border-sky-500/20',
  },
  fix: {
    label: 'Fix',
    icon: Bug,
    className: 'text-amber-700 bg-amber-500/10 border-amber-500/20',
  },
};

export const BLOG_CATEGORY_ORDER: BlogCategory[] = ['release', 'improvement', 'fix'];
