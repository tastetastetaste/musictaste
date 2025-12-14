import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { ArtistType, CreateArtistDto, getArtistPath } from 'shared';
import { Button } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Stack } from '../../components/flex/stack';
import { FormInputError } from '../../components/inputs/form-input-error';
import { Input } from '../../components/inputs/input';
import { Select } from '../../components/inputs/select';
import { Link } from '../../components/links/link';
import { Typography } from '../../components/typography';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { ArtistTypeOptions } from './shared';
import { Textarea } from '../../components/inputs/textarea';
import { SelectSingleArtist } from './select-single-artist';
import { SelectGroupArtist } from './select-group-artist';
import { SelectArtist } from './select-artist';

export interface CreateArtistFormValues extends CreateArtistDto {
  mainArtist: { value: string; label: string };
  relatedArtists: { value: string; label: string }[];
}

const CreateArtistDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const qc = useQueryClient();

  const defaultValues = {
    name: '',
    nameLatin: '',
    type: ArtistType.Person,
    disambiguation: '',
    relatedArtists: [],
    mainArtistId: '',
    note: '',
  };

  const {
    handleSubmit,
    register,
    control,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateArtistFormValues>({
    resolver: classValidatorResolver(CreateArtistDto),
    defaultValues,
  });

  const { mutateAsync, isLoading, data } = useMutation(api.createArtist, {
    onSuccess: () => {
      qc.invalidateQueries(
        cacheKeys.searchKey({
          type: ['artists'],
        }),
      );
      reset(defaultValues);
    },
  });

  const createArtist = async (data: CreateArtistDto) => {
    mutateAsync(data);
  };

  const artistType = watch('type');

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add Artist/Band">
      <form
        onSubmit={handleSubmit(createArtist)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
      >
        <Stack gap="sm">
          <Controller
            name="type"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <Select
                {...field}
                options={ArtistTypeOptions}
                placeholder="Type"
                value={ArtistTypeOptions.find((c) => c.value === value) || null}
                onChange={(val: { value: number; label: string }) =>
                  onChange(val.value)
                }
              />
            )}
          />
          <FormInputError error={errors.type} />
          <Input placeholder="Name" {...register('name')} />
          <FormInputError error={errors.name} />
          <Input
            placeholder="English / Latin-script name (if applicable)"
            {...register('nameLatin')}
          />
          <FormInputError error={errors.nameLatin} />
          {artistType !== ArtistType.Alias && (
            <>
              <Input
                placeholder="Disambiguation"
                {...register('disambiguation')}
              />
              <FormInputError error={errors.disambiguation} />
            </>
          )}
          {artistType === ArtistType.Group && (
            <>
              <SelectGroupArtist control={control} register={register} />
              <FormInputError error={errors.groupArtists} />
            </>
          )}
          {artistType !== ArtistType.Alias && (
            <>
              <Controller
                name="relatedArtists"
                control={control}
                render={({ field }) => (
                  <SelectArtist
                    {...field}
                    placeholder="Related Artists"
                    filterCondition={(a) => a.type !== ArtistType.Alias}
                    updateArtistsIds={(value) =>
                      setValue('relatedArtistsIds', value)
                    }
                  />
                )}
              />
              <FormInputError error={errors.relatedArtists} />
            </>
          )}
          {artistType === ArtistType.Alias && (
            <>
              <Controller
                name="mainArtist"
                control={control}
                render={({ field }) => (
                  <SelectSingleArtist
                    {...field}
                    updateMainArtistId={(value) =>
                      setValue('mainArtistId', value)
                    }
                  />
                )}
              />
              <FormInputError
                error={errors.mainArtist || errors.mainArtistId}
              />
            </>
          )}
          <Textarea {...register('note')} placeholder="Note/source" rows={2} />
          <FormInputError error={errors.note} />
          <Button variant="main" type="submit" disabled={isLoading}>
            Submit
          </Button>
        </Stack>
      </form>
      <div>
        {data?.message && <Typography>{data.message}</Typography>}
        {data?.artist && (
          <Link to={getArtistPath({ artistId: data.artist.id })}>
            {' '}
            {getArtistPath({ artistId: data.artist.id })}
          </Link>
        )}
      </div>
    </Dialog>
  );
};

export default CreateArtistDialog;
