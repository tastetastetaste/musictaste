import { IconSearch } from '@tabler/icons-react';
import { forwardRef, InputHTMLAttributes } from 'react';
import styled from '@emotion/styled';

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.border_radius.base};
  background-color: ${({ theme }) => theme.colors.complement};
  color: ${({ theme }) => theme.colors.text};
  padding: 6px 10px;

  &:hover,
  &:focus-within {
    outline: none;
  }

  &:focus-within {
    box-shadow: ${({ theme }) => `0 0 0 2px ${theme.colors.text}`};
  }
`;
const StyledInput = styled.input`
  outline: none;
  border: 0;
  font: inherit;
  width: 100%;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  &::placeholder {
    color: ${({ theme }) => theme.colors.main};
    opacity: 1;
  }
  &:focus-visible {
    box-shadow: none;
  }
`;

const SearchIcon = styled(IconSearch)`
  margin-right: 8px;
  color: ${({ theme }) => theme.colors.main};
`;

export const SearchInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ ...props }, ref) => (
  <SearchInputWrapper>
    <SearchIcon />
    <StyledInput ref={ref} {...props} />
  </SearchInputWrapper>
));
