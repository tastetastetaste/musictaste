import { IconCarambolaFilled, IconHeartFilled } from '@tabler/icons-react';
import React from 'react';
import { Badge } from './index';

interface SupporterBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SupporterBadge: React.FC<SupporterBadgeProps> = ({
  size = 'md',
  className,
}) => {
  return (
    <Badge
      color="highlight"
      size={size}
      icon={<IconHeartFilled />}
      label="Supporter"
      className={className}
    />
  );
};
