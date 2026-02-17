import styled from '@emotion/styled';
import React, { forwardRef } from 'react';
import { Group } from '../flex/group';

const Button = styled.button<{ $active?: boolean; $danger?: boolean }>`
  padding: 6px;
  display: flex;
  align-items: center;
  background: transparent;
  font-family: inherit;
  color: ${({ theme, $active, $danger }) =>
    $danger
      ? theme.colors.error
      : $active
        ? theme.colors.highlight
        : theme.colors.primary};
  cursor: pointer;
  &:hover {
    color: ${({ theme, $active }) =>
      $active ? theme.colors.highlight : theme.colors.text};
  }
  &:disabled {
    opacity: 0.5;
    color: ${({ theme, $active, $danger }) =>
      $danger
        ? theme.colors.error
        : $active
          ? theme.colors.highlight
          : theme.colors.primary};
    cursor: not-allowed;
  }
`;

const SolidButton = styled(Button)<{ $active?: boolean; $danger?: boolean }>`
  padding: 8px;
  font-family: inherit;
  border-radius: ${({ theme }) => theme.border_radius.base};
  background-color: ${({ theme, $active, $danger }) =>
    $danger
      ? theme.colors.error
      : $active
        ? theme.colors.highlight
        : theme.colors.background_sub};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.background : theme.colors.text};
  svg {
    color: ${({ theme, $active }) =>
      $active ? theme.colors.background : theme.colors.text};
  }
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
    svg {
      color: ${({ theme }) => theme.colors.text};
    }
  }
  &:active {
    background-color: ${({ theme, $active, $danger }) =>
      $danger
        ? theme.colors.error
        : $active
          ? theme.colors.highlight
          : theme.colors.background_sub};
  }
`;

const Text = styled.span<{ $active: boolean }>`
  color: inherit;
`;

export interface IconButtonProps {
  title: string;
  children: React.ReactElement;
  num?: number; // number of likes, comments, upvotes, etc.
  active?: boolean;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'solid';
}

export const IconButton = forwardRef(
  (
    {
      num,
      active,
      title,
      children,
      onClick,
      danger,
      disabled,
      variant = 'default',
    }: IconButtonProps,
    ref,
  ) => {
    const ButtonComponent = variant === 'solid' ? SolidButton : Button;

    return (
      <ButtonComponent
        $active={active}
        title={title}
        onClick={onClick}
        $danger={danger}
        disabled={disabled}
        ref={ref as any}
        type="button"
      >
        <Group gap="sm">
          {children}
          {typeof num === 'number' && <Text $active={active}>{num}</Text>}
        </Group>
      </ButtonComponent>
    );
  },
);
