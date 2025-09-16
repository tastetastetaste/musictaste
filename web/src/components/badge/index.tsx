import styled from '@emotion/styled';
import React from 'react';
import { useTheme } from '@emotion/react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'text' | 'highlight' | 'primary';
  size?: 'small' | 'large';
  icon?: React.ReactElement;
  className?: string;
}

const StyledBadge = styled.span<{ $colorValue: string; $size: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: ${(props) =>
    props.$size === 'small' ? '0.25em 0.75em' : '0.5em 1em'};
  font-size: ${(props) =>
    props.$size === 'small'
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

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'text',
  size = 'small',
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

  return (
    <StyledBadge $colorValue={colorValue} $size={size} className={className}>
      {icon && React.cloneElement(icon, { className: 'badge-icon' })}
      {children}
    </StyledBadge>
  );
};
