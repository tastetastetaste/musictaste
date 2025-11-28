import {
  IconHeartFilled,
  IconPuzzleFilled,
  IconShieldCheckFilled,
} from '@tabler/icons-react';
import React from 'react';
import { Badge } from './index';

interface TrustedContributorBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

export const TrustedContributorBadge: React.FC<
  TrustedContributorBadgeProps
> = ({ size = 'md' }) => {
  return (
    <Badge
      color="primary"
      size={size}
      icon={<IconHeartFilled />}
      label="Trusted"
    />
  );
};
