import { ContributorStatus, SupporterStatus } from 'shared';
import { TrustedContributorBadge } from '../../components/badge/trusted-contributor-badge';
import { SupporterBadge } from '../../components/badge/supporter-badge';

interface UserBadgesProps {
  user: {
    contributorStatus: ContributorStatus;
    supporter: SupporterStatus;
  };
  size?: 'sm' | 'md' | 'lg';
}

export const UserBadges: React.FC<UserBadgesProps> = ({
  user,
  size = 'md',
}) => {
  return [
    user.contributorStatus === ContributorStatus.TRUSTED_CONTRIBUTOR ? (
      <TrustedContributorBadge size={size} key={0} />
    ) : null,
    user.supporter >= SupporterStatus.SUPPORTER ? (
      <SupporterBadge size={size} key={1} />
    ) : null,
  ];
};
