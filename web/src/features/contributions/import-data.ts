import { api } from '../../utils/api';
import { UseFormSetValue } from 'react-hook-form';
import { EditReleaseFormValues } from './edit-release-page';
import { CreateReleaseFormValues } from './add-release-page';
import { millisecondsToTimeString } from './release-tracks-fields';

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

  if (!data) return 'Release not found';

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

  if (!values.tracks || values.tracks?.length === 0) {
    setValue('tracks', data.tracks, { shouldDirty: true });
  }

  setValue('note', values.mbid);

  return `Please manually check and update these fields as needed:

artist:
- ${data.artists.map((a) => `${a.name}`).join('\n- ')}

label:
- ${data.labels.map((l) => `${l.name}`).join('\n- ')}

${
  !values.tracks || values.tracks?.length === 0
    ? ''
    : `tracks:\n- ${data.tracks.map((t) => `${t.track} | ${t.title} | ${millisecondsToTimeString(t.durationMs)}`).join('\n- ')}`
}`;
};
