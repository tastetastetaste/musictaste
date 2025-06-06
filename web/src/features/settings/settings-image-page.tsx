import { api } from '../../utils/api';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Stack } from '../../components/flex/stack';
import { useSnackbar } from '../../hooks/useSnackbar';
import { Dropzone } from '../../components/inputs/dropzone';
import { IMAGE_UPLOADED_SUCCESS } from '../../static/feedback';
import { Typography } from '../../components/typography';
import { SettingsPageOutletContext } from './settings-page-wrapper';
import { cacheKeys } from '../../utils/cache-keys';

const SettingsImagePage = () => {
  const { user } = useOutletContext<SettingsPageOutletContext>();

  const qc = useQueryClient();

  const { mutateAsync: updateImage, isLoading } = useMutation(api.updateImage, {
    onSettled: () => {
      qc.invalidateQueries(cacheKeys.currentUserKey());
      qc.invalidateQueries(cacheKeys.userProfileKey(user.username));
    },
  });

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      image: null,
    },
  });

  const { snackbar } = useSnackbar();

  const submit = async (data: any) => {
    await updateImage({
      id: user.id,
      image: data.image,
    });
    snackbar(IMAGE_UPLOADED_SUCCESS);
    reset();
  };

  return (
    <Container>
      <form onSubmit={handleSubmit(submit)}>
        <Stack gap="sm">
          <Typography size="title-lg">Update Picture</Typography>
          <Controller
            name="image"
            control={control}
            defaultValue={null}
            render={({ field }) => (
              <Dropzone
                onDrop={(acceptedFiles: any) =>
                  acceptedFiles &&
                  acceptedFiles.length > 0 &&
                  field.onChange(acceptedFiles[0])
                }
                file={field.value}
                placeholder="Profile Picture (Drag and drop, or click to select)"
              />
            )}
          />
          <Button type="submit" disabled={isLoading}>
            Upload
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

export default SettingsImagePage;
