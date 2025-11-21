import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
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
import { TextareaWithPreview } from '../../components/inputs/textarea-with-preview';
import { Link } from '../../components/links/link';
import { Typography } from '../../components/typography';
import { useSnackbar } from '../../hooks/useSnackbar';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { ArtistTypeOptions } from './shared';

const EditArtistPage = () => {
  const { id: artistId } = useParams();
  const defaultValues = {
    name: '',
    nameLatin: '',
    type: ArtistType.Person,
    members: '',
    memberOf: '',
    disambiguation: '',
    aka: '',
    relatedArtists: '',
    note: '',
  };

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<UpdateArtistDto>({
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
        members: artistData.artist.membersSource || '',
        memberOf: artistData.artist.memberOfSource || '',
        disambiguation: artistData.artist.disambiguation || '',
        aka: artistData.artist.akaSource || '',
        relatedArtists: artistData.artist.relatedArtistsSource || '',
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
            if (e.key === 'Enter') {
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
            <Input placeholder="Name" {...register('name')} />
            <FormInputError error={errors.name} />
            <Input
              placeholder="Name (Latin script)"
              {...register('nameLatin')}
            />
            <FormInputError error={errors.nameLatin} />
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
                      'members',
                      val.value === ArtistType.Group
                        ? artistData?.artist.membersSource || ''
                        : '',
                    );
                    setValue(
                      'memberOf',
                      val.value === ArtistType.Person
                        ? artistData?.artist.memberOfSource || ''
                        : '',
                    );
                  }}
                />
              )}
            />
            <FormInputError error={errors.type} />
            <Input
              placeholder="Disambiguation"
              {...register('disambiguation')}
            />
            <FormInputError error={errors.disambiguation} />
            {artistType === ArtistType.Group && (
              <>
                <TextareaWithPreview
                  {...register('members')}
                  placeholder="Members"
                  rows={2}
                />
                <FormInputError error={errors.members} />
              </>
            )}
            {artistType === ArtistType.Person && (
              <>
                <TextareaWithPreview
                  {...register('memberOf')}
                  placeholder="Member Of"
                  rows={2}
                />
                <FormInputError error={errors.memberOf} />
              </>
            )}
            <TextareaWithPreview
              {...register('relatedArtists')}
              placeholder="Related Artists"
              rows={2}
            />
            <FormInputError error={errors.relatedArtists} />
            <TextareaWithPreview
              {...register('aka')}
              placeholder="AKA"
              rows={2}
            />
            <FormInputError error={errors.aka} />
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
    </AppPageWrapper>
  );
};

export default EditArtistPage;
