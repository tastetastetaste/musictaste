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
import { TextareaWithPreview } from '../../components/inputs/textarea-with-preview';
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
  onClose,
}: {
  listId: string;
  itemId: string;
  note: string;
  onUpdate: (note: string) => void;
  onClose: () => void;
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
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap="sm">
        <TextareaWithPreview
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

export const Note = ({ id, note, noteSource, listId }: any) => {
  const [openNoteEditer, setOpenNoteEditer] = useState(false);
  const [listItemNote, setListItemNote] = useState(noteSource || '');

  const onUpdate = async (note: string) => {
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
          onClose={() => setOpenNoteEditer(false)}
        />
      ) : (
        <span>{listItemNote}</span>
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
  Pick<IListItem, 'id' | 'index' | 'note' | 'noteSource'> & {
    release: IRelease;
    handleRemove: () => void;
    listId: string;
  }
> = ({ id, release, index, handleRemove, note, noteSource, listId }) => {
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
            <ArtistsLinks artists={release.artists} />
            <ReleaseTitleLink
              to={getReleasePath({ releaseId: release.id })}
              title={release.title}
              latinTitle={release.titleLatin}
            />
            <Note note={note} noteSource={noteSource} id={id} listId={listId} />
          </Stack>
        </FlexChild>
        <IconButton title="Remove" onClick={handleRemove}>
          <IconTrash />
        </IconButton>
      </Group>
    </CardContainer>
  );
};
