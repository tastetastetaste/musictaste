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
  gap: 4px;
  padding: ${(props) => (props.$size === 'md' ? '0.25em 0.75em' : '0.5em 1em')};
  font-size: ${(props) =>
    props.$size === 'md'
      ? props.theme.font.size.small
      : props.theme.font.size.body};
  font-weight: 600;
  border-radius: 4px;
  color: ${(props) => props.$colorValue};
  background-color: ${(props) => props.$colorValue}20;
  border: 1px solid ${(props) => props.$colorValue}80;
  box-shadow: 0 0 5px currentColor;

  svg {
    width: 1.2em;
    height: 1.2em;
  }
`;

const StyledIconBadge = styled.div<{ $colorValue: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.$colorValue};

  svg {
    width: 0.9em;
    height: 0.9em;
  }
`;

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = 'text',
  size = 'md',
  icon,
  className,
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

  if (size === 'sm') {
    return (
      <Tooltip content={label}>
        <StyledIconBadge $colorValue={colorValue} className={className}>
          {React.cloneElement(icon, { className: 'icon-badge-icon' })}
        </StyledIconBadge>
      </Tooltip>
    );
  }

  return (
    <StyledBadge $colorValue={colorValue} $size={size} className={className}>
      {icon && React.cloneElement(icon, { className: 'badge-icon' })}
      {label}
    </StyledBadge>
  );
};
