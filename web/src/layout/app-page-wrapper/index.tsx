import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { Stack } from '../../components/flex/stack';
import { MenuItemType } from '../../components/menu';
import { NavigationLinkType } from '../../components/nav';
import {
  SITE_FULL_URL,
  SITE_NAME,
  TWITTER_USERNAME,
} from '../../static/site-info';
import AppHeader from './app-header';
import PageHeader, { QuickActionType } from './page-header';
import { CONTENT_MAX_WIDTH, CONTENT_PADDING } from '../../static/spacing';

interface props {
  title?: string;
  navigation?: NavigationLinkType[];
  menu?: MenuItemType[];
  quickActions?: QuickActionType[];
  image?: string;
  description?: string;
  children: JSX.Element | JSX.Element[];
  hideBackButton?: boolean;
  canCopyReference?: boolean;
  canCopyLink?: boolean;
}

const AppPageWrapper: React.FC<props> = ({
  title,
  navigation,
  children,
  menu,
  quickActions,
  description,
  image,
  hideBackButton,
  canCopyReference,
  canCopyLink,
}) => {
  const location = useLocation();

  return (
    <div
      css={(theme) => ({
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        minHeight: '100vh',
        paddingBottom: '50px',
      })}
    >
      <Stack>
        <Helmet>
          <title>{`${title ? title + ' | ' + SITE_NAME : SITE_NAME}`}</title>
          <meta name="description" content={description} />
          <link rel="canonical" href={`${SITE_FULL_URL}${location.pathname}`} />

          {/* Twitter Card data */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content={TWITTER_USERNAME} />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta
            name="twitter:image"
            content={
              image ? image : `${SITE_FULL_URL}/android-chrome-192x192.png`
            }
          />
          <meta property="twitter:image:alt" content={title} />

          {/* Open Graph data */}
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:type" content="website" />
          <meta
            property="og:url"
            content={`${SITE_FULL_URL}${location.pathname}`}
          />
          <meta
            property="og:image"
            content={
              image ? image : `${SITE_FULL_URL}/android-chrome-192x192.png`
            }
          />
          <meta property="og:site_name" content={SITE_NAME} />
        </Helmet>
        <AppHeader />
        <PageHeader
          title={title}
          navigation={navigation}
          menu={menu}
          quickActions={quickActions}
          hideBackButton={hideBackButton}
          canCopyReference={canCopyReference}
          canCopyLink={canCopyLink}
        />
        <div
          css={{
            height: '100%',
            maxWidth: '100%',
            width: CONTENT_MAX_WIDTH,
            padding: CONTENT_PADDING,
            margin: '0 auto',
          }}
        >
          {children}
        </div>
      </Stack>
    </div>
  );
};

export default AppPageWrapper;
