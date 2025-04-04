import { useForm } from 'react-hook-form';
import Dialog from '../../components/dialog';
import { Textarea } from '../../components/inputs/textarea';
import { Button } from '../../components/button';
import { useMutation } from 'react-query';
import { api } from '../../utils/api';
import { Stack } from '../../components/flex/stack';
import { useSnackbar } from '../../hooks/useSnackbar';
import { FormInputError } from '../../components/inputs/form-input-error';
import { CreateReportDto } from 'shared';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';

const ReportForm = ({
  type,
  id,
  onClose,
}: {
  type: 'release' | 'artist' | 'user' | 'review' | 'list';
  id: string;
  onClose: () => void;
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateReportDto>({
    resolver: classValidatorResolver(
      CreateReportDto,
      {},
      {
        rawValues: true,
      },
    ),
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: api.report,
  });

  const { snackbar } = useSnackbar();

  return (
    <form
      onSubmit={handleSubmit((data) =>
        mutate(
          {
            id,
            type,
            reason: data.reason,
          },
          {
            onSuccess: (data) => {
              snackbar(data?.message);
              onClose();
            },
          },
        ),
      )}
    >
      <Stack gap="sm">
        <Textarea placeholder="Reason" {...register('reason')} />
        <FormInputError error={errors.reason} />
        <Button type="submit" disabled={isLoading}>
          Send
        </Button>
      </Stack>
    </form>
  );
};

export const ReportDialog = ({
  isOpen,
  onClose,
  type,
  id,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: 'release' | 'artist' | 'user' | 'review' | 'list';
  id: string;
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Report`}>
      <ReportForm type={type} id={id} onClose={onClose} />
    </Dialog>
  );
};
