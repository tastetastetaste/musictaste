import { useOutletContext } from 'react-router-dom';
import { Fragment, useState } from 'react';
import { Button } from '../../components/button';
import { Group } from '../../components/flex/group';
import { CreateListDialog } from '../lists/create-list-dialog';
import { UserPageOutletContext } from './user-page-wrapper';
import Lists from '../lists/lists-list-renderer';

const UserListsPage = () => {
  const { isUserMyself, user } = useOutletContext<UserPageOutletContext>();

  const [openCreateListDialog, setOpenCreateListDialog] = useState(false);

  return (
    <div>
      {isUserMyself && (
        <Group>
          <Button onClick={() => setOpenCreateListDialog(true)}>
            Create List
          </Button>
        </Group>
      )}
      <Lists userId={user.id} />
      <CreateListDialog
        isOpen={openCreateListDialog}
        onClose={() => setOpenCreateListDialog(false)}
      />
    </div>
  );
};

export default UserListsPage;
