import { IconMinus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { Select } from '../../components/inputs/select';
import { Typography } from '../../components/typography';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { Checkbox } from '../../components/inputs/checkbox';
import { ArtistType } from 'shared';

export const SelectGroupArtist = ({ control }: any) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'groupArtists',
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
          append({
            artistId: selected.value,
            artistName: selected.label,
            alias: '',
            current: true,
          });
          setSelectedValue(null);
          setQuery('');
        }}
        isLoading={isLoading && fetchStatus !== 'idle'}
        options={
          data?.artists &&
          data.artists
            .filter((a) => a.type !== ArtistType.Group)
            .map(({ id, name, nameLatin, disambiguation }) => ({
              value: id,
              label:
                name +
                (nameLatin ? ` [${nameLatin}]` : '') +
                (disambiguation ? ` (${disambiguation})` : ''),
            }))
        }
        placeholder="Group Members"
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
              <Controller
                name={`groupArtists.${index}.current`}
                control={control}
                defaultValue={true}
                render={({ field }) => (
                  <Checkbox
                    {...field}
                    onChange={(value) => field.onChange(value)}
                    label="Current"
                  />
                )}
              />
            </div>
          </Group>
        ))}
      </Stack>
    </>
  );
};
