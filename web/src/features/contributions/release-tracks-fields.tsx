import { forwardRef, Fragment, useEffect, useState } from 'react';
import {
  Controller,
  ControllerRenderProps,
  FieldValues,
  useFieldArray,
} from 'react-hook-form';
import { Button } from '../../components/button';
import { IconButton } from '../../components/icon-button';
import { Group } from '../../components/flex/group';
import { Input } from '../../components/inputs/input';
import { Stack } from '../../components/flex/stack';
import { IconMinus, IconPlus } from '@tabler/icons-react';

export function millisecondsToTimeString(ms: string | number) {
  ms = Number(ms);
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (hours > 0) {
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  } else {
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}

export function timeStringToMilliseconds(timeString: string) {
  // SS
  let milliseconds = Number(timeString) * 1000;

  if (timeString.split(':').length === 2) {
    /* For MM:SS */
    milliseconds =
      Number(timeString.split(':')[0]) * 60000 +
      Number(timeString.split(':')[1]) * 1000;
  } else if (timeString.split(':').length === 3) {
    /* For HH:MM:SS */
    milliseconds =
      Number(timeString.split(':')[0]) * 3600000 +
      Number(timeString.split(':')[1]) * 60000 +
      Number(timeString.split(':')[2]) * 1000;
  } else if (timeString.split(':').length === 4) {
    /* For DD:HH:MM:SS */
    milliseconds =
      Number(timeString.split(':')[0]) * 86400000 +
      Number(timeString.split(':')[1]) * 3600000 +
      Number(timeString.split(':')[2]) * 60000 +
      Number(timeString.split(':')[3]) * 1000;
  }

  return milliseconds;
}

const DurationInput = forwardRef(({ value, onChange, ...field }: any, ref) => {
  const [inputValue, setInputValue] = useState(
    value ? millisecondsToTimeString(value) : '',
  );

  return (
    <Input
      ref={ref}
      {...field}
      value={inputValue}
      placeholder="mm:ss"
      onChange={(e) => {
        const { value } = e.target;
        setInputValue(value);
        onChange(value ? timeStringToMilliseconds(value) : null);
      }}
    />
  );
});

const ReleaseTracksFields = ({ control, register }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tracks',
  });

  return (
    <Fragment>
      {fields.length === 0 ? (
        <Button
          variant="main"
          onClick={() => {
            const n = Number(prompt('Number of tracks'));

            append(
              Array.from({ length: n }, (_, i) => ({
                track: (i + 1).toString(),
                title: '',
              })),
            );
          }}
        >
          Add tracks
        </Button>
      ) : (
        <Stack gap="sm">
          {fields.map((item: any, index) => (
            <Group gap={4} key={item.id}>
              <IconButton title="Remove track" onClick={() => remove(index)}>
                <IconMinus />
              </IconButton>
              <div
                style={{
                  flexGrow: 1,
                  flexBasis: 0,
                }}
              >
                <Input
                  {...register(`tracks.${index}.track` as const, {
                    required: true,
                  })}
                  placeholder="#"
                  defaultValue={item.track}
                />
              </div>

              <div
                style={{
                  flexGrow: 5,
                  flexBasis: 0,
                }}
              >
                <Input
                  {...register(`tracks.${index}.title` as const, {
                    required: true,
                  })}
                  placeholder="title"
                  defaultValue={item.title}
                />
              </div>
              <div
                style={{
                  flexGrow: 1,
                  flexBasis: 0,
                }}
              >
                <Controller
                  control={control}
                  name={`tracks.${index}.durationMs` as const}
                  render={({ field }) => <DurationInput {...field} />}
                />
              </div>
            </Group>
          ))}
          <IconButton
            title="Add track"
            onClick={() => {
              append(
                { track: (fields.length + 1).toString(), title: '' },
                { focusName: `tracks.${fields.length}.title` },
              );
            }}
          >
            <IconPlus />
          </IconButton>
        </Stack>
      )}
    </Fragment>
  );
};

export default ReleaseTracksFields;
