import { IconDots } from '@tabler/icons-react';
import { useState } from 'react';
import { Stack } from '../../../components/flex/stack';
import { IconButton } from '../../../components/icon-button';
import { Popover } from '../../../components/popover';
import { useAuth } from '../../account/useAuth';
import { AddToList } from './add-to-list';
import { RatingPopoverContent } from './rating-action';
import dayjs from 'dayjs';
import { Group } from '../../../components/flex/group';
import { EntryAction } from './entry-action';

export interface ReleaseActionsProps {
  id: string;
  date: string;
}

const ReleaseActionsPopoverContent: React.FC<
  ReleaseActionsProps & {
    onDragStart?: () => void;
    onDragEnd?: () => void;
  }
> = ({ id, date, onDragStart, onDragEnd }) => {
  const isUnreleased = dayjs(date).isAfter(dayjs());
  return (
    <Stack>
      {!isUnreleased && (
        <RatingPopoverContent
          releaseId={id}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <EntryAction releaseId={id} />
        </RatingPopoverContent>
      )}
    </Stack>
  );
};

export const ReleaseActions = ({ id, date }: ReleaseActionsProps) => {
  const { isLoggedIn } = useAuth();

  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!isLoggedIn) {
    return <div></div>;
  }

  const handleClose = () => {
    if (!isDragging) {
      setOpen(false);
    }
  };

  return (
    <Group>
      <AddToList releaseId={id} />
      <Popover
        open={open}
        onClose={handleClose}
        content={
          <ReleaseActionsPopoverContent
            id={id}
            date={date}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          />
        }
      >
        <IconButton title="" onClick={() => setOpen(!open)}>
          <IconDots />
        </IconButton>
      </Popover>
    </Group>
  );
};

export default ReleaseActions;
