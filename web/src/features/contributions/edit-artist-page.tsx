import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { SubmissionStatus, UpdateArtistDto } from 'shared';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { FormInputError } from '../../components/inputs/form-input-error';
import { Input } from '../../components/inputs/input';
import { Textarea } from '../../components/inputs/textarea';
import { Link } from '../../components/links/link';
import { Typography } from '../../components/typography';
import { useSnackbar } from '../../hooks/useSnackbar';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';

const EditArtistPage = () => {
  const { id: artistId } = useParams();
  const defaultValues = {
    name: '',
    nameLatin: '',
    note: '',
  };

  const {
    handleSubmit,
    register,
    reset,
    formState: { isSubmitSuccessful, errors },
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
      });
    }
  }, [artistData]);

  const openSubmission = openSubmissionData?.artists?.[0] || null;

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
