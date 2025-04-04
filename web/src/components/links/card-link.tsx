import styled from '@emotion/styled';
import { Link, To } from 'react-router-dom';

const StyledLink = styled(Link)`
  margin: 0;
  padding: 0;
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  &:hover {
    text-decoration: none;
  }
`;

interface CustomLinkProps {
  to: To;
  onClick?: () => void;
  children?: any;
}

export const CardLink: React.FC<CustomLinkProps> = ({
  to,
  children,
  onClick,
}) => {
  return (
    <StyledLink to={to} onClick={onClick}>
      {children}
    </StyledLink>
  );
};
