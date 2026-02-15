import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { SubmissionStatus, UpdateLabelDto } from 'shared';
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
import { Feedback } from '../../components/feedback';

const EditLabelPage = () => {
  const { id: labelId } = useParams();
  const defaultValues = {
    name: '',
    nameLatin: '',
    shortName: '',
    disambiguation: '',
    note: '',
  };

  const {
    handleSubmit,
    register,
    reset,
    formState: { isSubmitSuccessful, errors },
  } = useForm<UpdateLabelDto>({
    resolver: classValidatorResolver(
      UpdateLabelDto,
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
    mutateAsync: updateLabel,
    isLoading,
    data,
  } = useMutation(api.updateLabel, {
    onSuccess: ({ message }) => {
      reset(defaultValues);
      snackbar(message || 'Changes submitted successfully');

      navigate(`/label/${labelId}`);
    },
  });

  const { data: labelData, isLoading: isLabelLoading } = useQuery(
    cacheKeys.labelKey(labelId),
    () => api.getLabel(labelId!),
    {
      enabled: !!labelId,
    },
  );

  const { data: openSubmissionData, isLoading: isOpenSubmissionLoading } =
    useQuery(
      cacheKeys.labelSubmissionsKey({
        labelId,
        page: 1,
        status: SubmissionStatus.OPEN,
      }),
      () =>
        api.getLabelSubmissions({
          page: 1,
          labelId,
          status: SubmissionStatus.OPEN,
        }),
    );

  useEffect(() => {
    if (labelData) {
      reset({
        ...defaultValues,
        name: labelData.label.name,
        nameLatin: labelData.label.nameLatin || '',
        shortName: labelData.label.shortName || '',
        disambiguation: labelData.label.disambiguation || '',
      });
    }
  }, [labelData]);

  const openSubmission = openSubmissionData?.labels?.[0] || null;

  return (
    <AppPageWrapper title="Edit Label">
      <Container>
        <form
          onSubmit={handleSubmit((data) => updateLabel({ id: labelId, data }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
            }
          }}
        >
          <Stack gap="sm">
            <Group justify="apart" align="center" wrap>
              <Typography size="title-lg">Edit Label</Typography>
              <Link to="/contributing">
                Need help? Read the Contributing Guide.
              </Link>
            </Group>
            {openSubmission && (
              <Feedback
                message={`There is already an open edit submission for this label. Please wait for it to be reviewed before submitting another edit.`}
              />
            )}
            <Input placeholder="Full Name" {...register('name')} />
            <FormInputError error={errors.name} />
            <Input placeholder="Short Name" {...register('shortName')} />
            <FormInputError error={errors.shortName} />
            <Input
              placeholder="English / Latin-script name (if applicable)"
              {...register('nameLatin')}
            />
            <FormInputError error={errors.nameLatin} />
            <Input
              placeholder="Disambiguation"
              {...register('disambiguation')}
            />
            <FormInputError error={errors.disambiguation} />
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

export default EditLabelPage;
