import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { Stack } from '../../components/flex/stack';
import { MenuItemType } from '../../components/menu';
import { NavigationLinkType } from '../../components/nav';
import {
  SITE_DOMAIN,
  SITE_NAME,
  TWITTER_USERNAME,
} from '../../static/site-info';
import AppHeader from './app-header';
import PageHeader from './page-header';
import { CONTENT_MAX_WIDTH, CONTENT_PADDING } from './shared';

interface props {
  title?: string;
  navigation?: NavigationLinkType[];
  menu?: MenuItemType[];
  image?: string;
  description?: string;
  children: JSX.Element | JSX.Element[];
}

const AppPageWrapper: React.FC<props> = ({
  title,
  navigation,
  children,
  menu,
  description,
  image,
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
          <link
            rel="canonical"
            href={`https://${SITE_DOMAIN}${location.pathname}`}
          />

          {/* Twitter Card data */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content={TWITTER_USERNAME} />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta
            name="twitter:image"
            content={
              image
                ? image
                : `https://${SITE_DOMAIN}/android-chrome-192x192.png`
            }
          />
          <meta property="twitter:image:alt" content={title} />

          {/* Open Graph data */}
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:type" content="website" />
          <meta
            property="og:url"
            content={`https://${SITE_DOMAIN}${location.pathname}`}
          />
          <meta
            property="og:image"
            content={
              image
                ? image
                : `https://${SITE_DOMAIN}/android-chrome-192x192.png`
            }
          />
          <meta property="og:site_name" content={SITE_NAME} />
        </Helmet>
        <AppHeader />
        <PageHeader navigation={navigation} menu={menu} />
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
