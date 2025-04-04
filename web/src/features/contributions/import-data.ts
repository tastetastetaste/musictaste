import { api } from '../../utils/api';
import { UseFormSetValue } from 'react-hook-form';
import { EditReleaseFormValues } from './edit-release-page';
import { CreateReleaseFormValues } from './add-release-page';

function isValidHttpUrl(string: string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url;
}

const getDataFromMusicBrainz = async (id: string) => {
  const url = isValidHttpUrl(id);

  const mbid = url ? url.pathname.split('release/')[1] : id;

  const release = await api.getMusicBrainzRelease(mbid);

  return release;
};

export const importFromMusicBrainz = async (
  values: EditReleaseFormValues | CreateReleaseFormValues,
  setValue:
    | UseFormSetValue<EditReleaseFormValues>
    | UseFormSetValue<CreateReleaseFormValues>,
) => {
  if (!values.mbid) return;

  const data = await getDataFromMusicBrainz(values.mbid);

  !values.imageUrl &&
    !values.image &&
    data.imageUrl &&
    setValue('imageUrl', data.imageUrl, { shouldDirty: true });

  !values.title &&
    data.title &&
    setValue('title', data.title, { shouldDirty: true });

  !values.date &&
    data.date &&
    setValue('date', data.date, { shouldDirty: true });

  setValue('tracks', data.tracks, { shouldDirty: true });

  setValue('note', values.mbid);

  return `artist:
  - ${data.artists.map((a) => `${a.name}`).join('\n- ')}
  label:
  - ${data.labels.map((l) => `${l.name}`).join('\n- ')}
  `;
};
