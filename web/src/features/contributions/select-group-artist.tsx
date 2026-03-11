import { IconMinus } from '@tabler/icons-react';
import { Controller, useFieldArray } from 'react-hook-form';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { Typography } from '../../components/typography';
import { Checkbox } from '../../components/inputs/checkbox';
import { ArtistType } from 'shared';
import { SelectArtist } from './select-artist';

export const SelectGroupArtist = ({ control }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'groupArtists',
    keyName: '_id',
  });

  return (
    <>
      <SelectArtist
        name="groupArtistSelect"
        value={null}
        onBlur={() => {}}
        onChange={(selected: { value: string; label: string }) => {
          if (!selected) return;
          append({
            artistId: selected.value,
            artistName: selected.label,
            current: true,
          });
        }}
        isMulti={false}
        filterCondition={(a) =>
          a.type !== ArtistType.Group &&
          !fields.some((f: any) => f.artistId === a.id)
        }
        placeholder="Group Members"
      />
      {fields.length > 0 && (
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
      )}
    </>
  );
};
