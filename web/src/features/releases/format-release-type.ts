import { ReleaseTypeOptions } from '../contributions/shared';

export const formatReleaseType = (releaseType: string): string => {
  const option = ReleaseTypeOptions.find((opt) => opt.value === releaseType);
  return option ? option.label : releaseType;
};
