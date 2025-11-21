import { ArtistType } from 'shared';

export const ReleaseTypeOptions = [
  { value: 'LP', label: 'LP' },
  { value: 'EP', label: 'EP' },
  { value: 'Mixtape', label: 'Mixtape' },
  { value: 'Single', label: 'Single' },
  { value: 'Live', label: 'Live' },
  { value: 'Remix', label: 'Remix' },
  { value: 'Instrumental', label: 'Instrumental' },
  { value: 'Compilation', label: 'Compilation' },
  { value: 'Cover', label: 'Cover' },
  { value: 'Soundtrack', label: 'Soundtrack' },
  { value: 'DJMix', label: 'DJ Mix' },
  { value: 'Unofficial', label: 'Unofficial' },
  { value: 'Video', label: 'Video' },
  { value: 'Reissue', label: 'Reissue' },
  { value: 'Other', label: 'Other' },
];

export const ArtistTypeOptions = [
  { value: ArtistType.Person, label: 'Person' },
  { value: ArtistType.Group, label: 'Group' },
];
