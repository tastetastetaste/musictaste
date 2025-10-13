import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { useAuth } from '../account/useAuth';

const DeleteList = ({ list, closeDialog }: any) => {
  const navigate = useNavigate();

  const { me } = useAuth();

  const qc = useQueryClient();

  const { mutateAsync, isLoading } = useMutation(api.deleteList, {
    onSettled: () => qc.invalidateQueries(cacheKeys.userListsKey(me.id)),
  });

  const submit = async () => {
    await mutateAsync(list.id);
    closeDialog();
    navigate(-1);
  };

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        <Stack gap="sm">
          <span>Are you sure you want to delete your list?</span>
          <Group gap="sm">
            <Button variant="main" onClick={submit} danger>
              Delete
            </Button>
            <Button variant="main" onClick={closeDialog}>
              Cancel
            </Button>
          </Group>
        </Stack>
      )}
    </div>
  );
};

const DeleteListDialog = ({ list, IsOpen, close }: any) => {
  return (
    <Dialog isOpen={IsOpen} onClose={close} title="Delete List">
      <DeleteList list={list} closeDialog={close} />
    </Dialog>
  );
};

export default DeleteListDialog;
