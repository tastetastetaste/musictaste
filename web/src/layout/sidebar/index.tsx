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
import { Sidebar } from './sidebar';
import { useAuth } from '../../features/account/useAuth';
import { Markdown } from '../../components/markdown';

const SidebarContent = ({
  closeSidebar,
  onOpenSupportDialog,
  onOpenContactDialog,
}: {
  closeSidebar: any;
  onOpenSupportDialog: any;
  onOpenContactDialog: any;
}) => {
  const { canVoteOnSubmissions } = useAuth();
  const links = [
    { to: '/', label: 'Home', exact: true },
    { to: '/releases/new', label: 'Releases', exact: false },
    { to: '/reviews/new', label: 'Reviews', exact: false },
    { to: '/lists/new', label: 'Lists', exact: false },
    { to: '/theme', label: 'Theme', exact: true },
    { to: '/contributing', label: 'Contributing', exact: true },
  ];

  if (canVoteOnSubmissions) {
    links.push({
      to: '/contributions/releases',
      label: 'Open Contributions',
      exact: true,
    });
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
          <Button onClick={onOpenSupportDialog} variant="highlight">
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
  const [openSupportDialog, setOpenSupportDialog] = useState(false);

  return (
    <Fragment>
      <IconButton onClick={() => setOpen(true)} title="sidebar">
        <IconMenu2 />
      </IconButton>
      <Sidebar isOpen={open} onClose={() => setOpen(false)} title="Menu">
        <SidebarContent
          closeSidebar={() => setOpen(false)}
          onOpenContactDialog={() => setOpenContactDialog(true)}
          onOpenSupportDialog={() => setOpenSupportDialog(true)}
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
      <Dialog
        isOpen={openSupportDialog}
        onClose={() => setOpenSupportDialog(false)}
        title="Thank you for considering supporting MusicTaste!"
      >
        <Markdown>
          {`Your donation will allow us to put more time, effort, and resources into this project. You will also be making the website better for everyone!

You will get the following for one year:
- Supporter badge
- The ability to specify custom profile theme colors that appear on your profile and in your full page reviews and lists
- More supporter only features as they are added

Donations are made through our Ko-fi page`}
        </Markdown>
        <Button
          onClick={() => window.open(KOFI_LINK, '_blank')}
          variant="highlight"
        >
          Donate
        </Button>
      </Dialog>
    </Fragment>
  );
};

export default AppSidebar;
