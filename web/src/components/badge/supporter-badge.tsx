import { IconRosetteDiscountCheckFilled } from '@tabler/icons-react';
import React from 'react';
import { Badge } from './index';

interface SupporterBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

export const SupporterBadge: React.FC<SupporterBadgeProps> = ({
  size = 'md',
}) => {
  return (
    <Badge
      color="highlight"
      size={size}
      icon={<IconRosetteDiscountCheckFilled />}
      label="Supporter"
    />
  );
};
