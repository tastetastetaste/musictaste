import { useQuery } from '@tanstack/react-query';
import { forwardRef, useState } from 'react';
import { ControllerRenderProps, useFieldArray } from 'react-hook-form';
import { Select } from '../../components/inputs/select';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { Stack } from '../../components/flex/stack';
import { Typography } from '../../components/typography';
import { Input } from '../../components/inputs/input';
import { IconMinus } from '@tabler/icons-react';
import { IconButton } from '../../components/icon-button';
import { Group } from '../../components/flex/group';

export const ReleaseArtistsField = ({ control, register }: any) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'artists',
    keyName: '_id',
  });

  const [query, setQuery] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);

  const { data, isLoading, refetch, fetchStatus } = useQuery(
    cacheKeys.searchKey({
      q: query!,
      type: ['artists'],
      page: 1,
      pageSize: 12,
    }),
    () =>
      api.search({
        q: query!,
        type: ['artists'],
        page: 1,
        pageSize: 12,
      }),
    { enabled: !!query },
  );

  return (
    <>
      <Select
        value={selectedValue}
        onChange={(selected: { value: string; label: string }) => {
          if (!fields.some((item: any) => item.artistId === selected.value)) {
            append({
              artistId: selected.value,
              artistName: selected.label,
              alias: '',
            });
          }
          setSelectedValue(null);
          setQuery('');
        }}
        isLoading={isLoading && fetchStatus !== 'idle'}
        options={
          data?.artists &&
          data.artists.map(({ id, name, nameLatin, disambiguation }) => ({
            value: id,
            label:
              name +
              (nameLatin ? ` [${nameLatin}]` : '') +
              (disambiguation ? ` (${disambiguation})` : ''),
          }))
        }
        placeholder="Artist/Band"
        onInputChange={(v: any) => {
          if (v !== '') {
            setQuery(v);
            refetch();
          }
        }}
      />
      <Stack gap="sm">
        {fields.map((item: any, index) => (
          <Group gap="sm" key={item._id}>
            <IconButton
              title="Remove artist"
              onClick={() => remove(index)}
              danger
            >
              <IconMinus />
            </IconButton>
            <div
              style={{
                flexGrow: 1,
                flexBasis: 0,
              }}
            >
              <Typography>{item.artistName}</Typography>
            </div>
            <div
              style={{
                flexGrow: 1,
                flexBasis: 0,
              }}
            >
              <Input
                {...register(`artists.${index}.alias`)}
                placeholder="Alias (optional)"
                defaultValue={item.alias}
              />
            </div>
          </Group>
        ))}
      </Stack>
    </>
  );
};

export const SelectArtist = forwardRef(
  (
    {
      updateArtistsIds,
      onChange,
      ...field
    }: ControllerRenderProps<any, 'artists'> & { updateArtistsIds: any },
    ref,
  ) => {
    const [query, setQuery] = useState('');

    const { data, isLoading, refetch, fetchStatus } = useQuery(
      cacheKeys.searchKey({
        q: query!,
        type: ['artists'],
        page: 1,
        pageSize: 12,
      }),
      () =>
        api.search({
          q: query!,
          type: ['artists'],
          page: 1,
          pageSize: 12,
        }),
      { enabled: !!query },
    );

    return (
      <Select
        {...field}
        ref={ref}
        onChange={(selected: { value: string; label: string }[]) => {
          onChange(selected);
          updateArtistsIds(selected.map((option) => option.value));
        }}
        isLoading={isLoading && fetchStatus !== 'idle'}
        isMulti={true}
        options={
          data?.artists &&
          data.artists.map(({ id, name, nameLatin, disambiguation }) => ({
            value: id,
            label:
              name +
              (nameLatin ? ` [${nameLatin}]` : '') +
              (disambiguation ? ` (${disambiguation})` : ''),
          }))
        }
        placeholder="Artist/Band"
        onInputChange={(v: any) => {
          if (v !== '') {
            setQuery(v);
            refetch();
          }
        }}
      />
    );
  },
);
