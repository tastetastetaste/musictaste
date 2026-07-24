import styled from '@emotion/styled';
import { IconArrowLeft, IconDots, IconLink } from '@tabler/icons-react';
import { Group } from '../../components/flex/group';
import { Navigation, NavigationLinkType } from '../../components/nav';
import { Menu, MenuItemType } from '../../components/menu';
import { CONTENT_MAX_WIDTH, CONTENT_PADDING } from '../../static/spacing';
import { IconButton } from '../../components/icon-button';
import { LinkProps, useLocation, useNavigate } from 'react-router-dom';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useEffect } from 'react';
import { SITE_URL } from '../../static/site-info';

const StyledPageHeader = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 60px;
  margin-left: 10px;
  margin-right: 10px;
  width: 100%;
  padding: ${CONTENT_PADDING};
  max-width: ${CONTENT_MAX_WIDTH};
  margin: 0 auto 12px;
`;

export type QuickActionType = {
  to?: LinkProps['to'];
  action?: () => void;
  label: string;
  icon: React.FC;
};

interface PageHeaderProps {
  title?: string;
  referenceTitle?: string;
  navigation: NavigationLinkType[];
  quickActions?: QuickActionType[];
  menu?: MenuItemType[];
  hideBackButton?: boolean;
  canCopyReference?: boolean;
  canCopyLink?: boolean;
}

const PageHeader = ({
  navigation,
  quickActions,
  menu,
  hideBackButton,
  canCopyReference,
  canCopyLink,
  title,
  referenceTitle,
}: PageHeaderProps) => {
  const navigate = useNavigate();
  const { snackbar } = useSnackbar();
  const location = useLocation();

  useEffect(() => {
    console.log(location.pathname.split('/'));
  }, [location]);

  const canGoBack = window.history.state.idx !== 0;

  const copyReference = () => {
    const path = location.pathname.split('/');

    let reference;
    if (
      path.length >= 3 &&
      ['genre', 'artist', 'label', 'release'].includes(path[1])
    ) {
      reference = `[${referenceTitle || title || location.pathname}](${path[1]}/${path[2]})`;
    } else {
      reference = `[${referenceTitle || title || location.pathname}](${location.pathname})`;
    }

    navigator.clipboard.writeText(reference);
    snackbar('Reference copied to clipboard');
  };

  const copyLink = () => {
    const link = `${SITE_URL}${location.pathname}${location.search}${location.hash}`;
    navigator.clipboard.writeText(link);
    snackbar('Link copied to clipboard');
  };

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
          <div
            css={{
              margin: '16px 0 8px',
            }}
          >
            {navigation && <Navigation links={navigation} />}
          </div>
        </Group>
        <Group gap="sm">
          {quickActions?.map(({ icon: Icon, label, action, to }) => (
            <IconButton
              key={label}
              title={label}
              onClick={to ? () => navigate(to) : action}
            >
              <Icon />
            </IconButton>
          ))}
          {canCopyReference && canCopyLink ? (
            <Menu
              items={[
                {
                  label: 'Copy Reference',
                  action: copyReference,
                },
                {
                  label: 'Copy Link',
                  action: copyLink,
                },
              ]}
              toggler={<IconLink />}
            />
          ) : canCopyReference ? (
            <IconButton title="Copy Reference" onClick={copyReference}>
              <IconLink />
            </IconButton>
          ) : canCopyLink ? (
            <IconButton title="Copy Link" onClick={copyLink}>
              <IconLink />
            </IconButton>
          ) : null}
          {menu?.length > 0 && <Menu items={menu} toggler={<IconDots />} />}
        </Group>
      </Group>
    </StyledPageHeader>
  );
};

export default PageHeader;
