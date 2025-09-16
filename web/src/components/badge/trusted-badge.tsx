import { IconShieldFilled } from '@tabler/icons-react';
import React from 'react';
import { Badge } from './index';

interface TrustedBadgeProps {
  size?: 'small' | 'large';
  className?: string;
}

export const TrustedBadge: React.FC<TrustedBadgeProps> = ({
  size = 'small',
  className,
}) => {
  return (
    <Badge
      color="primary"
      size={size}
      icon={<IconShieldFilled />}
      className={className}
    >
      {size === 'small' ? 'Trusted' : 'Trusted Contributor'}
    </Badge>
  );
};
