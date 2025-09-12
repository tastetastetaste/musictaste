import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { CreateReleaseDto } from 'shared';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Feedback } from '../../components/feedback';
import { FlexChild } from '../../components/flex/flex-child';
import { Stack } from '../../components/flex/stack';
import { Dropzone } from '../../components/inputs/dropzone';
import { FormInputError } from '../../components/inputs/form-input-error';
import { Input } from '../../components/inputs/input';
import { Select } from '../../components/inputs/select';
import { Textarea } from '../../components/inputs/textarea';
import { Link } from '../../components/links/link';
import { Typography } from '../../components/typography';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { getReleasePathname } from '../../utils/get-pathname';
import CreateArtistDialog from './create-artist-dialog';
import CreateLabelDialog from './create-label-dialog';
import { importFromMusicBrainz } from './import-data';
import ReleaseTracksFields from './release-tracks-fields';
import { SelectArtist } from './select-artist';
import { SelectLabel } from './select-label';
import { SelectLanguage } from './select-language';
import { ReleaseTypeOptions } from './shared';
import { Group } from '../../components/flex/group';
import { AddByIdArtistDialog } from './add-by-id-artist-dialog';
import { AddByIdLabelDialog } from './add-by-id-label-dialog';

export interface CreateReleaseFormValues extends CreateReleaseDto {
  mbid: string;
  artists: { label: string; value: string }[];
  labels: { label: string; value: string }[];
  languages: { label: string; value: string }[];
}
const AddReleasePage = () => {
  const [importMessage, setImportMessage] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  const [openCreateArtistDialog, setOpenCreateArtistDialog] = useState(false);
  const [openCreateLabelDialog, setOpenCreateLabelDialog] = useState(false);
  const [openAddByIdArtistDialog, setOpenAddByIdArtistDialog] = useState(false);
  const [openAddByIdLabelDialog, setOpenAddByIdLabelDialog] = useState(false);

  const defaultValues = {
    mbid: '',
    title: '',
    date: '',
    image: null,
    imageUrl: '',
    tracks: [],
    artistsIds: [],
    labelsIds: [],
    languagesIds: [],
    artists: [],
    labels: [],
    languages: [],
    type: '',
    note: '',
  };

  const {
    handleSubmit,
    register,
    control,
    setValue,
    getValues,
    watch,
    reset,
    formState: { isSubmitSuccessful, errors },
  } = useForm<CreateReleaseFormValues>({
    resolver: classValidatorResolver(
      CreateReleaseDto,
      {},
      {
        rawValues: true,
      },
    ),
    defaultValues,
  });

  const {
    mutateAsync: createRelease,
    isLoading,
    data,
  } = useMutation(api.createRelease);

  useEffect(() => {
    reset(defaultValues);
    setImportMessage('');
  }, [isSubmitSuccessful]);

  const mbImport = async () => {
    setImportLoading(true);
    setImportMessage('');
    const message = await importFromMusicBrainz(getValues(), setValue);
    setImportMessage(message);
    setImportLoading(false);
  };

  return (
    <AppPageWrapper title="Add Release">
      <Container>
        <form
          onSubmit={handleSubmit((data) => createRelease(data))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
        >
          <Stack gap="sm">
            <Group justify="apart" align="center" wrap>
              <Typography size="title-lg">Add Release</Typography>
              <Link to="/contributing">
                Need help? Read the Contributing Guide.
              </Link>
            </Group>
            <Input
              placeholder="MusicBrainz release id/url"
              {...register('mbid')}
            />
            <FormInputError error={errors.mbid} />
            <FlexChild align="flex-end">
              <Button
                variant="text"
                onClick={mbImport}
                disabled={importLoading}
              >
                Import
              </Button>
            </FlexChild>
            {importMessage?.length > 0 && <Feedback message={importMessage} />}
            <Input placeholder="Title" {...register('title')} />
            <FormInputError error={errors.title} />
            <Controller
              name="artists"
              control={control}
              render={({ field }) => (
                <SelectArtist
                  {...field}
                  updateArtistsIds={(value) => setValue('artistsIds', value)}
                />
              )}
            />
            <FormInputError error={errors.artistsIds} />
            <FlexChild align="flex-end">
              <Group gap="lg" wrap>
                <Button
                  variant="text"
                  onClick={() => setOpenAddByIdArtistDialog(true)}
                >
                  Select by ID
                </Button>
                <Button
                  variant="text"
                  onClick={() => setOpenCreateArtistDialog(true)}
                >
                  Add new artist
                </Button>
              </Group>
            </FlexChild>
            <Controller
              name="type"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <Select
                  {...field}
                  options={ReleaseTypeOptions}
                  placeholder="Type"
                  value={
                    ReleaseTypeOptions.find((c) => c.value === value) || null
                  }
                  onChange={(val: { value: string; label: string }) =>
                    onChange(val.value)
                  }
                />
              )}
            />
            <FormInputError error={errors.type} />
            <Input
              placeholder="Date (YYYY / YYYY-MM / YYYY-MM-DD / MM/DD/YYYY / MM-DD-YYYY / MMM DD, YYYY)"
              {...register('date')}
            />
            <FormInputError error={errors.date} />
            <Controller
              name="labels"
              control={control}
              render={({ field }) => (
                <SelectLabel
                  {...field}
                  updateLabelsIds={(value) => setValue('labelsIds', value)}
                />
              )}
            />
            <FormInputError error={errors.labelsIds} />
            <FlexChild align="flex-end">
              <Group gap="lg" wrap>
                <Button
                  variant="text"
                  onClick={() => setOpenAddByIdLabelDialog(true)}
                >
                  Select by ID
                </Button>
                <Button
                  variant="text"
                  onClick={() => setOpenCreateLabelDialog(true)}
                >
                  Add new label
                </Button>
              </Group>
            </FlexChild>
            <Controller
              name="languages"
              control={control}
              render={({ field }) => (
                <SelectLanguage
                  {...field}
                  updateLanguagesIds={(value) =>
                    setValue('languagesIds', value)
                  }
                />
              )}
            />
            <FormInputError error={errors.languagesIds} />
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
                  fileURL={watch('imageUrl')}
                  placeholder="Cover Art (Drag and drop, or click to select)"
                />
              )}
            />
            <FormInputError error={errors.image || errors.imageUrl} />
            <ReleaseTracksFields control={control} register={register} />
            <Textarea {...register('note')} placeholder="Note/source" />
            <FormInputError error={errors.note} />
            <Button variant="main" type="submit" disabled={isLoading}>
              Submit
            </Button>
          </Stack>
        </form>
        <div>
          {data?.message && <Typography>{data.message}</Typography>}
          {data?.release && (
            <Link to={getReleasePathname(data.release.id)}>
              {' '}
              {getReleasePathname(data.release.id)}
            </Link>
          )}
        </div>
        <CreateArtistDialog
          isOpen={openCreateArtistDialog}
          onClose={() => setOpenCreateArtistDialog(false)}
        />
        <CreateLabelDialog
          isOpen={openCreateLabelDialog}
          onClose={() => setOpenCreateLabelDialog(false)}
        />
        <AddByIdArtistDialog
          isOpen={openAddByIdArtistDialog}
          onClose={() => setOpenAddByIdArtistDialog(false)}
          onAddArtist={(artist) => {
            const currentArtists = getValues('artists') || [];
            const newArtists = [...currentArtists, artist];
            setValue('artists', newArtists);
            setValue(
              'artistsIds',
              newArtists.map((a) => a.value),
            );
          }}
          currentArtists={getValues('artists') || []}
        />
        <AddByIdLabelDialog
          isOpen={openAddByIdLabelDialog}
          onClose={() => setOpenAddByIdLabelDialog(false)}
          onAddLabel={(label) => {
            const currentLabels = getValues('labels') || [];
            const newLabels = [...currentLabels, label];
            setValue('labels', newLabels);
            setValue(
              'labelsIds',
              newLabels.map((l) => l.value),
            );
          }}
          currentLabels={getValues('labels') || []}
        />
      </Container>
    </AppPageWrapper>
  );
};

export default AddReleasePage;
