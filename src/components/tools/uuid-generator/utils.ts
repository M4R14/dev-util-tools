import {
  UUID_PREVIEW_WITH_HYPHENS,
  UUID_PREVIEW_WITHOUT_HYPHENS,
} from './constants';

export const getUUIDFormatPreview = (options: { hyphens: boolean; uppercase: boolean }) => {
  const base = options.hyphens ? UUID_PREVIEW_WITH_HYPHENS : UUID_PREVIEW_WITHOUT_HYPHENS;
  return options.uppercase ? base.toUpperCase() : base;
};
