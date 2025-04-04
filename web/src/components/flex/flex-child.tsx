import styled from '@emotion/styled';

interface FlexChildProps {
  grow?: boolean | number;
  shrink?: boolean | number;
  basis?: string;
  align?: 'flex-start' | 'center' | 'flex-end';
  order?: number;
}

export const FlexChild = styled.div<FlexChildProps>`
  flex-grow: ${({ grow }) => (typeof grow === 'number' ? grow : grow ? 1 : 0)};
  flex-shrink: ${({ shrink }) =>
    typeof shrink === 'number' ? shrink : shrink ? 1 : 0};
  flex-basis: ${({ basis }) => (basis ? basis : 0)};
  align-self: ${({ align }) => align};
  order: ${({ order }) => (order ? order : undefined)};
  max-width: 100%;
`;
