import styled from '@emotion/styled';
import { Link as ReactRouterLink } from 'react-router-dom';

interface LinkProps {
  size?: 'title-lg' | 'title' | 'body' | 'small';
  whiteSpace?: 'normal' | 'pre-wrap' | 'nowrap';
}

export const Link = styled(ReactRouterLink)<LinkProps>`
  cursor: pointer;
  overflow: hidden;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.primary};

  font-size: ${({ theme, size }) =>
    size === 'title-lg'
      ? theme.font.size.title_lg
      : size === 'title'
        ? theme.font.size.title
        : size === 'small'
          ? theme.font.size.small
          : theme.font.size.body};

  font-weight: ${({ theme, size }) =>
    size === 'title-lg' || size === 'title'
      ? theme.font.weight.bold
      : theme.font.weight.normal};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
  &:active {
    color: ${({ theme }) => theme.colors.primary};
  }
  white-space: ${({ whiteSpace }) => whiteSpace || 'normal'};
`;
