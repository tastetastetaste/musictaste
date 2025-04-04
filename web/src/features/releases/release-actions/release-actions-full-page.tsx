import dayjs from 'dayjs';
import { Group } from '../../../components/flex/group';
import { useAuth } from '../../account/useAuth';
import { AddToList } from './add-to-list';
import { EntryAction } from './entry-action';
import { RatingAction } from './rating-action';
import { ReviewAction } from './review-action';
import { TagsAction } from './tags-action';

export const ReleaseActionsFullPage = ({
  id,
  date,
}: {
  id: string;
  date: string;
}) => {
  const { isLoggedIn } = useAuth();
  const isUnreleased = dayjs(date).isAfter(dayjs());

  if (!isLoggedIn) {
    return <div></div>;
  }

  return (
    <Group gap="sm">
      {!isUnreleased && (
        <>
          <EntryAction releaseId={id} />
          <RatingAction releaseId={id} />
          <TagsAction releaseId={id} />
          <ReviewAction releaseId={id} />
        </>
      )}
      <AddToList releaseId={id} />
    </Group>
  );
};
