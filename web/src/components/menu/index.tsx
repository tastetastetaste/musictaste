import styled from '@emotion/styled';
import React, { useState } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { Group } from '../flex/group';
import { IconButton } from '../icon-button';
import { Popover } from '../popover';
import { Stack } from '../flex/stack';

const MenuItemContainer = styled.div`
  width: 100%;
  border-radius: ${({ theme }) => theme.border_radius.base};
  background: transparent;
  color: inherit;

  &:hover {
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.base};
  }

  a {
    cursor: pointer;
    text-decoration: none;
    width: 100%;
    height: 40px;
    color: inherit;
    font-size: inherit;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 0 10px;
  }

  button {
    cursor: pointer;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 0;
    width: 100%;
    height: 40px;
    color: inherit;
    background: none;
    font-size: inherit;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 0 10px;
  }
`;

export type MenuItemType = {
  to?: LinkProps['to'];
  action?: () => void;
  label: string;
  icon?: React.FC;
};

export interface MenuProps {
  toggler?: JSX.Element;
  items: MenuItemType[];
}

const MenuItem: React.FC<MenuItemType> = ({
  label,
  action,
  icon: Icon,
  to,
}) => {
  return (
    <MenuItemContainer>
      {to && (
        <Link to={to}>
          <Group gap="sm">
            {Icon && <Icon />}
            <span>{label}</span>
          </Group>
        </Link>
      )}
      {action && (
        <button onClick={() => action()}>
          <Group gap="sm">
            {Icon && <Icon />}
            <span>{label}</span>
          </Group>
        </button>
      )}
    </MenuItemContainer>
  );
};

export const Menu: React.FC<MenuProps> = ({ toggler, items }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      content={
        <Stack>
          {items.map((item) => (
            <MenuItem key={item.label} {...item} />
          ))}
        </Stack>
      }
    >
      <div
        css={{
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconButton title="Menu" onClick={() => setOpen(!open)}>
          {toggler}
        </IconButton>
      </div>
    </Popover>
  );
};
