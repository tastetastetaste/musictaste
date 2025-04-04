import { Helmet } from 'react-helmet';
import { Stack } from '../../components/flex/stack';
import {
  SITE_DOMAIN,
  SITE_NAME,
  TWITTER_USERNAME,
} from '../../static/site-info';
import AppHeader from './app-header';
import PageHeader from './page-header';
import { NavigationLinkType } from '../../components/nav';
import { MenuItemType } from '../../components/menu';
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
  return (
    <Stack>
      <Helmet>
        <title>{`${title ? title + ' | ' + SITE_NAME : SITE_NAME}`}</title>
        <meta name="description" content={description} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta
          name="twitter:image"
          content={
            image ? image : `https://${SITE_DOMAIN}/android-chrome-192x192.png`
          }
        />
        <meta property="twitter:image:alt" content={title} />
        <meta name="twitter:site" content={TWITTER_USERNAME} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content={
            image ? image : `https://${SITE_DOMAIN}/android-chrome-192x192.png`
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
  );
};

export default AppPageWrapper;
