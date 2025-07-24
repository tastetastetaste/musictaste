import styled from '@emotion/styled';

interface TypographyProps {
  size?: 'title-xl' | 'title-lg' | 'title' | 'body' | 'small';
  color?: 'main' | 'sub' | 'error' | 'bg' | 'inherit';
  whiteSpace?: 'normal' | 'pre-wrap' | 'nowrap';
  ellipsis?: boolean;
}

export const Typography = styled.span<TypographyProps>`
  font-size: ${({ theme, size }) =>
    size === 'title-xl'
      ? theme.font.size.title_xl
      : size === 'title-lg'
        ? theme.font.size.title_lg
        : size === 'title'
          ? theme.font.size.title
          : size === 'small'
            ? theme.font.size.small
            : theme.font.size.body};
  color: ${({ theme, color }) =>
    color === 'error'
      ? theme.colors.error
      : color === 'sub'
        ? theme.colors.text_sub
        : color === 'bg'
          ? theme.colors.background
          : color === 'inherit'
            ? 'inherit'
            : theme.colors.text};
  font-weight: ${({ theme, size }) =>
    size === 'title-xl'
      ? theme.font.weight.bolder
      : size === 'title-lg' || size === 'title'
        ? theme.font.weight.bold
        : theme.font.weight.normal};
  display: block;
  white-space: ${({ whiteSpace }) => whiteSpace || 'normal'};
  word-break: break-word;
  overflow-wrap: anywhere;
`;
