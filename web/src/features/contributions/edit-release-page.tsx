import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { SubmissionStatus, UpdateReleaseDto } from 'shared';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Feedback } from '../../components/feedback';
import { FlexChild } from '../../components/flex/flex-child';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Dropzone } from '../../components/inputs/dropzone';
import { FormInputError } from '../../components/inputs/form-input-error';
import { Input } from '../../components/inputs/input';
import { Select } from '../../components/inputs/select';
import { Textarea } from '../../components/inputs/textarea';
import { Link } from '../../components/links/link';
import { Typography } from '../../components/typography';
import { useSnackbar } from '../../hooks/useSnackbar';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { ON_EDIT_RELEASE } from '../../static/feedback';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { AddByIdArtistDialog } from './add-by-id-artist-dialog';
import { AddByIdLabelDialog } from './add-by-id-label-dialog';
import CreateArtistDialog from './create-artist-dialog';
import CreateLabelDialog from './create-label-dialog';
import { importFromMusicBrainz } from './import-data';
import ReleaseTracksFields from './release-tracks-fields';
import { SelectArtist } from './select-artist';
import { SelectLabel } from './select-label';
import { SelectLanguage } from './select-language';
import { ReleaseTypeOptions } from './shared';
import { ExplicitCoverArtOptions } from './add-release-page';

export interface EditReleaseFormValues extends UpdateReleaseDto {
  mbid: string;
  artists: { label: string; value: string }[];
  labels: { label: string; value: string }[];
  languages: { label: string; value: string }[];
}

const EditReleasePage = () => {
  const { id: releaseId } = useParams();

  const [openCreateArtistDialog, setOpenCreateArtistDialog] = useState(false);
  const [openCreateLabelDialog, setOpenCreateLabelDialog] = useState(false);
  const [openAddByIdArtistDialog, setOpenAddByIdArtistDialog] = useState(false);
  const [openAddByIdLabelDialog, setOpenAddByIdLabelDialog] = useState(false);

  const [importMessage, setImportMessage] = useState('');
  const [importLoading, setImportLoading] = useState(false);

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
    explicitCoverArt: [],
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
  } = useForm<EditReleaseFormValues>({
    resolver: classValidatorResolver(
      UpdateReleaseDto,
      {},
      {
        rawValues: true,
      },
    ),
    defaultValues,
  });

  const { data: releaseData, isLoading: isReleaseLoading } = useQuery(
    cacheKeys.releaseKey(releaseId),
    () => api.getRelease(releaseId!),
    {
      enabled: Boolean(releaseId),
    },
  );

  const { data: openSubmissionData, isLoading: isOpenSubmissionLoading } =
    useQuery(
      cacheKeys.releaseSubmissionsKey({
        releaseId,
        page: 1,
        status: SubmissionStatus.OPEN,
      }),
      () =>
        api.getReleaseSubmissions({
          page: 1,
          releaseId: releaseId!,
          status: SubmissionStatus.OPEN,
        }),
      {
        enabled: !!releaseId,
      },
    );

  const openSubmission = openSubmissionData?.releases?.[0] || null;

  useEffect(() => {
    if (releaseData) {
      const { release, tracks } = releaseData;

      reset({
        ...defaultValues,
        title: release.title,
        artists: release.artists.map((a) => ({
          label: a.name,
          value: a.id,
        })),
        artistsIds: release.artists.map((a) => a.id),
        labels: release.labels
          ? release.labels.map((l) => ({
              label: l.name,
              value: l.id,
            }))
          : undefined,
        labelsIds: release.labels.map((l) => l.id),
        languages: release.languages
          ? release.languages.map((l) => ({
              label: l.name,
              value: l.id,
            }))
          : undefined,
        languagesIds: release.languages.map((l) => l.id),
        type: release.type,
        date: release.date,
        tracks:
          tracks && tracks.length !== 0
            ? tracks.map((t) => ({
                id: t.id,
                title: t.title,
                track: t.track,
                durationMs: t.durationMs,
              }))
            : undefined,
        imageUrl: release.cover?.original,
        explicitCoverArt: release.explicitCoverArt,
      });
    }
  }, [releaseData]);

  const {
    mutateAsync: editRelease,
    isLoading,
    data,
  } = useMutation(api.updateRelease);

  const navigate = useNavigate();

  const { snackbar } = useSnackbar();

  useEffect(() => {
    if (isSubmitSuccessful) {
      snackbar(ON_EDIT_RELEASE);

      navigate(`/release/${releaseId}`, { replace: true });
    }
  }, [isSubmitSuccessful]);

  const title =
    releaseData && releaseData.release && `${releaseData.release.title} / edit`;

  const mbImport = async () => {
    setImportLoading(true);
    setImportMessage('');
    const message = await importFromMusicBrainz(getValues(), setValue);
    setImportMessage(message);
    setImportLoading(false);
  };

  return (
    <AppPageWrapper title={title}>
      <Container>
        <form
          onSubmit={handleSubmit((data) => {
            editRelease({ id: releaseId, data });
          })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
        >
          <Stack gap="sm">
            <Group justify="apart" align="center" wrap>
              <Typography size="title-lg">Edit Release</Typography>
              <Link to="/contributing">
                Need help? Read the Contributing Guide.
              </Link>
            </Group>
            {openSubmission && (
              <Feedback
                message={`There is already an open edit submission for this release. Please wait for it to be reviewed before submitting another edit.`}
              />
            )}
            <Input
              placeholder="MusicBrainz Release Group Id"
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
            <Controller
              name="explicitCoverArt"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <Select
                  {...field}
                  options={ExplicitCoverArtOptions}
                  placeholder="Explicit Cover Art (select all that apply)"
                  isMulti={true}
                  value={ExplicitCoverArtOptions.filter((opt) =>
                    value?.includes(opt.value),
                  )}
                  onChange={(selected) =>
                    onChange(selected.map((opt) => opt.value))
                  }
                />
              )}
            />
            <ReleaseTracksFields control={control} register={register} />
            <Textarea {...register('note')} placeholder="Note/source" />
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

export default EditReleasePage;
