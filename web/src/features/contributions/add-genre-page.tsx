import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CreateGenreDto } from 'shared';
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

const AddGenrePage = () => {
  const defaultValues = {
    name: '',
    bio: '',
    note: '',
  };

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
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

  const {
    mutateAsync: createGenre,
    isLoading,
    data,
  } = useMutation(api.createGenre, {
    onSuccess: () => {
      reset(defaultValues);
    },
  });

  return (
    <AppPageWrapper title="Add Genre">
      <Container>
        <form
          onSubmit={handleSubmit((data) => createGenre(data))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
            }
          }}
        >
          <Stack gap="sm">
            <Group justify="apart" align="center" wrap>
              <Typography size="title-lg">Add Genre</Typography>
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
            <Button variant="main" type="submit" disabled={isLoading}>
              Submit
            </Button>
          </Stack>
        </form>
        <div>{data?.message && <Typography>{data.message}</Typography>}</div>
      </Container>
    </AppPageWrapper>
  );
};

export default AddGenrePage;
