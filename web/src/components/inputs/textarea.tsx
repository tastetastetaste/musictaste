import styled from '@emotion/styled';

export const Textarea = styled.textarea<{ error?: boolean }>`
  resize: none;
  border: 0;
  border-radius: ${({ theme }) => theme.border_radius.base};
  font: inherit;
  padding: 6px 10px;
  display: block;
  width: 100%;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.background_sub};
  color: ${({ theme }) => theme.colors.text};
  &:hover,
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.primary};
    opacity: 1;
  }

  &:focus-visible {
    box-shadow: ${({ theme }) => `0 0 0 2px ${theme.colors.text}`};
  }

  ${({ error, theme }) =>
    error &&
    `
    box-shadow: 0 0 0 2px ${theme.colors.text}};
  `}
`;
