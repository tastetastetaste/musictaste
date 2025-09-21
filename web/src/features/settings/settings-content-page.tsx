import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import { UpdateUserPreferencesDto } from 'shared';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Stack } from '../../components/flex/stack';
import { Checkbox } from '../../components/inputs/checkbox';
import { Typography } from '../../components/typography';
import { useSnackbar } from '../../hooks/useSnackbar';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { ExplicitCoverArtOptions } from '../contributions/add-release-page';
import { SettingsPageOutletContext } from './settings-page-wrapper';

const ExplicitCoverArtField = ({ control }: { control: any }) => {
  const currentValues =
    useWatch({
      control,
      name: 'allowExplicitCoverArt',
      defaultValue: [],
    }) || [];

  return (
    <Stack gap="md">
      {ExplicitCoverArtOptions.map((option) => (
        <Controller
          key={option.value}
          name="allowExplicitCoverArt"
          control={control}
          render={({ field }) => (
            <Checkbox
              name={`allowExplicitCoverArt-${option.value}`}
              label={option.label}
              value={!currentValues.includes(option.value)}
              onChange={(checked) => {
                let newValues;

                if (checked) {
                  // hide, remove from allowed list
                  newValues = currentValues.filter(
                    (val) => val !== option.value,
                  );
                } else {
                  // show, add to allowed list
                  newValues = currentValues.includes(option.value)
                    ? currentValues
                    : [...currentValues, option.value];
                }

                field.onChange(newValues);
              }}
            />
          )}
        />
      ))}
    </Stack>
  );
};

const SettingsContentPage = () => {
  const { user } = useOutletContext<SettingsPageOutletContext>();

  const { snackbar } = useSnackbar();

  const { handleSubmit, reset, control } = useForm<UpdateUserPreferencesDto>({
    resolver: classValidatorResolver(
      UpdateUserPreferencesDto,
      {},
      {
        rawValues: true,
      },
    ),
  });

  const qc = useQueryClient();

  const { mutateAsync: updateContentPreferences, isLoading } = useMutation(
    api.updatePreferences,
    {
      onSuccess: () => {
        qc.invalidateQueries(cacheKeys.currentUserKey());
        qc.invalidateQueries(cacheKeys.releasesKey({}));
        qc.invalidateQueries(cacheKeys.entriesKey({}));
      },
    },
  );

  useEffect(() => {
    reset({
      allowExplicitCoverArt: user.allowExplicitCoverArt || [],
    });
  }, [user]);

  const submit = async (data: UpdateUserPreferencesDto) => {
    await updateContentPreferences({
      id: user.id,
      ...data,
    });

    snackbar('Content preferences updated');
  };

  return (
    <Container>
      <form onSubmit={handleSubmit(submit)}>
        <Stack gap="sm">
          <Typography size="title-lg">Content Preferences</Typography>
          <Stack>
            <label>Hide explicit cover art</label>
            <ExplicitCoverArtField control={control} />
          </Stack>
          <Button variant="main" type="submit" disabled={isLoading}>
            Save
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

export default SettingsContentPage;
