import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { CreateReportDto, ReportType } from 'shared';
import { Button } from '../../components/button';
import Dialog from '../../components/dialog';
import { Stack } from '../../components/flex/stack';
import { FormInputError } from '../../components/inputs/form-input-error';
import { Textarea } from '../../components/inputs/textarea';
import { useSnackbar } from '../../hooks/useSnackbar';
import { api } from '../../utils/api';

const ReportForm = ({
  type,
  id,
  onClose,
}: {
  type: ReportType;
  id: string;
  onClose: () => void;
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateReportDto>();

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
  type: ReportType;
  id: string;
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Report`}>
      <ReportForm type={type} id={id} onClose={onClose} />
    </Dialog>
  );
};
