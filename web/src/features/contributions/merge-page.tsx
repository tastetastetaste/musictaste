import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Stack } from '../../components/flex/stack';
import { FormInputError } from '../../components/inputs/form-input-error';
import { Input } from '../../components/inputs/input';
import { Select } from '../../components/inputs/select';
import { Typography } from '../../components/typography';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
interface MergeFormData {
  entityType: 'artist' | 'release' | 'label';
  mergeFromId: string;
  mergeIntoId: string;
}

const EntityTypeOptions = [
  { value: 'artist', label: 'Artist' },
  { value: 'release', label: 'Release' },
  { value: 'label', label: 'Label' },
];

const MergePage = () => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<MergeFormData>({
    defaultValues: {
      entityType: 'artist',
      mergeFromId: '',
      mergeIntoId: '',
    },
  });

  const entityType = watch('entityType');

  const { mutateAsync: mergeEntities, isLoading } = useMutation(
    api.mergeEntities,
  );

  const onSubmit = async (data: MergeFormData) => {
    try {
      const result = await mergeEntities({
        entityType: data.entityType,
        mergeFromId: data.mergeFromId,
        mergeIntoId: data.mergeIntoId,
      });

      alert(
        `Successfully merged ${result.mergedFrom} into ${result.mergedInto}`,
      );

      reset();
    } catch (error) {
      alert('Error merging entities');
    }
  };

  return (
    <AppPageWrapper title="Merge Entities">
      <Container>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <Typography size="title-lg">Merge Entities</Typography>
            <Typography size="body">
              This will move all related data and delete the source entity.
            </Typography>

            <div>
              <Typography size="body">
                <strong>Entity Type</strong>
              </Typography>
              <Controller
                name="entityType"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Select
                    {...field}
                    options={EntityTypeOptions}
                    placeholder="Entity Type"
                    value={
                      EntityTypeOptions.find((c) => c.value === value) || null
                    }
                    onChange={(val: { value: string; label: string }) =>
                      onChange(val.value)
                    }
                  />
                )}
              />
              <FormInputError error={errors.entityType} />
            </div>

            <div>
              <Typography size="body">
                <strong>Merge From ID (to be deleted)</strong>
              </Typography>
              <Input
                placeholder={`Enter ${entityType} ID to merge from...`}
                {...register('mergeFromId', {
                  required: 'Merge from ID is required',
                })}
              />
              <FormInputError error={errors.mergeFromId} />
            </div>

            <div>
              <Typography size="body">
                <strong>Merge Into ID (target)</strong>
              </Typography>
              <Input
                placeholder={`Enter ${entityType} ID to merge into...`}
                {...register('mergeIntoId', {
                  required: 'Merge into ID is required',
                })}
              />
              <FormInputError error={errors.mergeIntoId} />
            </div>

            <Button
              type="submit"
              variant="main"
              disabled={
                isLoading || !watch('mergeFromId') || !watch('mergeIntoId')
              }
            >
              {isLoading ? 'Merging...' : 'Merge Entities'}
            </Button>
          </Stack>
        </form>
      </Container>
    </AppPageWrapper>
  );
};

export default MergePage;
