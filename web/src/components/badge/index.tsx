import styled from '@emotion/styled';
import React from 'react';
import { useTheme } from '@emotion/react';
import { Tooltip } from '../popover/tooltip';

interface BadgeProps {
  label: React.ReactNode;
  color?: 'text' | 'highlight' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactElement;
  className?: string;
}

const StyledBadge = styled.span<{ $colorValue: string; $size: string }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: ${(props) =>
    props.$size === 'md' ? '0.25em 0.75em' : '0.5em 0.5em'};
  font-size: ${(props) =>
    props.$size === 'md'
      ? props.theme.font.size.small
      : props.theme.font.size.body};
  font-weight: 600;
  color: ${(props) => props.$colorValue};

  svg {
    width: 26px;
  }
`;

const StyledIconBadge = styled.div<{ $colorValue: string; $size: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.$colorValue};

  svg {
    width: ${(props) => (props.$size === 'sm' ? '16px' : '22px')};
  }
`;

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = 'text',
  size = 'md',
  icon,
}) => {
  const { colors } = useTheme();

  const getColorValue = (colorName: string) => {
    switch (colorName) {
      case 'text':
        return colors.text;
      case 'highlight':
        return colors.highlight;
      case 'primary':
        return colors.primary;
      default:
        return colors.text;
    }
  };

  const colorValue = getColorValue(color);

  if (size === 'sm' || size === 'md') {
    return (
      <Tooltip content={label}>
        <StyledIconBadge $colorValue={colorValue} $size={size}>
          {icon}
        </StyledIconBadge>
      </Tooltip>
    );
  }

  return (
    <StyledBadge $colorValue={colorValue} $size={size}>
      {label}
      {icon}
    </StyledBadge>
  );
};
