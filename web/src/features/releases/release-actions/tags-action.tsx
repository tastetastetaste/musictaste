import styled from '@emotion/styled';
import { IconPencil, IconPlus, IconTags } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IEntryTag } from 'shared';
import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { Group } from '../../../components/flex/group';
import { Stack } from '../../../components/flex/stack';
import { IconButton } from '../../../components/icon-button';
import { Input } from '../../../components/inputs/input';
import { Loading } from '../../../components/loading';
import { Popover } from '../../../components/popover';
import { api } from '../../../utils/api';
import { cacheKeys } from '../../../utils/cache-keys';
import { useAuth } from '../../account/useAuth';
import { useReleaseActions } from './useReleaseActions';

const StyledTagButton = styled.button<{ $active: boolean }>`
  border-radius: ${({ theme }) => theme.border_radius.base};
  border: none;
  text-decoration: none;
  cursor: pointer;
  padding: 6px;
  margin: 0;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.highlight : theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  &:hover {
    background-color: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.background};
  }
  &:active {
    background-color: ${({ theme, $active }) =>
      $active ? theme.colors.highlight : theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
  }
`;

const Tag = ({
  tag,
  active,
  toggleActive,
  onEditTag,
}: {
  tag: string;
  active: boolean;
  toggleActive: () => any;
  onEditTag: () => any;
}) => {
  return (
    <Group>
      <StyledTagButton $active={active} onClick={toggleActive}>
        {tag}
      </StyledTagButton>
      <IconButton title="Edit" onClick={() => onEditTag()}>
        <IconPencil />
      </IconButton>
    </Group>
  );
};

const CreateTagDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { mutateAsync: createTagMu, isLoading } = useMutation(
    api.createUserTag,
  );

  const { handleSubmit, register } = useForm();

  const submit = async (data) => {
    await createTagMu(data.tag);
    onClose();
  };

  return (
    <Dialog title="Create Tag" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(submit)}>
        <Stack gap="sm">
          <Input {...register('tag', { required: true })} placeholder="tag" />
          <Button type="submit" disabled={isLoading}>
            Submit
          </Button>
        </Stack>
      </form>
    </Dialog>
  );
};

const UpdateTagDialog = ({
  isOpen,
  onClose,
  tag,
}: {
  isOpen: boolean;
  onClose: () => void;
  tag?: IEntryTag;
}) => {
  const { mutateAsync: updateTagMu, isLoading: isUpdateLoading } = useMutation(
    api.updateUserTag,
  );
  const { mutateAsync: deleteTagMu, isLoading: isDeleteLoading } = useMutation(
    api.deleteUserTag,
  );

  const { handleSubmit, register } = useForm();

  const submit = async (data) => {
    await updateTagMu({ tagId: tag.id, tag: data.tag });
    onClose();
  };

  const handleRemove = async () => {
    await deleteTagMu(tag.id);
    onClose();
  };

  const isLoading = isUpdateLoading || isDeleteLoading;

  if (!tag) {
    return null;
  }

  return (
    <Dialog title="Update Tag" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(submit)}>
        <Stack gap="sm">
          <Input
            {...register('tag')}
            placeholder="tag"
            defaultValue={tag.tag}
          />
          <Button type="submit" disabled={isLoading}>
            Save
          </Button>
          <Group justify="end">
            <Button
              onClick={handleRemove}
              variant="text"
              danger
              disabled={isLoading}
            >
              Remove
            </Button>
          </Group>
        </Stack>
      </form>
    </Dialog>
  );
};

const PopoverContent = ({
  tags,
  tagsAction,
  onOpenCreateTag,
  onOpenEditTag,
}: {
  tags?: IEntryTag[] | null;
  tagsAction: (ids?: string[]) => Promise<any>;
  onOpenCreateTag: any;
  onOpenEditTag: (tag: IEntryTag) => void;
}) => {
  const { me } = useAuth();

  const { data, isLoading } = useQuery(cacheKeys.userTagsKey(me!.id), () =>
    api.getUserTags(me!.id),
  );

  const [activeTags, setActiveTags] = useState<string[]>(
    tags?.map((t) => t.id) || [],
  );

  const toggleActive = (tagId: string) => {
    if (activeTags.some((t) => t === tagId)) {
      const arr = activeTags.filter((t) => t !== tagId);
      setActiveTags(arr);
      tagsAction(arr);
    } else {
      const arr = [...activeTags, tagId];
      setActiveTags(arr);
      tagsAction(arr);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Group gap={10} wrap>
        {data &&
          data.map((tag) => (
            <Tag
              key={tag.id}
              tag={tag.tag}
              active={activeTags.some((t) => t === tag.id)}
              toggleActive={() => toggleActive(tag.id)}
              onEditTag={() => onOpenEditTag({ id: tag.id, tag: tag.tag })}
            />
          ))}
        <IconButton title="Create Tag" onClick={onOpenCreateTag}>
          <IconPlus />
        </IconButton>
      </Group>
    </div>
  );
};

export const TagsAction = ({ releaseId }: { releaseId: string }) => {
  const { me } = useAuth();
  const qc = useQueryClient();
  const [openCreateTag, setOpenCreateTag] = useState<boolean>(false);
  const [openEditTag, setOpenEditTag] = useState<IEntryTag>();
  const [open, setOpen] = useState(false);
  const { tagsAction, entry } = useReleaseActions(releaseId);
  const updateCache = () => {
    qc.refetchQueries(cacheKeys.userTagsKey(me!.id));
  };
  return (
    <Fragment>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        content={
          <PopoverContent
            tags={entry?.tags}
            tagsAction={tagsAction}
            onOpenCreateTag={() => setOpenCreateTag(true)}
            onOpenEditTag={(tag) => setOpenEditTag(tag)}
          />
        }
      >
        <IconButton
          title="Tags"
          onClick={() => setOpen(!open)}
          variant="solid"
          active={entry?.tags && entry.tags.length > 0}
        >
          <IconTags />
        </IconButton>
      </Popover>
      <CreateTagDialog
        isOpen={openCreateTag}
        onClose={() => {
          updateCache();
          setOpenCreateTag(false);
        }}
      />
      <UpdateTagDialog
        onClose={() => {
          updateCache();
          setOpenEditTag(undefined);
        }}
        isOpen={!!openEditTag}
        tag={openEditTag}
      />
    </Fragment>
  );
};
