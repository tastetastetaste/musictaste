import { Outlet } from 'react-router-dom';
import AppPageWrapper from '../../layout/app-page-wrapper';

const AdminPageWrapper: React.FC = () => {
  const navItems = [
    { to: '/admin/pending-deletions', label: 'Pending Deletions' },
    { to: '/admin/merge-duplicates', label: 'Merge Duplicates' },
  ];

  return (
    <AppPageWrapper title="Admin" navigation={navItems} hideBackButton>
      <Outlet />
    </AppPageWrapper>
  );
};

export default AdminPageWrapper;
