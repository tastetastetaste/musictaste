import { IconMessage, IconTrash } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getReleasePath, IListItem, IRelease } from 'shared';
import { Button } from '../../components/button';
import { CardContainer } from '../../components/containers/card-container';
import { FlexChild } from '../../components/flex/flex-child';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { Textarea } from '../../components/inputs/textarea';
import { Typography } from '../../components/typography';
import { api } from '../../utils/api';
import {
  ArtistsLinks,
  ReleaseImageLink,
  ReleaseTitleLink,
} from '../releases/release/shared';

const EditNoteForm = ({
  listId,
  itemId,
  note,
  onUpdate,
}: {
  listId: string;
  itemId: string;
  note: string;
  onUpdate: (note: string) => void;
}) => {
  const { handleSubmit, register } = useForm();

  const { mutateAsync, isLoading } = useMutation(api.editListItem);

  const submit = async (data: { note: string }) => {
    await mutateAsync({
      id: listId,
      itemId,
      note: data.note,
    });
    onUpdate(data.note);
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap="sm">
        <Textarea
          defaultValue={note}
          placeholder="Description..."
          {...register('note')}
        />
        <Button type="submit" disabled={isLoading}>
          save
        </Button>
      </Stack>
    </form>
  );
};

export const Note = ({ id, note, listId }: any) => {
  const [openNoteEditer, setOpenNoteEditer] = useState(false);
  const [listItemNote, setListItemNote] = useState(note);

  const onUpdate = async (note: string) => {
    setOpenNoteEditer(false);
    setListItemNote(note);
  };

  return (
    <Fragment>
      {openNoteEditer ? (
        <EditNoteForm
          itemId={id}
          listId={listId}
          note={listItemNote}
          onUpdate={onUpdate}
        />
      ) : (
        <span>{listItemNote}</span>
      )}
      <IconButton
        title="Add/Edit Note"
        onClick={() => setOpenNoteEditer(!openNoteEditer)}
      >
        <IconMessage />
      </IconButton>
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
      <Group gap="sm">
        <FlexChild grow shrink>
          <Group gap="sm">
            <Typography size="title-lg">{index + 1}</Typography>
            <ReleaseImageLink release={release} size="xs" />
            <FlexChild grow shrink>
              <Stack gap="sm">
                <ArtistsLinks artists={release.artists} />
                <ReleaseTitleLink
                  to={getReleasePath({ releaseId: release.id })}
                  title={release.title}
                  latinTitle={release.titleLatin}
                />
                <Note note={note} id={id} listId={listId} />
              </Stack>
            </FlexChild>
          </Group>
        </FlexChild>

        <IconButton title="Remove" onClick={handleRemove}>
          <IconTrash />
        </IconButton>
      </Group>
    </CardContainer>
  );
};
