import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateGenreDto, SubmissionStatus } from 'shared';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { FormInputError } from '../../components/inputs/form-input-error';
import { Input } from '../../components/inputs/input';
import { Textarea } from '../../components/inputs/textarea';
import { Link } from '../../components/links/link';
import { Typography } from '../../components/typography';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ON_EDIT_GENRE } from '../../static/feedback';

const EditGenrePage = () => {
  const { id: genreId } = useParams();
  const defaultValues = {
    name: '',
    bio: '',
    note: '',
  };

  const {
    handleSubmit,
    register,
    reset,
    formState: { isSubmitSuccessful, errors },
  } = useForm<CreateGenreDto>({
    resolver: classValidatorResolver(
      CreateGenreDto,
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
    mutateAsync: updateGenre,
    isLoading,
    data,
  } = useMutation(api.updateGenre, {
    onSuccess: ({ message }) => {
      reset(defaultValues);
      snackbar(message || ON_EDIT_GENRE);

      navigate(`/genre/${genreId}`);
    },
  });

  const { data: genreData, isLoading: isGenreLoading } = useQuery(
    cacheKeys.genreKey(genreId),
    () => api.getGenre(genreId!),
    {
      enabled: !!genreId,
    },
  );

  const { data: openSubmissionData, isLoading: isOpenSubmissionLoading } =
    useQuery(
      cacheKeys.genreSubmissionsKey({
        genreId,
        page: 1,
        status: SubmissionStatus.OPEN,
      }),
      () =>
        api.getGenreSubmissions({
          page: 1,
          genreId,
          status: SubmissionStatus.OPEN,
        }),
    );

  useEffect(() => {
    if (genreData) {
      reset({
        ...defaultValues,
        name: genreData.genre.name,
        bio: genreData.genre.bio,
      });
    }
  }, [genreData]);

  const openSubmission = openSubmissionData?.genres?.[0] || null;

  return (
    <AppPageWrapper title="Edit Genre">
      <Container>
        <form
          onSubmit={handleSubmit((data) => updateGenre({ id: genreId, data }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
        >
          <Stack gap="sm">
            <Group justify="apart" align="center" wrap>
              <Typography size="title-lg">Edit Genre</Typography>
              <Link to="/contributing">
                Need help? Read the Contributing Guide.
              </Link>
            </Group>
            <Input placeholder="Name" {...register('name')} />
            <FormInputError error={errors.name} />
            <Textarea {...register('bio')} placeholder="Bio" rows={5} />
            <FormInputError error={errors.bio} />
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

export default EditGenrePage;
