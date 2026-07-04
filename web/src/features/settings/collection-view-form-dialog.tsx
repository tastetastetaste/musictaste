import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useOutletContext } from 'react-router-dom';
import {
  UserCollectionViewDto,
  IUserCollectionView,
  MultiValueFilterEnum,
  RatingFilterEnum,
  YearFilterEnum,
} from 'shared';
import { Button } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Checkbox } from '../../components/inputs/checkbox';
import { Input } from '../../components/inputs/input';
import { Select, SelectOption } from '../../components/inputs/select';
import { Typography } from '../../components/typography';
import { useSnackbar } from '../../hooks/useSnackbar';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { SelectArtist } from '../contributions/select-artist';
import { SelectGenres } from '../genres/select-genres';
import { ReleaseTypeOptions2 } from '../contributions/shared';
import { FormInputError } from '../../components/inputs/form-input-error';
import { SettingsPageOutletContext } from './settings-page-wrapper';

const ratingFilterOptions = [
  { value: RatingFilterEnum.is, label: 'is' },
  { value: RatingFilterEnum.isgreaterthan, label: 'is greater than' },
  { value: RatingFilterEnum.islessthan, label: 'is less than' },
  { value: RatingFilterEnum.inrange, label: 'in range' },
  { value: RatingFilterEnum.hasavalue, label: 'has a value' },
  { value: RatingFilterEnum.hasnovalue, label: 'has no value' },
];

const yearFilterOptions = [
  { value: YearFilterEnum.is, label: 'is' },
  { value: YearFilterEnum.isafter, label: 'is after' },
  { value: YearFilterEnum.isbefore, label: 'is before' },
  { value: YearFilterEnum.inrange, label: 'in range' },
];

const multiValueFilterOptions = [
  { value: MultiValueFilterEnum.isanyof, label: 'is any of' },
  { value: MultiValueFilterEnum.isnotanyof, label: 'is not any of' },
];

interface CollectionViewFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingView: IUserCollectionView | null;
}

export const CollectionViewFormDialog = ({
  isOpen,
  onClose,
  editingView,
}: CollectionViewFormDialogProps) => {
  const { user } = useOutletContext<SettingsPageOutletContext>();
  const { snackbar } = useSnackbar();
  const qc = useQueryClient();

  const { data: tagsData } = useQuery(cacheKeys.userTagsKey(user.id), () =>
    api.getUserTags(user.id),
  );

  const { mutateAsync: createView, isLoading: isCreating } = useMutation(
    api.createUserCollectionView,
    {
      onSuccess: () => {
        qc.invalidateQueries(cacheKeys.userCollectionViewsKey());
        qc.invalidateQueries(cacheKeys.userProfileKey(user.username));
        snackbar('Collection view created');
        onClose();
      },
    },
  );

  const { mutateAsync: updateView, isLoading: isUpdating } = useMutation(
    api.updateUserCollectionView,
    {
      onSuccess: () => {
        qc.invalidateQueries(cacheKeys.userCollectionViewsKey());
        qc.invalidateQueries(cacheKeys.userProfileKey(user.username));
        snackbar('Collection view updated');
        onClose();
      },
    },
  );

  const [ratingEnabled, setRatingEnabled] = useState(false);
  const [yearEnabled, setYearEnabled] = useState(false);
  const [typeEnabled, setTypeEnabled] = useState(false);
  const [artistEnabled, setArtistEnabled] = useState(false);
  const [genreEnabled, setGenreEnabled] = useState(false);
  const [tagEnabled, setTagEnabled] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserCollectionViewDto>({
    resolver: classValidatorResolver(
      UserCollectionViewDto,
      {},
      {
        rawValues: true,
      },
    ),
    defaultValues: {
      title: '',
      filters: {
        rating: undefined,
        ratingIs: undefined,
        ratingStart: undefined,
        ratingEnd: undefined,
        year: undefined,
        yearIs: '',
        yearStart: '',
        yearEnd: '',
        type: undefined,
        typeValues: [],
        artist: undefined,
        artistValues: [],
        genre: undefined,
        genreValues: [],
        tag: undefined,
        tagValues: [],
      },
    },
  });

  const ratingType = watch('filters.rating');
  const yearType = watch('filters.year');

  const tagOptions = useMemo(() => {
    return (tagsData || []).map((t) => ({
      value: t.id,
      label: t.tag,
    }));
  }, [tagsData]);

  useEffect(() => {
    if (isOpen) {
      if (editingView) {
        const f = editingView.filters;
        reset({
          title: editingView.title,
          filters: {
            rating: f.rating,
            ratingIs: f.ratingIs,
            ratingStart: f.ratingStart,
            ratingEnd: f.ratingEnd,
            year: f.year,
            yearIs: f.yearIs || '',
            yearStart: f.yearStart || '',
            yearEnd: f.yearEnd || '',
            type: f.type,
            typeValues: f.typeValues || [],
            artist: f.artist,
            artistValues: f.artistValues || [],
            genre: f.genre,
            genreValues: f.genreValues || [],
            tag: f.tag,
            tagValues: f.tagValues || [],
          },
        });
        setRatingEnabled(!!f.rating);
        setYearEnabled(!!f.year);
        setTypeEnabled(!!f.type);
        setArtistEnabled(!!f.artist);
        setGenreEnabled(!!f.genre);
        setTagEnabled(!!f.tag);
      } else {
        reset({
          title: '',
          filters: {
            rating: undefined,
            ratingIs: undefined,
            ratingStart: undefined,
            ratingEnd: undefined,
            year: undefined,
            yearIs: '',
            yearStart: '',
            yearEnd: '',
            type: undefined,
            typeValues: [],
            artist: undefined,
            artistValues: [],
            genre: undefined,
            genreValues: [],
            tag: undefined,
            tagValues: [],
          },
        });
        setRatingEnabled(false);
        setYearEnabled(false);
        setTypeEnabled(false);
        setArtistEnabled(false);
        setGenreEnabled(false);
        setTagEnabled(false);
      }
    }
  }, [isOpen, editingView, reset]);

  const onSubmit = async (data: UserCollectionViewDto) => {
    if (editingView) {
      await updateView({
        id: editingView.id,
        title: data.title,
        filters: data.filters,
      });
    } else {
      await createView({
        title: data.title,
        filters: data.filters,
      });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={editingView ? 'Edit Collection View' : 'Add Collection View'}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <Stack gap="sm">
            <label css={{ fontWeight: 'bold' }}>Title</label>
            <Input {...register('title')} placeholder="Title" required />
          </Stack>
          <FormInputError error={errors.title} />

          <Typography size="body-bold">Filters</Typography>

          {/* Rating Filter */}
          <Checkbox
            name="ratingEnabled"
            label="Rating"
            value={ratingEnabled}
            onChange={(checked) => {
              setRatingEnabled(checked);
              if (!checked) {
                setValue('filters.rating', undefined);
                setValue('filters.ratingIs', undefined);
                setValue('filters.ratingStart', undefined);
                setValue('filters.ratingEnd', undefined);
              } else {
                setValue('filters.rating', RatingFilterEnum.is);
              }
            }}
          />
          {ratingEnabled && (
            <div>
              <Stack gap="sm">
                <Controller
                  name="filters.rating"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={ratingFilterOptions.find(
                        (opt) => opt.value === field.value,
                      )}
                      onChange={(selected: SelectOption) => {
                        field.onChange(selected.value);
                        setValue('filters.ratingIs', undefined);
                        setValue('filters.ratingStart', undefined);
                        setValue('filters.ratingEnd', undefined);
                      }}
                      options={ratingFilterOptions}
                    />
                  )}
                />
                {RatingFilterEnum.is ===
                  (ratingType || RatingFilterEnum.is) && (
                  <Controller
                    name="filters.ratingIs"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={
                          field.value !== undefined ? field.value / 10 : ''
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val ? Number(val) * 10 : undefined);
                        }}
                        placeholder="Rating (0.0 - 10.0)"
                      />
                    )}
                  />
                )}
                {[
                  RatingFilterEnum.isgreaterthan,
                  RatingFilterEnum.inrange,
                ].includes(ratingType || RatingFilterEnum.is) && (
                  <Controller
                    name="filters.ratingStart"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={
                          field.value !== undefined ? field.value / 10 : ''
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val ? Number(val) * 10 : undefined);
                        }}
                        placeholder="Start Rating (0.0 - 10.0)"
                      />
                    )}
                  />
                )}
                {[
                  RatingFilterEnum.islessthan,
                  RatingFilterEnum.inrange,
                ].includes(ratingType || RatingFilterEnum.is) && (
                  <Controller
                    name="filters.ratingEnd"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={
                          field.value !== undefined ? field.value / 10 : ''
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val ? Number(val) * 10 : undefined);
                        }}
                        placeholder="End Rating (0.0 - 10.0)"
                      />
                    )}
                  />
                )}
              </Stack>
            </div>
          )}

          {/* Year Filter */}
          <Checkbox
            name="yearEnabled"
            label="Year"
            value={yearEnabled}
            onChange={(checked) => {
              setYearEnabled(checked);
              if (!checked) {
                setValue('filters.year', undefined);
                setValue('filters.yearIs', undefined);
                setValue('filters.yearStart', undefined);
                setValue('filters.yearEnd', undefined);
              } else {
                setValue('filters.year', YearFilterEnum.is);
              }
            }}
          />
          {yearEnabled && (
            <div>
              <Stack gap="sm">
                <Controller
                  name="filters.year"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={yearFilterOptions.find(
                        (opt) => opt.value === field.value,
                      )}
                      onChange={(selected: SelectOption) => {
                        field.onChange(selected.value);
                        setValue('filters.yearIs', undefined);
                        setValue('filters.yearStart', undefined);
                        setValue('filters.yearEnd', undefined);
                      }}
                      options={yearFilterOptions}
                      placeholder="Compare type"
                    />
                  )}
                />
                {yearType === YearFilterEnum.is && (
                  <Input
                    type="text"
                    pattern="\d{4}"
                    {...register('filters.yearIs')}
                    placeholder="Year (YYYY)"
                  />
                )}
                {[YearFilterEnum.isafter, YearFilterEnum.inrange].includes(
                  yearType || YearFilterEnum.is,
                ) && (
                  <Input
                    type="text"
                    pattern="\d{4}"
                    {...register('filters.yearStart')}
                    placeholder={
                      yearType === YearFilterEnum.isafter
                        ? 'After Year (YYYY)'
                        : 'Start Year (YYYY)'
                    }
                  />
                )}
                {[YearFilterEnum.isbefore, YearFilterEnum.inrange].includes(
                  yearType || YearFilterEnum.is,
                ) && (
                  <Input
                    type="text"
                    pattern="\d{4}"
                    {...register('filters.yearEnd')}
                    placeholder={
                      yearType === YearFilterEnum.isbefore
                        ? 'Before Year (YYYY)'
                        : 'End Year (YYYY)'
                    }
                  />
                )}
              </Stack>
            </div>
          )}

          {/* Type Filter */}
          <Checkbox
            name="typeEnabled"
            label="Type"
            value={typeEnabled}
            onChange={(checked) => {
              setTypeEnabled(checked);
              if (!checked) {
                setValue('filters.type', undefined);
                setValue('filters.typeValues', undefined);
              } else {
                setValue('filters.type', MultiValueFilterEnum.isanyof);
              }
            }}
          />
          {typeEnabled && (
            <div>
              <Stack gap="sm">
                <Controller
                  name="filters.type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={multiValueFilterOptions.find(
                        (opt) => opt.value === field.value,
                      )}
                      onChange={(selected: SelectOption) => {
                        field.onChange(selected.value);
                        setValue('filters.typeValues', undefined);
                      }}
                      options={multiValueFilterOptions}
                    />
                  )}
                />
                <Controller
                  name="filters.typeValues"
                  control={control}
                  render={({ field }) => (
                    <Select
                      isMulti
                      value={(field.value || []).map((v) =>
                        ReleaseTypeOptions2.find((opt) => opt.value === v),
                      )}
                      onChange={(selected: SelectOption[]) =>
                        field.onChange(
                          (selected || []).map((s: any) => s.value),
                        )
                      }
                      options={ReleaseTypeOptions2}
                      placeholder="Select types..."
                    />
                  )}
                />
              </Stack>
            </div>
          )}

          {/* Artist Filter */}
          <Checkbox
            name="artistEnabled"
            label="Artist"
            value={artistEnabled}
            onChange={(checked) => {
              setArtistEnabled(checked);
              if (!checked) {
                setValue('filters.artist', undefined);
                setValue('filters.artistValues', undefined);
              } else {
                setValue('filters.artist', MultiValueFilterEnum.isanyof);
              }
            }}
          />
          {artistEnabled && (
            <div>
              <Stack gap="sm">
                <Controller
                  name="filters.artist"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={multiValueFilterOptions.find(
                        (opt) => opt.value === field.value,
                      )}
                      onChange={(selected: SelectOption) => {
                        field.onChange(selected.value);
                        setValue('filters.artistValues', undefined);
                      }}
                      options={multiValueFilterOptions}
                    />
                  )}
                />
                <Controller
                  name="filters.artistValues"
                  control={control}
                  render={({ field }) => (
                    <SelectArtist
                      isMulti
                      value={field.value || []}
                      onChange={(val: any) => field.onChange(val || [])}
                      placeholder="Select artists..."
                    />
                  )}
                />
              </Stack>
            </div>
          )}

          {/* Genre Filter */}
          <Checkbox
            name="genreEnabled"
            label="Genre"
            value={genreEnabled}
            onChange={(checked) => {
              setGenreEnabled(checked);
              if (!checked) {
                setValue('filters.genre', undefined);
                setValue('filters.genreValues', undefined);
              } else {
                setValue('filters.genre', MultiValueFilterEnum.isanyof);
              }
            }}
          />
          {genreEnabled && (
            <div>
              <Stack gap="sm">
                <Controller
                  name="filters.genre"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={multiValueFilterOptions.find(
                        (opt) => opt.value === field.value,
                      )}
                      onChange={(selected: SelectOption) => {
                        field.onChange(selected.value);
                        setValue('filters.genreValues', undefined);
                      }}
                      options={multiValueFilterOptions}
                    />
                  )}
                />
                <Controller
                  name="filters.genreValues"
                  control={control}
                  render={({ field }) => (
                    <SelectGenres
                      isMulti
                      value={field.value || []}
                      onChange={(val: any) =>
                        field.onChange((val as string[]) || [])
                      }
                      placeholder="Select genres..."
                    />
                  )}
                />
              </Stack>
            </div>
          )}

          {/* Tag Filter */}
          <Checkbox
            name="tagEnabled"
            label="Tag"
            value={tagEnabled}
            onChange={(checked) => {
              setTagEnabled(checked);
              if (!checked) {
                setValue('filters.tag', undefined);
                setValue('filters.tagValues', undefined);
              } else {
                setValue('filters.tag', MultiValueFilterEnum.isanyof);
              }
            }}
          />
          {tagEnabled && (
            <div>
              <Stack gap="sm">
                <Controller
                  name="filters.tag"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={multiValueFilterOptions.find(
                        (opt) => opt.value === field.value,
                      )}
                      onChange={(selected: SelectOption) => {
                        field.onChange(selected.value);
                        setValue('filters.tagValues', undefined);
                      }}
                      options={multiValueFilterOptions}
                    />
                  )}
                />
                <Controller
                  name="filters.tagValues"
                  control={control}
                  render={({ field }) => (
                    <Select
                      isMulti
                      value={(field.value || []).map((v) =>
                        tagOptions.find((opt) => opt.value === v),
                      )}
                      onChange={(selected: SelectOption[]) =>
                        field.onChange(
                          (selected || []).map((s: any) => s.value),
                        )
                      }
                      options={tagOptions}
                      placeholder="Select tags..."
                    />
                  )}
                />
              </Stack>
            </div>
          )}

          <FormInputError error={errors.filters?.ratingIs} />
          <FormInputError error={errors.filters?.ratingStart} />
          <FormInputError error={errors.filters?.ratingEnd} />
          <FormInputError error={errors.filters?.yearIs} />
          <FormInputError error={errors.filters?.yearStart} />
          <FormInputError error={errors.filters?.yearEnd} />
          <FormInputError error={errors.filters?.typeValues} />
          <FormInputError error={errors.filters?.artistValues} />
          <FormInputError error={errors.filters?.genreValues} />
          <FormInputError error={errors.filters?.tagValues} />

          <Group justify="end" gap="md">
            <Button type="button" variant="text" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="main"
              disabled={isCreating || isUpdating}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </form>
    </Dialog>
  );
};
