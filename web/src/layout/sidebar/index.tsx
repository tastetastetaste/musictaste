import {
  IconBrandDiscord,
  IconBrandInstagram,
  IconBrandX,
  IconMenu2,
} from '@tabler/icons-react';
import { Fragment, useState } from 'react';
import { Button } from '../../components/button';
import Dialog from '../../components/dialog';
import { Dropdown } from '../../components/dropdown';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { Link } from '../../components/links/link';
import { Typography } from '../../components/typography';
import {
  CONTACT_EMAIL,
  DISCORD_SERVER_INVITE,
  IG_URL,
  KOFI_LINK,
  SITE_NAME,
  TWITTER_URL,
} from '../../static/site-info';
import { themeOptions, useThemeSwitcher } from '../../theme/useTheme';
import { Sidebar } from './sidebar';

const links = [
  { to: '/', label: 'Home', exact: true },
  { to: '/releases/new', label: 'Releases', exact: false },
  { to: '/reviews/new', label: 'Reviews', exact: false },
  { to: '/lists/new', label: 'Lists', exact: false },
];

const SidebarContent = ({
  closeSidebar,
  onOpenSupportDialog,
  onOpenContactDialog,
}: {
  closeSidebar: any;
  onOpenSupportDialog: any;
  onOpenContactDialog: any;
}) => {
  const { selectedTheme, switchTheme } = useThemeSwitcher();

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
        <Dropdown
          defaultValue={selectedTheme}
          options={themeOptions.map((o) => ({ label: o, value: o }))}
          onChange={(v) => switchTheme(v.value as any)}
          placeholder="Theme"
        />

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
          </Group>
          <Button onClick={onOpenContactDialog}>Contact</Button>
          <Button onClick={onOpenSupportDialog}>Support</Button>

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
      <Sidebar isOpen={open} onClose={() => setOpen(false)}>
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
        title="Support us"
      >
        <Typography>
          You can support us by donating on Ko-fi. Your support will help us
          keep the site alive, further its development, and provide more
          resources to improve our services.
        </Typography>
        <Typography>
          Please include your username in the message box when you donate so we
          can update your supporter status. If needed, feel free to{' '}
          <Link to={`mailto:${CONTACT_EMAIL}`}>contact us</Link>!
        </Typography>
        <Button onClick={() => window.open(KOFI_LINK, '_blank')}>Donate</Button>
      </Dialog>
    </Fragment>
  );
};

export default AppSidebar;
