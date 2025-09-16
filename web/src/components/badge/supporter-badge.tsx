import { IconHeartFilled } from '@tabler/icons-react';
import React from 'react';
import { Badge } from './index';

interface SupporterBadgeProps {
  size?: 'small' | 'large';
  className?: string;
}

export const SupporterBadge: React.FC<SupporterBadgeProps> = ({
  size = 'small',
  className,
}) => {
  return (
    <Badge
      color="highlight"
      size={size}
      icon={<IconHeartFilled />}
      className={className}
    >
      Supporter
    </Badge>
  );
};
