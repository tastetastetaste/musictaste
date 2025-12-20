import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArtistType, SubmissionStatus, UpdateArtistDto } from 'shared';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { FormInputError } from '../../components/inputs/form-input-error';
import { Input } from '../../components/inputs/input';
import { Select } from '../../components/inputs/select';
import { Textarea } from '../../components/inputs/textarea';
import { Link } from '../../components/links/link';
import { Typography } from '../../components/typography';
import { useSnackbar } from '../../hooks/useSnackbar';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { ArtistTypeOptions } from './shared';
import { SelectSingleArtist } from './select-single-artist';
import { Feedback } from '../../components/feedback';
import { SelectArtist } from './select-artist';
import { SelectGroupArtist } from './select-group-artist';
import CreateArtistDialog from './create-artist-dialog';
import { FlexChild } from '../../components/flex/flex-child';

export interface EditArtistFormValues extends UpdateArtistDto {
  mainArtist: { value: string; label: string };
  relatedArtists: { value: string; label: string }[];
}

const EditArtistPage = () => {
  const { id: artistId } = useParams();
  const defaultValues = {
    name: '',
    nameLatin: '',
    type: ArtistType.Person,
    disambiguation: '',
    relatedArtists: [],
    relatedArtistsIds: [],
    mainArtistId: '',
    note: '',
  };

  const [openCreateArtistDialog, setOpenCreateArtistDialog] = useState(false);

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<EditArtistFormValues>({
    resolver: classValidatorResolver(
      UpdateArtistDto,
      {},
      {
        rawValues: true,
      },
    ),
    defaultValues,
  });

  const navigate = useNavigate();

  const { snackbar } = useSnackbar();

  const {
    mutateAsync: updateArtist,
    isLoading,
    data,
  } = useMutation(api.updateArtist, {
    onSuccess: ({ message }) => {
      reset(defaultValues);
      snackbar(message || 'Changes submitted successfully');

      navigate(`/artist/${artistId}`);
    },
  });

  const { data: artistData, isLoading: isArtistLoading } = useQuery(
    cacheKeys.artistKey(artistId),
    () => api.getArtist(artistId!),
    {
      enabled: !!artistId,
    },
  );

  const { data: openSubmissionData, isLoading: isOpenSubmissionLoading } =
    useQuery(
      cacheKeys.artistSubmissionsKey({
        artistId,
        page: 1,
        status: SubmissionStatus.OPEN,
      }),
      () =>
        api.getArtistSubmissions({
          page: 1,
          artistId,
          status: SubmissionStatus.OPEN,
        }),
    );

  useEffect(() => {
    if (artistData) {
      reset({
        ...defaultValues,
        name: artistData.artist.name,
        nameLatin: artistData.artist.nameLatin || '',
        type: artistData.artist.type,
        disambiguation: artistData.artist.disambiguation || '',
        groupArtists:
          artistData.artist.groupArtists?.map((ga) => ({
            artistName: ga.artist.name,
            artistId: ga.artist.id,
            current: ga.current,
          })) || [],
        relatedArtists:
          artistData.artist.relatedArtists?.map((a) => ({
            label: a.name,
            value: a.id,
          })) || [],
        relatedArtistsIds:
          artistData.artist.relatedArtists?.map((a) => a.id) || [],
        mainArtistId: artistData.artist.mainArtistId || '',
      });
    }
  }, [artistData]);

  const openSubmission = openSubmissionData?.artists?.[0] || null;
  const artistType = watch('type');

  return (
    <AppPageWrapper title="Edit Artist">
      <Container>
        <form
          onSubmit={handleSubmit((data) =>
            updateArtist({ id: artistId, data }),
          )}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
            }
          }}
        >
          <Stack gap="sm">
            <Group justify="apart" align="center" wrap>
              <Typography size="title-lg">Edit Artist</Typography>
              <Link to="/contributing">
                Need help? Read the Contributing Guide.
              </Link>
            </Group>
            {openSubmission && (
              <Feedback
                message={`There is already an open edit submission for this artist. Please wait for it to be reviewed before submitting another edit.`}
              />
            )}
            <Controller
              name="type"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <Select
                  {...field}
                  options={ArtistTypeOptions}
                  placeholder="Type"
                  value={
                    ArtistTypeOptions.find((c) => c.value === value) || null
                  }
                  onChange={(val: { value: number; label: string }) => {
                    onChange(val.value);
                    setValue(
                      'mainArtistId',
                      val.value === ArtistType.Alias
                        ? artistData?.artist.mainArtistId || ''
                        : '',
                    );
                    setValue(
                      'relatedArtists',
                      val.value !== ArtistType.Alias
                        ? artistData?.artist.relatedArtists.map((a) => ({
                            label: a.name,
                            value: a.id,
                          })) || []
                        : [],
                    );
                    setValue(
                      'relatedArtistsIds',
                      val.value !== ArtistType.Alias
                        ? artistData?.artist.relatedArtists.map((a) => a.id) ||
                            []
                        : [],
                    );
                  }}
                />
              )}
            />
            <FormInputError error={errors.type} />
            <Input placeholder="Name" {...register('name')} />
            <FormInputError error={errors.name} />
            <Input
              placeholder="Name (Latin script)"
              {...register('nameLatin')}
            />
            <FormInputError error={errors.nameLatin} />
            {artistType !== ArtistType.Alias && (
              <>
                <Input
                  placeholder="Disambiguation"
                  {...register('disambiguation')}
                />
                <FormInputError error={errors.disambiguation} />
              </>
            )}
            {artistType === ArtistType.Group && (
              <>
                <SelectGroupArtist control={control} register={register} />
                <FormInputError error={errors.groupArtists} />
                <FlexChild align="flex-end">
                  <Button
                    variant="text"
                    onClick={() => setOpenCreateArtistDialog(true)}
                  >
                    Add new artist
                  </Button>
                </FlexChild>
              </>
            )}
            {artistType === ArtistType.Alias && (
              <>
                <Controller
                  name="mainArtist"
                  control={control}
                  render={({ field }) => (
                    <SelectSingleArtist
                      {...field}
                      updateMainArtistId={(value) =>
                        setValue('mainArtistId', value)
                      }
                    />
                  )}
                />
                <FormInputError
                  error={errors.mainArtist || errors.mainArtistId}
                />
              </>
            )}
            {artistType !== ArtistType.Alias && (
              <>
                <Controller
                  name="relatedArtists"
                  control={control}
                  render={({ field }) => (
                    <SelectArtist
                      placeholder="Related Artists"
                      filterCondition={(a) => a.type !== ArtistType.Alias}
                      {...field}
                      updateArtistsIds={(value) =>
                        setValue('relatedArtistsIds', value)
                      }
                    />
                  )}
                />
                <FormInputError
                  error={errors.relatedArtistsIds || errors.relatedArtists}
                />
              </>
            )}
            <Textarea
              {...register('note')}
              placeholder="Note/source"
              rows={5}
            />
            <FormInputError error={errors.note} />
            <Button
              variant="main"
              type="submit"
              disabled={
                isLoading || isOpenSubmissionLoading || !!openSubmission
              }
            >
              Submit
            </Button>
          </Stack>
        </form>
        <div>{data?.message && <Typography>{data.message}</Typography>}</div>
      </Container>

      <CreateArtistDialog
        isOpen={openCreateArtistDialog}
        onClose={() => setOpenCreateArtistDialog(false)}
      />
    </AppPageWrapper>
  );
};

export default EditArtistPage;
