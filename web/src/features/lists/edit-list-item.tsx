import { IconMessage, IconTrash } from '@tabler/icons-react';
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  getReleasePath,
  IListItem,
  IListItemsResponse,
  IRelease,
} from 'shared';
import { Button } from '../../components/button';
import { CardContainer } from '../../components/containers/card-container';
import { FlexChild } from '../../components/flex/flex-child';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { Typography } from '../../components/typography';
import { api } from '../../utils/api';
import {
  ArtistsLinks,
  ReleaseImageLink,
  ReleaseTitleLink,
} from '../releases/release/shared';
import { Markdown } from '../../components/markdown';
import { Textarea } from '../../components/inputs/textarea';

const EditNoteForm = ({
  listId,
  itemId,
  note,
  onClose,
}: {
  listId: string;
  itemId: string;
  note: string;
  onClose: () => void;
}) => {
  const { handleSubmit, register } = useForm();
  const qc = useQueryClient();

  const { mutateAsync, isLoading } = useMutation(api.editListItem, {
    onSuccess: (_, variables) => {
      qc.setQueriesData<InfiniteData<IListItemsResponse>>(
        ['list', listId, 'items'],
        (oldData) => {
          if (!oldData || !oldData.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === variables.itemId
                  ? { ...item, note: variables.note }
                  : item,
              ),
            })),
          };
        },
      );
    },
  });

  const submit = async (data: { note: string }) => {
    await mutateAsync({
      id: listId,
      itemId,
      note: data.note,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap="sm">
        <Textarea
          defaultValue={note}
          placeholder="Description..."
          {...register('note')}
          rows={5}
        />
        <Group gap="sm">
          <Button type="submit" disabled={isLoading}>
            save
          </Button>
          <Button variant="text" onClick={onClose}>
            cancel
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export const Note = ({
  id,
  note,
  listId,
}: {
  id: string;
  note?: string;
  listId: string;
}) => {
  const [openNoteEditer, setOpenNoteEditer] = useState(false);

  return (
    <Fragment>
      {openNoteEditer ? (
        <EditNoteForm
          itemId={id}
          listId={listId}
          note={note || ''}
          onClose={() => setOpenNoteEditer(false)}
        />
      ) : (
        <Markdown>{note}</Markdown>
      )}

      {!openNoteEditer ? (
        <div>
          <IconButton
            title="Add/Edit Note"
            onClick={() => setOpenNoteEditer(!openNoteEditer)}
          >
            <IconMessage />
          </IconButton>
        </div>
      ) : null}
    </Fragment>
  );
};

export const EditListItem: React.FC<
  Pick<IListItem, 'id' | 'index' | 'note'> & {
    release: IRelease;
    handleRemove: () => void;
    listId: string;
  }
> = ({ id, release, index, handleRemove, note, listId }) => {
  return (
    <CardContainer>
      <Group gap="md" justify="apart">
        <FlexChild basis="50px">
          <Group justify="center">
            <Typography size="title-lg">{index + 1}</Typography>
          </Group>
        </FlexChild>
        <FlexChild basis="100px">
          <ReleaseImageLink release={release} size="xs" />
        </FlexChild>
        <FlexChild grow shrink>
          <Stack gap="sm">
            <ArtistsLinks artists={release.artists} truncate />
            <ReleaseTitleLink
              to={getReleasePath({ releaseId: release.id })}
              title={release.title}
              latinTitle={release.titleLatin}
            />
            <Note note={note} id={id} listId={listId} />
          </Stack>
        </FlexChild>
        <IconButton title="Remove" onClick={handleRemove}>
          <IconTrash />
        </IconButton>
      </Group>
    </CardContainer>
  );
};
