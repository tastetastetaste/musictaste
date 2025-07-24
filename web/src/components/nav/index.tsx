import styled from '@emotion/styled';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { Group } from '../flex/group';

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &.active {
    color: ${({ theme }) => theme.colors.highlight};
  }
`;

const NavContainer = styled.div`
  padding: 10px;
  margin: 10px 0;
  background: ${({ theme }) => theme.colors.background_sub};
  border-radius: ${({ theme }) => theme.border_radius.base};
`;

export type NavigationLinkType = {
  to: NavLinkProps['to'];
  asPath?: string;
  label: string;
  count?: number;
};

export interface NavigationProps {
  links: NavigationLinkType[];
}

export const Navigation: React.FC<NavigationProps> = ({ links }) => {
  return (
    <NavContainer>
      <Group gap="lg" wrap>
        {links &&
          links.map(({ label, to, count }) => (
            <StyledNavLink
              key={label}
              to={to}
              replace={true}
              preventScrollReset={true}
              end
            >
              <Group gap="sm">
                <span>{label}</span>
                {count && <span>{count}</span>}
              </Group>
            </StyledNavLink>
          ))}
      </Group>
    </NavContainer>
  );
};
