import styled from '@emotion/styled';
import { IconDots } from '@tabler/icons-react';
import { Group } from '../../components/flex/group';
import { Navigation, NavigationLinkType } from '../../components/nav';
import { Menu, MenuItemType } from '../../components/menu';
import { CONTENT_MAX_WIDTH, CONTENT_PADDING } from './shared';

const StyledPageHeader = styled.div`
  position: relative;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 60px;
  margin-left: 10px;
  margin-right: 10px;
  width: 100%;
  padding: ${CONTENT_PADDING};
  max-width: ${CONTENT_MAX_WIDTH};
  margin: 0 auto;
`;

interface PageHeaderProps {
  navigation: NavigationLinkType[];
  menu: MenuItemType[];
}

const PageHeader = ({ navigation, menu }: PageHeaderProps) => {
  return (
    <StyledPageHeader>
      <Group justify="apart">
        <div>{navigation && <Navigation links={navigation} />}</div>
        {menu && <Menu items={menu} toggler={<IconDots />} />}
      </Group>
    </StyledPageHeader>
  );
};

export default PageHeader;
