import { UserRelease } from '../../db/entities/user-release.entity';
import {
  IEntry,
  IEntryWithReview,
  IRelease,
  IReview,
  IUserSummary,
} from 'shared';

export function mapEntries(
  entries: UserRelease[],
  {
    releases,
    users,
    reviews,
  }: {
    releases?: IRelease[] | null;
    users?: IUserSummary[] | null;
    reviews?: IReview[] | null;
  },
): (IEntry | IEntryWithReview)[] {
  const releasesMap = new Map<string, IRelease>();
  if (releases) for (const r of releases) if (r) releasesMap.set(r.id, r);

  const usersMap = new Map<string, IUserSummary>();
  if (users) for (const u of users) if (u) usersMap.set(u.id, u);

  const reviewsMap = new Map<string, IReview>();
  if (reviews) for (const r of reviews) if (r) reviewsMap.set(r.id, r);

  const mapped: (IEntry | IEntryWithReview)[] = [];

  for (const ur of entries) {
    if (!ur) continue;

    const release = releasesMap.get(ur.releaseId) || null;
    const user = usersMap.get(ur.userId) || null;

    if (reviews) {
      if (!ur.reviewId) continue;
      const review = reviewsMap.get(ur.reviewId);
      if (!review) continue;

      mapped.push({
        ...ur,
        release,
        user,
        review,
      });
    } else {
      mapped.push({
        ...ur,
        release,
        user,
      });
    }
  }

  return mapped;
}
