import styled from '@emotion/styled';
import { IconArrowLeft, IconDots, IconQuestionMark } from '@tabler/icons-react';
import { Group } from '../../components/flex/group';
import { Navigation, NavigationLinkType } from '../../components/nav';
import { Menu, MenuItemType } from '../../components/menu';
import { CONTENT_MAX_WIDTH, CONTENT_PADDING } from './shared';
import { IconButton } from '../../components/icon-button';
import { LinkProps, useNavigate } from 'react-router-dom';

const StyledPageHeader = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 50px;
  margin-left: 10px;
  margin-right: 10px;
  width: 100%;
  padding: ${CONTENT_PADDING};
  max-width: ${CONTENT_MAX_WIDTH};
  margin: 0 auto;
`;

export type QuickActionType = {
  to?: LinkProps['to'];
  action?: () => void;
  label: string;
  icon: React.FC;
};

interface PageHeaderProps {
  navigation: NavigationLinkType[];
  quickActions?: QuickActionType[];
  menu?: MenuItemType[];
  hideBackButton?: boolean;
}

const PageHeader = ({
  navigation,
  quickActions,
  menu,
  hideBackButton,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const canGoBack = window.history.state.idx !== 0;

  return (
    <StyledPageHeader>
      <Group justify="apart">
        <Group gap="sm">
          {!hideBackButton && (
            <IconButton
              title="Back"
              onClick={() => (canGoBack ? navigate(-1) : navigate('/'))}
            >
              <IconArrowLeft />
            </IconButton>
          )}
          <div>{navigation && <Navigation links={navigation} />}</div>
        </Group>
        <Group>
          {quickActions?.map(({ icon: Icon, label, action, to }) => (
            <IconButton
              key={label}
              title={label}
              onClick={to ? () => navigate(to) : action}
            >
              <Icon />
            </IconButton>
          ))}
          {menu?.length > 0 && <Menu items={menu} toggler={<IconDots />} />}
        </Group>
      </Group>
    </StyledPageHeader>
  );
};

export default PageHeader;
