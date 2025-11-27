import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandX,
  IconMenu2,
} from '@tabler/icons-react';
import { Fragment, useState } from 'react';
import { Button } from '../../components/button';
import Dialog from '../../components/dialog';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { Link } from '../../components/links/link';
import { Typography } from '../../components/typography';
import {
  CONTACT_EMAIL,
  DISCORD_SERVER_INVITE,
  GITHUB_URL,
  IG_URL,
  KOFI_LINK,
  SITE_NAME,
  TWITTER_URL,
} from '../../static/site-info';
import { Sidebar } from '../../components/sidebar';
import { useAuth } from '../../features/account/useAuth';
import { Markdown } from '../../components/markdown';
import { useNavigate } from 'react-router-dom';

const SidebarContent = ({
  closeSidebar,
  onOpenContactDialog,
}: {
  closeSidebar: any;
  onOpenContactDialog: any;
}) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/', label: 'Home', exact: true },
    { to: '/releases/new', label: 'Releases', exact: false },
    { to: '/reviews/new', label: 'Reviews', exact: false },
    { to: '/lists/new', label: 'Lists', exact: false },
    { to: '/genres', label: 'Genres', exact: true },
    { to: '/theme', label: 'Theme', exact: true },
  ];

  if (isLoggedIn) {
    links.push(
      ...[
        { to: '/contributing', label: 'Contributing Guide', exact: true },
        {
          to: '/contributions/releases',
          label: 'Open Contributions',
          exact: true,
        },
        { to: '/rules', label: 'Rules', exact: true },
      ],
    );
  }
  return (
    <Fragment>
      <Stack justify="apart">
        <Stack gap={10}>
          {links.map((link) => (
            <Link to={link.to} key={link.label} onClick={closeSidebar}>
              {link.label}
            </Link>
          ))}
        </Stack>

        <Stack gap={10}>
          <Group gap="lg" align="center" justify="center">
            <IconButton
              title="Discord"
              onClick={() => window.open(DISCORD_SERVER_INVITE, '_blank')}
            >
              <IconBrandDiscord />
            </IconButton>
            <IconButton
              title="Twitter / X"
              onClick={() => window.open(TWITTER_URL, '_blank')}
            >
              <IconBrandX />
            </IconButton>
            <IconButton
              title="Instagram"
              onClick={() => window.open(IG_URL, '_blank')}
            >
              <IconBrandInstagram />
            </IconButton>
            <IconButton
              title="GitHub"
              onClick={() => window.open(GITHUB_URL, '_blank')}
            >
              <IconBrandGithub />
            </IconButton>
          </Group>
          <Button onClick={onOpenContactDialog}>Contact</Button>
          <Button onClick={() => navigate('/support-us')} variant="highlight">
            Support us
          </Button>

          <Typography size="small">
            <Link to="/legal/terms" size="small">
              Terms
            </Link>
            {' · '}
            <Link to="/legal/privacy" size="small">
              Privacy
            </Link>
            {' · '}
            <span>
              ©{new Date().getFullYear()} {SITE_NAME}
            </span>
          </Typography>
        </Stack>
      </Stack>
    </Fragment>
  );
};

const AppSidebar = () => {
  const [open, setOpen] = useState(false);
  const [openContactDialog, setOpenContactDialog] = useState(false);

  return (
    <Fragment>
      <IconButton onClick={() => setOpen(true)} title="sidebar">
        <IconMenu2 />
      </IconButton>
      <Sidebar isOpen={open} onClose={() => setOpen(false)} title="Menu">
        <SidebarContent
          closeSidebar={() => setOpen(false)}
          onOpenContactDialog={() => setOpenContactDialog(true)}
        />
      </Sidebar>
      <Dialog
        isOpen={openContactDialog}
        onClose={() => setOpenContactDialog(false)}
        title="Contact us"
      >
        Feel free to contact us with any feedback, bug reports, or questions.
        We're always happy to hear from you!
        <Button onClick={() => window.open(`mailto:${CONTACT_EMAIL}`)}>
          {CONTACT_EMAIL}
        </Button>
      </Dialog>
    </Fragment>
  );
};

export default AppSidebar;
